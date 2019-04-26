import os
import json
import time
from glob import glob
import subprocess
from api import api_init, api_set_project_file_tests


def get_test_script_path():
    return os.path.join(os.getcwd(), 'test.py')


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


def handle_file_test(message):
    payload = message['payload']
    filename = payload['filename']
    filename = os.path.normpath(filename)

    print(f'> testing {filename}')

    if not os.path.isfile(filename):
        return {
            'error': 'file not found',
        }

    api_init(payload['token'])
    testfile = get_test_script_path()   
    save_rhino_task_file(payload)
    subprocess.call(f'cscript run.vbs "{testfile}"')

    result = read_rhino_result_file()

    tests = result['tests']
    res = api_set_project_file_tests(payload['projectId'], payload['fileId'], tests)
    print(res)

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
    }


def handle_message(handler, message):
    action = message['action']

    if action in handler:
        return handler[action](message)
    else:
        return None
