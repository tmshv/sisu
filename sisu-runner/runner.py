import os
import sys
import json

import rpc
import api


def rpc_call(message):
    client = rpc.create_rpc()
    response = client.call(message)
    client.close()

    return response


def create_message(action, payload):
    return {
        'action': action,
        'version': '1.0',
        'payload': payload,
    }


def get_tests(config):
    definition = config['def']
    ts = []
    tasks = config['tasks']
    for task in tasks:
        tests = task['test']
        for t in tests:
            t = compile_test(definition, t)
            ts.append(t)
    return ts


def run_update_file(pid, filename):
    file_id = api.create_project_file_id(filename)
    token = api.authorize_worker()

    config = api.get_project_config(pid)
    tests = get_tests(config)

    print('> update file {id} ({file})'.format(id=file_id, file=filename))

    message = create_message('FILE.TEST', {
        'token': token,
        'projectId': pid,
        'fileId': file_id,
        'filename': filename,
        'tests': tests,
    })

    res = rpc_call(message)
    print(res)


def get_chaned_files(old_files, new_files):
    def changed(f):
        h = f['hash']
        for x in old_files:
            if x['hash'] == h:
                return False
        return True
    return [f for f in new_files if changed(f)]


def compile_test(definition, t):
    layer = t.get('layer', None)
    if layer and layer.startswith('@def/'):
        _, d = layer.split('/')
        t['layer'] = definition[d]
    return t


def run_update_project(pid):
    config_input = api.get_project_input(pid)
    
    # project_state = api.get_project_state(pid)
    # state_files = project_state['files']

    # print('> last state')
    # for x in state_files:
    #     print(x['file'])

    print('> update file tree')
    message = create_message('FILE_TREE.UPDATE', {
        'mask': config_input,
    })
    response = rpc_call(message)

    for x in response:
        x['file'] = os.path.normpath(x['file'])

    print('> current files:')
    for x in response:
        print(x)

    state = {
        'lastScanTs': 2,
        'files': response,
    }

    res = api.set_project_state(pid, state)
    print(res)

    # print('> current state')
    # for x in response:
    #     print(x['file'])

    # changed = get_chaned_files(state_files, response)
    # print(f'> changed {len(changed)} files')

    for f in response:
        run_update_file(pid, f['file'])

    # update state


def init():
    email = sys.argv[1]
    password = sys.argv[2]
    auth_status = api.authorize(email, password)
    if not auth_status:
        print('> failed to authorize')
        exit()


def main_loop():
    user = api.get_user()
    print('> user {email}'.format(email=user['email']))

    for project in user['projects']:
        pid = project['id']

        print('> updating project {name} ({id})'.format(
            name=project['name'],
            id=pid,
        ))
        run_update_project(pid)


def main():
    init()
    main_loop()
    # test_loop()
    exit()


def test_loop():
    filename = 'U:/RU Moscow A101 Scandinavia/STAGE II/CY 14 15 18/DWG/181206_CY14-15_04.dwg'
    run_update_file('5bcb773f989b58a5b994bd7c', filename)

    # file_id = api.create_project_file_id(filename)

    # response = rpc_call(create_message('FILE.TEST', {
    #     'token': token,
    #     'projectId': '5bcb773f989b58a5b994bd7c',
    #     'fileId': file_id,
    #     'filename': filename,
    #     'tests': [
    #         # {
    #         #     'name': 'layerExist',
    #         #     'mask': '^0$',
    #         # },
    #         # {
    #         #     'name': 'geometryClosed',
    #         #     'layer': [
    #         #         '^[A-Z]_[A-Z]_[\\d]{2}$',
    #         #     ],
    #         #     'ignore': [
    #         #         '[FBL]_[A-Z]_[\\d]{2}',
    #         #     ]
    #         # },
    #         {
    #             "name": "layerExist",
    #             "mask": "^0$"
    #         },
    #         {
    #             "name": "layerExist",
    #             "mask": "^[A-Z]_[A-Z]_[\\d]{2}(_[a-z])$"
    #         },
    #         {
    #             "name": "emptyLayer",
    #             "layer": [
    #                 "^0$",
    #                 "^Default$",
    #                 "^Defpoints$"
    #             ]
    #         },
    #         {
    #             "name": "geometryClosed",
    #             "layer": [
    #                 "^[A-Z]_[A-Z]_[\\d]{2}(_[a-z])$"
    #             ],
    #             "ignore": [
    #                 "[FBL]_[A-Z]_[\\d]{2}"
    #             ]
    #         },
    #         {
    #             "name": "curveNotSelfIntersected",
    #             "layer": [
    #                 "^[A-Z]_[A-Z]_[\\d]{2}(_[a-z])$"
    #             ],
    #         },
    #         {
    #             "name": "layerConsistency",
    #             "layer": [
    #                 "^[A-Z]_[A-Z]_[\\d]{2}(_[a-z])$"
    #             ],
    #             "types": [
    #                 "CurveObject"
    #             ]
    #         },
    #         {
    #             "name": "layerConsistency",
    #             "layer": [
    #                 "^[A-Z]_[A-Z]$"
    #             ],
    #             "types": [
    #                 "InstanceObject"
    #             ]
    #         },
    #         {
    #             "name": "blockNameRelation",
    #             "layer": [
    #                 "^[A-Z]_[A-Z]$"
    #             ],
    #         }
    #     ]
    # }))
    # print(json.dumps(response, ensure_ascii=False, indent=4))


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(f'Usage: {sys.argv[0]} <email> <password>')
        exit(1)
    main()

    # message = {
    #     'action': 'FILE.UPDATE_PREVIEW',
    #     'payload': {
    #         'filename': 'U:\RU Moscow A101 Scandinavia\STAGE II\CY 14 15 18\DWG\181206_CY14-15_05.dwg',
    #     },
    # }
