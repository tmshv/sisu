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

TEST_PASSED = 'pass'
TEST_FAILED = 'fail'
TEST_SKIPPED = 'skip'

TOKEN = None

log_data = []


def get_task_error(error):
    return {
        'status': 'failed',
        'error': 'error'
    }


def get_task_response(payload):
    return {
        'status': 'ok',
        'payload': payload,
    }


def get_test_status(status):
    if status == None:
        return TEST_SKIPPED
    elif status == False:
        return TEST_FAILED
    elif status == True:
        return TEST_PASSED


def get_test_response(options, payload, status):
    return {
        'status': get_test_status(status),
        'name': options['name'],
        'options': options,
        'payload': payload,
    }


def norm_task_layer_patterns(layers):
    if isinstance(layers, list):
        return layers
    elif isinstance(layers, str):
        [layers]
    else:
        return []


class Task:
    def __init__(self, tests):
        self.tests = tests
        self.date = datetime.now()
        self._tests = []

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


def log(data):
    log_data.append(data)


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

    failed_layers = []
    s = True
    for x in sc.doc.Layers:
        name = x.Name
        ignored = name in ignore

        if not ignored and not ptr.match(name):
            failed_layers.append(name)
            s = False
    x = {
        'failedLayers': failed_layers,
    }
    return s, x


def test_is_curve_planar(options):
    layer_name = options['layer']

    objs = get_geometry_by_layer(layer_name)
    for x in objs:
        if not rs.IsCurvePlanar(x.Id):
            return False, None
    return True, None


def test_is_polyline(options):
    layer_name = options['layer']

    objs = get_geometry_by_layer(layer_name)
    for x in objs:
        if not rs.IsPolyline(x.Id):
            return False, None
    return True, None


def test_layer_exist(options):
    pattern = options['mask']
    ptr = re.compile(pattern)

    for name in get_layer_names():
        if ptr.match(name):
            return True, None
    return False, None


def test_is_layer_empty(options):
    layer_name = options['layer']

    s = rs.IsLayer(layer_name) and rs.IsLayerEmpty(layer_name)
    return s, None


def test_is_layer_not_empty(options):
    layer_name = options['layer']

    s = rs.IsLayer(layer_name) and not rs.IsLayerEmpty(layer_name)
    return s, None


def test_is_curve_closed(options):
    layer_name = options['layer']
    geom = get_geometry_by_layer(layer_name)
    if len(geom) == 0:
        return None, None

    for x in geom:
        valid = rs.IsCurveClosed(x)
        if not valid:
            return False, None
    return True, None


def test_is_curve_not_selfintersected(options):
    layer_name = options['layer']
    intersects = []
    geom = get_geometry_by_layer(layer_name)
    if len(geom) == 0:
        return None, intersects

    for x in geom:
        xs = rs.CurveCurveIntersection(x)
        if xs:
            intersects.append(x.Name)
    return len(intersects) == 0, intersects


def test_layer_consistency(options):
    layer_name = options['layer']
    types = options['types']
    for x in get_objects_by_layer(layer_name):
        t = get_object_type(x)
        if t not in types:
            return False, None
    return True, None


def test_block_name(options):
    layer_name = options['layer']

    for x in get_blocks_by_layer(layer_name):
        name = rs.BlockInstanceName(x.Id)
        pattern = '^{layer}'.format(layer=layer_name)
        if not re.match(pattern, name):
            return False, None

    return True, None


def open_file(path):
    rs.DocumentModified(False)
    return rs.Command('_-Open "{}" _Enter'.format(path))


def test_factory(test):
    name = test['name']
    test_definition = {
        'layerExist':       test_layer_exist,
        'emptyLayer':       test_is_layer_empty,
        'notEmptyLayer':    test_is_layer_not_empty,
        'geometryClosed':   test_is_curve_closed,
        'curveNotSelfIntersected': test_is_curve_not_selfintersected,
        'layerConsistency': test_layer_consistency,
        'isCurvePlanar':    test_is_curve_planar,
        'isPolyline':       test_is_polyline,
        'layerNameMatch':   test_layer_name_match,
        'blockNameRelation': test_block_name,
    }

    if name not in test_definition:
        return None

    return test_definition[name]


def run_task(task):
    task_output = {
        'runStart': task.date.strftime("%d.%m.%Y %H:%M:%S"),
        'appName': Rhino.RhinoApp.Name,
        'appVersion': str(Rhino.RhinoApp.Version),
        'tests': [],
    }
    file_failed = False

    layer_names = get_layer_names()
    task_output['layerNames'] = layer_names
    task.generate_tests(layer_names)

    for test_data in task.test():
        print('run test', test_data['name'])
        test_fn = test_factory(test_data)
        if not test_fn:
            task_output['tests'].append({
                'error': 'cannot handle test'
            })
            continue
        test_status, test_payload = test_fn(test_data)
        test_result = get_test_response(test_data, test_payload, test_status)
        task_output['tests'].append(test_result)
    if not file_failed:
        log('File status: passed')

    return task_output


def get_task_data():
    task_file = os.path.expanduser('~/Desktop/sisu_task.json')
    with open(task_file, 'r') as f:
        data = f.read()
        return json.loads(data)


def save_task_result(result):
    result_file = os.path.expanduser('~/Desktop/sisu_task_result.json')
    with open(result_file, 'w') as f:
        data = json.dumps(result, ensure_ascii=False, indent=4)
        f.write(data)


def main():
    task = get_task_data()
    filename = task['filename']
    filename = os.path.normpath(filename)
    s = open_file(filename)

    if not s:
        task_result = get_task_error('cannot open file {}'.format(filename))
        save_task_result(task_result)
        return

    task = Task(tests=task['tests'])
    task_result = run_task(task)
    save_task_result(task_result)

    rs.DocumentModified(False)
    rs.Exit()


main()
