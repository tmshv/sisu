import os
import json
import time
from glob import glob
import subprocess
from api import api_init, api_set_project_file_tests, api_get_file_metadata, api_get_file_content


def get_env_dir():
    return os.path.expanduser('~/Desktop/sisu_run')


def create_path(base_dir, filename):
    x = os.path.join(base_dir, filename)
    return os.path.normpath(x)


def setup_environment(message, options):
    payload = message['payload']
    file_ids = [
        payload['fileId']
    ]

    env_dir = options['env_dir']
    # os.makedirs(env_dir, exist_ok=True)

    result = {
        'file_meta': {},
        'file_local': {},
    }

    for file_id in file_ids:
        file_meta = api_get_file_metadata(file_id)
        if not file_meta:
            return {
                'error': 'file not found',
            }

        filename = file_meta['filename']
        local_path = create_path(env_dir, os.path.basename(filename))

        result['file_meta'][file_id] = file_meta
        result['file_local'][file_id] = local_path

        content = api_get_file_content(file_id)

        with open(local_path, 'wb') as f:
            f.write(content)
    return result


def get_script_path(filename):
    return os.path.join(os.getcwd(), filename)


def resolve_filepath(filepath):
    x = os.path.expanduser(filepath)
    return os.path.normpath(x)


def save_rhino_task_file(task):
    task_file = resolve_filepath('~/Desktop/sisu_task.json')
    with open(task_file, 'w') as f:
        data = json.dumps(task, indent=4, ensure_ascii=False)
        f.write(data)


def read_rhino_result_file():
    result_file = resolve_filepath('~/Desktop/sisu_task_result.json')
    if not os.path.isfile(result_file):
        return None

    with open(result_file, 'r') as f:
        data = f.read()
        return json.loads(data)


def rhino_run(script, params):
    save_rhino_task_file(params)

    subprocess.call(f'cscript run.vbs "{script}"')

    return read_rhino_result_file()


def get_hash(filepath):
    import hashlib
    sha = hashlib.sha256()
    with open(filepath, 'rb') as f:
        data = f.read()
        sha.update(data)
    return sha.hexdigest()


def get_file_info(filepath):
    return {
        'file': filepath,
        'type': 'application/acad',
        'hash': get_hash(filepath),
    }


def get_file_tree(patterns):
    files = []
    for x in patterns:
        files += glob(x)
    return [get_file_info(x) for x in files]


def handle_file_tree_update(message):
    mask = message['payload']['mask']
    patterns = mask if isinstance(mask, list) else [mask]
    files = get_file_tree(patterns)

    return files


def handle_file_preview(message):
    payload = message['payload']
    
    token = payload['token']
    api_init(token)

    env_dir = get_env_dir()
    file_id = payload['fileId']
    env_options = {
        'env_dir': env_dir,
    }
    env = setup_environment(message, env_options)

    print(f'> make capture {file_id}')
    print('env:', env)

    script = get_script_path('capture.py')
    params = {
        **payload,
        'filename': env['file_local'][file_id],
        'outputDir': env_dir,
    }

    return rhino_run(script, params)


def handle_file_test(message):
    payload = message['payload']
    
    token = payload['token']
    api_init(token)

    env_dir = get_env_dir()
    file_id = payload['fileId']
    env_options = {
        'env_dir': env_dir,
    }
    env = setup_environment(message, env_options)

    filename = env['file_meta'][file_id]['filename']

    print(f'> testing {filename}')
    print('env:', env)

    script = get_script_path('test.py')
    params = {
        'filename': env['file_local'][file_id],
        'tests': payload['tests']
    }
    result = rhino_run(script, params)

    # tests = result['tests']
    # res = api_set_project_file_tests(payload['projectId'], payload['fileId'], tests)

    return result


def handle_system_ping(message):
    payload = message['payload']
    t = payload['sleep']
    time.sleep(t)

    return {
        'message': 'pong',
        'source': message,
    }


def create_handler():
    return {
        'SYSTEM.PING': handle_system_ping,
        'FILE_TREE.UPDATE': handle_file_tree_update,
        'FILE.TEST': handle_file_test,
        'FILE.PREVIEW': handle_file_preview,
    }


def get_error(message):
    return {
        'error': message,
    }


def handle_message(handler, message):
    import traceback

    action = message['action']

    if action not in handler:
        return get_error(f'Action {action} not found')

    try:
        return handler[action](message)
    except Exception as e:
        print(e)
        print(traceback.format_exc())

        return get_error(str(e))
