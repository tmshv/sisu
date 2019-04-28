# -*- coding: utf-8 -*-

import os
import json

import rhinoscriptsyntax as rs

FILE_INPUT = '~/Desktop/sisu_task.json'
FILE_OUTPUT = '~/Desktop/sisu_task_result.json'


def open_file(path):
    rs.DocumentModified(False)
    return rs.Command('_-Open "{}" _Enter'.format(path))


def get_config():
    task_file = os.path.expanduser(FILE_INPUT)
    with open(task_file, 'r') as f:
        data = f.read()
        return json.loads(data)


def save_result(result):
    result_file = os.path.expanduser(FILE_OUTPUT)
    with open(result_file, 'wb') as f:
        data = json.dumps(result, ensure_ascii=False, indent=4)
        d = data.encode('utf-8')
        f.write(d)


def script_start():
    pass


def script_end():
    rs.DocumentModified(False)
    rs.Exit()
