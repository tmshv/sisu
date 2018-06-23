# -*- coding: utf-8 -*-

import os
import sys
import re
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

# def get_layer(name):
#     return sc.doc.Layers.FindName(name)

def get_layer(name):
    layer = sc.doc.Layers.FindByFullPath(name, True)
    if layer >= 0:
        return sc.doc.Layers[layer]
    return None

def get_layer_names():
    return [x.Name for x in sc.doc.Layers]

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

def test_layer_name_match(options):
    lns = [x.Name for x in sc.doc.Layers]
    ptr = re.compile(options['regexp'])
    ignore = options['ignore']

    s = True
    for x in sc.doc.Layers:
        name = x.Name
        ignored = name in ignore

        if not ignored and not ptr.match(name):
            log('Not match: {}'.format(name))
            s = False
    return s

def test_is_curve_planar(options):
    layer_name = options['layer']
    
    log('Test: curves on layer {} should be planar'.format(layer_name))
    
    objs = get_geometry_by_layer(layer_name)
    for x in objs:
        if not rs.IsCurvePlanar(x.Id):
            return False
    return True


def test_is_polyline(options):
    layer_name = options['layer']
    
    log('Test: objects on layer {} should be polyline'.format(layer_name))
    
    objs = get_geometry_by_layer(layer_name)
    for x in objs:
        if not rs.IsPolyline(x.Id):
            return False
    return True

def test_layer_exist(options):
    layer_name = options['layer']
    log('Test: layer {} should exist'.format(layer_name))

    layer = get_layer(layer_name)

    return bool(layer)

def test_is_layer_empty(options):
    layer_name = options['layer']
    log('Test: layer {} should be empty'.format(layer_name))

    return rs.IsLayer(layer_name) and rs.IsLayerEmpty(layer_name)

def test_is_layer_not_empty(options):
    layer_name = options['layer']
    log('Test: layer {} should not be empty'.format(layer_name))

    return rs.IsLayer(layer_name) and not rs.IsLayerEmpty(layer_name)

def test_is_curve_closed(options):
    layer_name = options['layer']
    geom = get_geometry_by_layer(layer_name)
    if len(geom) == 0:
        return None

    log('Test: curves on layer {} should be closed'.format(layer_name))

    for x in geom:
        valid = rs.IsCurveClosed(x)    
        if not valid:
            return False
    return True
    

def test_layer_consistency(options):
    layer_name = options['layer']
    types = options['types']
    log('Test: geometry on layer {layer} should be one of type: {types}'.format(
        layer=layer_name,
        types=','.join(types)
    ))
    return True


def open_file(path):
    rs.DocumentModified(False)
    rs.Command('_-Open "{}" _Enter'.format(path))


def test_factory(test):
    name = test['name']
    d = {
        'layerExist': test_layer_exist,
        'emptyLayer': test_is_layer_empty,
        'notEmptyLayer': test_is_layer_not_empty,
        'geometryClosed': test_is_curve_closed,
        'layerConsistency': test_layer_consistency,
        'isCurvePlanar': test_is_curve_planar,
        'isPolyline': test_is_polyline,
        'layerNameMatch': test_layer_name_match,
    }

    return d[name]

def run_task(task):
    clear_log()
    log_service.init(task.log)

    log(task.name)
    log('=' * 30) 
    log('Date: %s' % task.date.strftime("%d.%m.%Y %H:%M:%S"))
    log('App: %s' % Rhino.RhinoApp.Name)
    log('App version %s' % Rhino.RhinoApp.Version)
    log('')
    
    for filepath in task.file():
        log('.' * 80)
        log('File: {}'.format(filepath))
        log('')

        open_file(filepath)
        layer_names = get_layer_names()
        task.generate_tests(layer_names)

        for test in task.test():
            test_fn = test_factory(test)
            status = test_fn(test)

            if status == None:
                continue

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

    sent = notify_task(task, log_data)
    if sent:
        emails = task.notify['email']['emails']
        log('Log was sent to {}'.format(', '.join(emails)))
    else:
        log('Log was not sent to {}'.format(', '.join(emails)))
    write_log(task, log_data)


def write_log(task, content):
    file = task.get_log_file()
    d = os.path.dirname(file)
    if not os.path.exists(d):
        os.makedirs(d)
    msg = '\n'.join(log_data)
    with open(file, 'w') as f:
        f.write(msg)
    return True

def notify_task(task, content):
    env = task.get_env()
    subject = task.notify['email']['subject'].format(**env)
    emails = task.notify['email']['emails']
    
    msg = '\n'.join(log_data)
#    msg = msg.encode('unicode_escape')

    email.send(emails, subject, msg)
    return True


def get_config():
    import json
    return json.load(open('config.json', 'rb'))

def taskFactory(config, data):
    from glob import glob
    from copy import copy

    def u(s):
        return s.replace(' ', '_')

    def get_def(val):
        name = val[5:]
        return config['def'][name]

    def get_tests(tests):
        for t in tests:
            if 'layer' in t and isinstance(t['layer'], str):
                t['layer'] = get_def(t['layer'])
        return tests

    def get_log(log):
        if isinstance(log, dict):
            return log
        else:
            return config['def']['log']

    task = {
        'name': data['name'],
        'input': data['input'],
        'tests': get_tests(data['test']),
        'log': get_log(data['log']),
        'notify': data['notify'],
    }
    
    class Task:
        def __init__(self, name, input, tests, log, notify):
            self.current_file = None
            self.date = datetime.now()
            self.status = True
            self._tests = []

            self.name = name
            self.input = input
            self.tests = tests
            self.log = log
            self.notify = notify

        def generate_tests(self, layer_names):
            def get_layers_match(pattern):
                return [x for x in layer_names if pattern.match(x)]
            
            def collect_layers(patterns):
                layers = []
                for x in patterns:
                    pattern = re.compile(x)
                    layers += get_layers_match(pattern)
                return layers

            def get_layer_patterns(layers):
                if isinstance(layers, list):
                    return layers
                elif isinstance(layers, str):
                    [layers]
                else:
                    return []

            def split_tests(tests):
                def t(test, layer):
                    t = copy(test)
                    t['layer'] = layer
                    return t

                result = []
                for test in tests:
                    if 'layer' not in test:
                        result.append(test)
                        continue

                    layer_patterns = get_layer_patterns(test['layer'])
                    layers = collect_layers(layer_patterns)                    
                    result += [t(test, x) for x in layers]
                    
                return result

            self._tests = split_tests(self.tests)
            return self._tests

        def get_log_file(self):
            log_dir = self.log['dirpath']
            ptr = self.log['filenamePattern']
            env = self.get_env()
            filename = ptr.format(**env)
            result = os.path.join(log_dir, filename)

            return os.path.normpath(result)

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
            for x in self._tests:
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

    rs.DocumentModified(False)    


main()