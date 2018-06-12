import os
import sys
from datetime import datetime

import rhinoscriptsyntax as rs
import scriptcontext as sc
import Rhino

from notify import EmailService

class LogService:
    def init(self, data):
        self.base_dir = data['dirpath']
        self.filename_pattern = data['filenamePattern']

    def create_filepath(self, task):
        env = task.get_env()
        filename = self.filename_pattern.format(**env)
        fullpath = os.path.join(self.base_dir, filename)
        return os.path.normpath(fullpath)

email = EmailService()
log_service = LogService()
log_data = []

def log(data):
    print(data)
    log_data.append(data)

def clear_log():
    log_data = []

#path = '"D:\\TEMP\\test.stl"'
#
#rs.DocumentModified(False)
#rs.Command('_-Open {} _Enter'.format(path))

#f = open('C:\\Desktop\\DWG_TEST\\out.txt', 'w')
# f = open('C:\\Users\\Mini\\Desktop\\DWG_TEST\\out.txt', 'w')
# f.write('hi')
# f.close()

def get_layer(name):
    i = sc.doc.Layers.FindName(name)
    return i
#    i = sc.doc.Layers.FindByFullPath(name, True)
#    return sc.doc.Layers[i] if i >= 0 else None

def get_objects_by_layer(layer_name):
    return sc.doc.Objects.FindByLayer(layer_name)

def get_geometry_by_layer(layer_name):
    objs = get_objects_by_layer(layer_name)
    if not objs:
        return []
    return [x for x in objs if not isinstance(x, Rhino.DocObjects.InstanceObject)]

def t(v):
    return 'Passed' if v else 'Failed'
#    return 'Yes' if v else 'No'

def test_layer0():
    log('Test: layer 0 should be empty')
    
    objs = get_objects_by_layer('0')
    
    if not objs or len(objs) == 0:
        return True
        
    if isinstance(objs[0], Rhino.DocObjects.InstanceObject):
        return True
        
    return False

def test_layer_exist(layer_name):
    log('Test: layer {} should exist'.format(layer_name))

    layer = get_layer(layer_name)

    return True if layer else False

def test_is_layer_empty(layer_name):
    log('Test: layer {} should be empty'.format(layer_name))

    objs = get_geometry_by_layer(layer_name)

    if len(objs) == 0:
        return True

    return False

def test_is_layer_not_empty(layer_name):
    log('Test: layer {} should not be empty'.format(layer_name))

    geom = get_geometry_by_layer(layer_name)

    if len(geom) == 0:
        return False

    return True

def test_is_curve_closed(layer_name):
    log('Test: curves on layer {} should be closed'.format(layer_name))

    for x in get_geometry_by_layer(layer_name):
        valid = rs.IsCurveClosed(x)    
        if not valid:
            return False
    return True


def open_file(path):
    rs.DocumentModified(False)
    rs.Command('_-Open {} _Enter'.format(path))


def test_factory(test):
    name = test['name']
    d = {
        'layerExist': test_layer_exist,
        'emptyLayer': test_is_layer_empty,
        'notEmptyLayer': test_is_layer_not_empty,
        'geometryClosed': test_is_curve_closed,
    }
    return d[name]

def run_task(task):
    clear_log()
    log_service.init(task.log)

    log(task.name)
    log('=' * 30)
    log('Date: %s' % task.date.strftime("%d.%m.%Y %H:%M:%S"))
    log('')
    
    for filepath in task.file():
        log('.' * 80)
        log('File: {}'.format(filepath))
        log('')

        open_file(filepath)

        for test in task.test():
            name = test['name']
            test_fn = test_factory(test)
#            print(test)
            
            status = test_fn(test['layer'])
            task.update_status(status)
            log(t(status))
            log('')

    log('-' * 50)
    log('Status: {}'.format(t(task.get_status())))

    if task.get_status():
        log('You passed the test successfully. Mission acomplished.')
    else:
        log('You failed the test and should be destroyed.')
    log('')

    log('Log: {}'.format(log_service.create_filepath(task)))
    log('')

    notify_task(task, log_data)

def notify_task(task, content):
    env = task.get_env()
    subject = task.notify['email']['subject'].format(**env)
    emails = task.notify['email']['emails']
    msg = '\n'.join(log_data)

    send_email(emails, subject, msg)    

def send_email(emails, subject, body):
    email.send(emails, subject, body)

def get_config():
    import json
    return json.load(open('config.json', 'rb'))

def taskFactory(config, data):
    from glob import glob
    from copy import copy

    def u(s):
        return s.replace(' ', '_')

    def split_tests(tests):
        def t(test, layer):
            t = copy(test)
            t['layer'] = layer
            return t

        result = []
        for test in tests:
            if 'layer' in test and isinstance(test['layer'], list):
                result += [t(test, x) for x in test['layer']]
            else:
                result.append(test)
        return result

    def get_log(log):
        if isinstance(log, dict):
            return log
        else:
            return config['def']['log']

    task = {
        'name': data['name'],
        'input': data['input'],
        'tests': split_tests(data['test']),
        'log': get_log(data['log']),
        'notify': data['notify'],
    }
    
    class Task:
        def __init__(self, name, input, tests, log, notify):
            self.current_file = None
            self.date = datetime.now()
            self.status = True

            self.name = name
            self.input = input
            self.tests = tests
            self.log = log
            self.notify = notify

        def get_status(self):
            return self.status

        def update_status(self, value):
            if not self.status:
                return
            self.status = value

        def get_files(self):
            files = []
            for pattern in self.input:
                files += glob(pattern)
            files = [os.path.normpath(x) for x in files]
            return list(set(files))

        def file(self):
            files = self.get_files()
            for x in files:
                self.current_file = x
                yield x
                
        def test(self):
            for x in self.tests:
                yield x
                
        def get_env(self):
            dirname = os.path.dirname(self.current_file)
            filename = os.path.basename(self.current_file)
            file, ext = os.path.splitext(filename)

            return {
                'year': self.date.year,
                'month': self.date.strftime('%m'),
                'day': self.date.strftime('%d'),
                'hour': self.date.strftime('%H'),
                'minute': self.date.strftime('%M'),
                'task': self.name,
                'dir': dirname,
                'file': file,
                'ext': ext,
                'filename': filename,
                'fullpath': self.current_file,
                'status': t(self.status),
                'utask': u(self.name),
                'udir': u(dirname),
                'ufile': u(file),
                'ufilename': u(filename),
                'ufullpath': u(self.current_file),
            }

    return Task(**task)


def get_tasks(config):
    return list(map(lambda x : taskFactory(config, x), config['tasks']))


def main():
    config = get_config()
    email.init(**config['notify']['email'])
    tasks = get_tasks(config)

    for task in tasks:
        run_task(task)

    # import testIsCurvesClosed as test
    # test.run('asdf')
    


main()