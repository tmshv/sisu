# -*- coding: utf-8 -*-

import os
import sys
import re
import urllib2
import json
from copy import copy
from datetime import datetime

import rhinoscriptsyntax as rs
import scriptcontext as sc
import Rhino

TEST_PASSED = 0
TEST_FAILED = 1
TEST_SKIPPED = 2

TOKEN = None

log_data = []


def norm_task_layer_patterns(layers):
    if isinstance(layers, list):
        return layers
    elif isinstance(layers, str):
        [layers]
    else:
        return []


class Task:
    def __init__(self, tests):
        self.date = datetime.now()
        self.status = True
        self._tests = []

        self.tests = tests

    def generate_tests(self, layer_names):
        def get_layers_match(pattern):
            return [x for x in layer_names if pattern.match(x)]

        def get_layers_by_patterns(patterns):
            layers = []
            for x in patterns:
                pattern = re.compile(x)
                layers += get_layers_match(pattern)
            return layers

        def collect_layers(patterns, patterns_ignore):
            layers = get_layers_by_patterns(patterns)
            ignore = get_layers_by_patterns(patterns_ignore)

            return [x for x in layers if x not in ignore]

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

                ignore = test.get('ignore', [])
                ignore = norm_task_layer_patterns(ignore)
                layer_patterns = test.get('layer', [])
                layer_patterns = norm_task_layer_patterns(layer_patterns)
                layers = collect_layers(layer_patterns, ignore)
                result += [t(test, x) for x in layers]
            return result

        self._tests = split_tests(self.tests)
        return self._tests

    def get_status(self):
        return self.status

    def update_status(self, value):
        if not self.status:
            return
        self.status = value

    def test(self):
        for x in self._tests:
            yield x


def api_url(path):
    return 'http://sisu.unit4.io/api{path}'.format(path=path)


def merge_dict(x, y):
    z = x.copy()
    z.update(y)
    return z


def request_headers(custom_headers):
    auth_headers = {} if not TOKEN else {
        'Authorization': 'Bearer %s' % TOKEN,
    }
    return merge_dict(custom_headers, auth_headers)


def request_send(req):
    try:
        f = urllib2.urlopen(req)
        res = f.read()
        f.close()
        return json.loads(res)
    except Exception as e:
        print(e)
        return None


def request_post(url, data):
    body = json.dumps(data).encode('utf-8')
    headers = request_headers({
        'Content-Type': 'application/json',
    })
    req = urllib2.Request(url, headers=headers, data=body)
    return request_send(req)


def request_put(url, data):
    body = json.dumps(data).encode('utf-8')
    headers = request_headers({
        'Content-Type': 'application/json',
    })
    req = urllib2.Request(url, headers=headers, data=body)
    req.get_method = lambda: 'PUT'
    return request_send(req)


def request_get(url):
    headers = request_headers({})
    req = urllib2.Request(url, headers=headers)
    return request_send(req)


def api_authorize(email, password):
    auth = {
        'email': email,
        'password': password,
    }
    res = request_post(api_url('/login'), auth)
    if 'token' in res:
        global TOKEN
        TOKEN = res['token']
        return True
    else:
        return False


def api_user():
    res = request_get(api_url('/user'))
    if not res:
        return None
    else:
        return res['resource']


def api_project_config(project_id):
    res = request_get(api_url('/projects/%s/config' % project_id))
    if not res:
        return None
    else:
        return res['resource']


def api_project_update_file(project_id, filename, log_list):
    log = '\n'.join(log_list)
    data = {
        'filename': filename,
        'log': log,
        'lastScanTs': 1,
        'previewImageUrl': '',
    }

    res = request_put(api_url('/projects/%s/file' % project_id), data)

    print(filename)
    print(res)
    print(log)


def load_settings():
    return json.load(open('settings.json', 'rb'))


def log(data):
    log_data.append(data)


def clear_log():
    global log_data
    log_data = []


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


def get_blocks_by_layer(layer_name):
    objs = get_objects_by_layer(layer_name)
    if not objs:
        return []
    return [x for x in objs if isinstance(x, Rhino.DocObjects.InstanceObject)]


def get_object_type(x):
    return type(x).__name__


def t(v):
    if v == TEST_PASSED:
        return 'Passed'
    if v == TEST_FAILED:
        return 'Failed'
    return v


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

    objs = get_geometry_by_layer(layer_name)
    for x in objs:
        if not rs.IsCurvePlanar(x.Id):
            return False
    return True


def test_is_polyline(options):
    layer_name = options['layer']

    objs = get_geometry_by_layer(layer_name)
    for x in objs:
        if not rs.IsPolyline(x.Id):
            return False
    return True


