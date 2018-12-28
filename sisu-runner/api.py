import os
import json
import requests

TOKEN = None


# def merge_dict(x, y):
#     z = x.copy()
#     z.update(y)
#     return z


def api_url(path):
    return f'http://sisu.unit4.io/api{path}'


def request_headers(custom_headers):
    auth_headers = {} if not TOKEN else {
        'Authorization': 'Bearer %s' % TOKEN,
    }
    return {
        **custom_headers,
        **auth_headers,
    }


# def request_send(req):
#     try:
#         f = urllib2.urlopen(req)
#         res = f.read()
#         f.close()
#         return json.loads(res)
#     except Exception as e:
#         print(e)
#         return None


# def request_put(url, data):
#     body = json.dumps(data).encode('utf-8')
#     headers = request_headers({
#         'Content-Type': 'application/json',
#     })
#     req = urllib2.Request(url, headers=headers, data=body)
#     req.get_method = lambda: 'PUT'
#     return request_send(req)


def request_get(url, params=None):
    headers = request_headers({})
    res = requests.get(url, params=params, headers=headers)
    if res.status_code != 200:
        return None
    return res.json()


def request_post(url, data):
    headers = request_headers({})
    res = requests.post(url, headers=headers, json=data)
    if res.status_code != 200:
        return None
    return res.json()


def authorize(email, password):
    auth = {
        'email': email,
        'password': password,
    }
    res = requests.post(api_url('/login'), json=auth)
    if res.status_code != 200:
        print('> auth failed with code', res.status_code)
        return False
    body = res.json()
    if 'token' in body:
        global TOKEN
        TOKEN = body['token']
        return True
    else:
        print('> auth failed. token not found')
        return False


def get_user():
    res = request_get(api_url('/user'))
    return res['resource']


def get_project_config(project_id):
    res = request_get(api_url('/projects/%s/config' % project_id))
    if not res:
        return None
    else:
        return res['resource']

def get_project_input(project_id):
    res = request_get(api_url('/projects/%s/config/input' % project_id))
    if not res:
        return None
    else:
        return res['resource']

def get_project_state(project_id):
    res = request_get(api_url('/projects/%s/state' % project_id))
    if not res:
        return None
    else:
        return res['resource']

def set_project_state(project_id, data):
    res = request_post(api_url(f'/projects/{project_id}/update-state'), data)
    if not res:
        return None
    else:
        return res

def create_project_file_id(file):
    params = {
        'file': file,
    }
    res = request_get(api_url('/utils/create-project-file-id'), params=params)
    if not res:
        return None
    else:
        return res['resource']

def authorize_worker():
    return TOKEN


# def api_project_update_file(project_id, filename, log_list):
#     log = '\n'.join(log_list)
#     data = {
#         'filename': filename,
#         'log': log,
#         'lastScanTs': 1,
#         'previewImageUrl': '',
#     }

#     res = request_put(api_url('/projects/%s/file' % project_id), data)

#     print(filename)
#     print(res)
#     print(log)


# def api_project_update_state(project_id, files):
#     data = {
#         'projectFilenames': files,
#         'lastScanTs': 1,
#         'workerAppVersion': '',
#     }

#     res = request_post(api_url('/projects/%s/update-state' % project_id), data)

#     print(files)
#     print(res)
#     print(log)
