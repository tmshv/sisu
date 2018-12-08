import os
import json
from glob import glob


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


def handle_message(message):
    action = message['action']

    if action == 'FILE_TREE.UPDATE':
        return handle_file_tree_update(message)
    else:
        return None
