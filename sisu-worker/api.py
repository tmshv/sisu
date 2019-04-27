import requests

TOKEN = None


def api_init(token):
    global TOKEN
    TOKEN = token


def api_url(path):
    return f'https://sisu.unit4.io/api{path}'


def request_headers(custom_headers):
    return {
        **custom_headers,
        'Authorization': 'Bearer %s' % TOKEN,
    }


# def request_post(url, data):
#     body = json.dumps(data).encode('utf-8')
#     headers = request_headers({
#         'Content-Type': 'application/json',
#     })
#     req = urllib2.Request(url, headers=headers, data=body)
#     return request_send(req)


def request_put(url, data):
    print(f'> Req {url}')
    headers = request_headers({
        'Content-Type': 'application/json',
    })

    try:
        res = requests.put(url, json=data, headers=headers)
        print(res.status_code)
    except Exception as e:
        print(e)

    return None


# def request_get(url):
#     headers = request_headers({})
#     req = urllib2.Request(url, headers=headers)
#     return request_send(req)


def api_set_project_file_tests(project_id, file_id, tests):
    url = api_url(f'/projects/{project_id}/file/{file_id}/tests')
    return request_put(url, tests)


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