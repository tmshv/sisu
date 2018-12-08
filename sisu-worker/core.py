import os
import json
from glob import glob
import subprocess


def save_rhino_task_file(task):
    task_file = os.path.expanduser('~/Desktop/sisu_task.json')
    with open(task_file, 'w') as f:
        data = json.dumps(task, indent=4, ensure_ascii=False)
        f.write(data)


def read_rhino_result_file():
    result_file = os.path.expanduser('~/Desktop/sisu_task_result.json')
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
    filename = message['payload']['filename']
    tests = message['payload']['tests']
    
    save_rhino_task_file({
        'tests': tests,
    })
    subprocess.call('cscript run.vbs "{f}"'.format(f=filename))

    return read_rhino_result_file()


def handle_message(message):
    action = message['action']

    if action == 'FILE_TREE.UPDATE':
        return handle_file_tree_update(message)
    elif action == 'FILE.TEST':
        return handle_file_test(message)
    else:
        return None