def test_layer_exist(options):
    pattern = options['mask']
    ptr = re.compile(pattern)

    for name in get_layer_names():
        if ptr.match(name):
            return True
    return False


def test_is_layer_empty(options):
    layer_name = options['layer']

    return rs.IsLayer(layer_name) and rs.IsLayerEmpty(layer_name)


def test_is_layer_not_empty(options):
    layer_name = options['layer']

    return rs.IsLayer(layer_name) and not rs.IsLayerEmpty(layer_name)


def test_is_curve_closed(options):
    layer_name = options['layer']
    geom = get_geometry_by_layer(layer_name)
    if len(geom) == 0:
        return None

    for x in geom:
        valid = rs.IsCurveClosed(x)
        if not valid:
            return False
    return True


def test_layer_consistency(options):
    layer_name = options['layer']
    types = options['types']
    for x in get_objects_by_layer(layer_name):
        t = get_object_type(x)
        if t not in types:
            return False
    return True


def test_block_name(options):
    layer_name = options['layer']

    for x in get_blocks_by_layer(layer_name):
        name = rs.BlockInstanceName(x.Id)
        pattern = '^{layer}'.format(layer=layer_name)
        if not re.match(pattern, name):
            return False

    return True


def open_file(path):
    rs.DocumentModified(False)
    rs.Command('_-Open "{}" _Enter'.format(path))


def test_factory(test):
    name = test['name']

    def default_description(x): return x['name']

    d = {
        'layerExist':       [test_layer_exist, lambda x: 'Test: layer {mask} should exist'.format(**x)],
        'emptyLayer':       [test_is_layer_empty,     default_description],
        'notEmptyLayer':    [test_is_layer_not_empty, default_description],
        'geometryClosed':   [test_is_curve_closed, lambda x: 'Curves on layer {layer} should be closed'.format(**x)],
        'layerConsistency': [test_layer_consistency, lambda x: 'Geometry on layer {layer} should be one of type: {types}'.format(layer=x['layer'], types=','.join(x['types']))],
        'isCurvePlanar':    [test_is_curve_planar,    default_description],
        'isPolyline':       [test_is_polyline,        default_description],
        'layerNameMatch':   [test_layer_name_match,   default_description],
        'blockNameRelation': [test_block_name, lambda x: 'Block name on layer {layer} should start with {layer}'.format(**x)],
    }

    def s(status):
        if status == None:
            return TEST_SKIPPED
        elif status == False:
            return TEST_FAILED
        elif status == True:
            return TEST_PASSED

    class Test:
        def __init__(self, name, fn, dc):
            self.name = name
            self.fn = fn
            self.dc = dc

        def make_description(self, options):
            return self.dc(options)

        def run(self, options):
            status = self.fn(options)
            self.status = s(status)
            self.description = self.make_description(options)

        def is_failed(self):
            return self.status == TEST_FAILED

        def get_status(self):
            return self.status

        def get_description(self):
            return self.description

    return Test(name, d[name][0], d[name][1])


def run_task(task):
    clear_log()

    log('=' * 30)
    log('Date: %s' % task.date.strftime("%d.%m.%Y %H:%M:%S"))
    log('App: %s' % Rhino.RhinoApp.Name)
    log('App version %s' % Rhino.RhinoApp.Version)
    log('')

    file_failed = False

    layer_names = get_layer_names()
    task.generate_tests(layer_names)

    for test_data in task.test():
        test = test_factory(test_data)
        test.run(test_data)

        if test.is_failed():
            file_failed = True
            status = test.get_status()

            log(test.get_description())
            log(t(status))
            log('')

            task.update_status(False)

        # log(t(status))
        # log('')
    if not file_failed:
        log('File status: passed')

    log('-' * 50)
    return log_data


def write_log(task, content):
    file = task.get_log_file()
    d = os.path.dirname(file)
    if not os.path.exists(d):
        os.makedirs(d)
    msg = '\n'.join(log_data)
    with open(file, 'w') as f:
        f.write(msg)
    return True


def test_result_factory(name, description, status, log):
    return {}


def get_task_data():
    task_file = os.path.expanduser('~/Desktop/sisu_task.json')
    with open(task_file, 'r') as f:
        data = f.read()
        return json.loads(data)


def save_task_result():
    result = {
        'log': '\n'.join(log_data),
    }
    result_file = os.path.expanduser('~/Desktop/sisu_task_result.json')
    with open(result_file, 'w') as f:
        data = json.dumps(result, ensure_ascii=False, indent=4)
        f.write(data)


def main():
    task = get_task_data()
    filename = task['filename']
    open_file(filename)
    task = Task(tests=task['tests'])
    run_task(task)
    save_task_result()
    rs.DocumentModified(False)
    rs.Exit()


main()
