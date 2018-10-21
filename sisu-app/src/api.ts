import * as qs from "querystring";

export function request(url: string, options: any = {}) {
    const baseUrl = 'http://localhost:5000'

    const token = localStorage.getItem("authKey");
    const customHeaders = !token ? {} : ({
        'Authorization': `Bearer ${token}`,
    })

    return fetch(baseUrl + url, {
        ...options,
        headers: {
            ...options.headers,
            ...customHeaders,
        }
    })
}

export function getRequest(path: string, query?: object) {
    const url = buildUrl(path, query ? query : {});

    const token = localStorage.getItem("authToken");
    const customHeaders: any = !token ? {} : ({
        'Authorization': `Bearer ${token}`,
    });

    return fetch(url, {
        headers: new Headers(customHeaders),
    })
}

function buildUrl(url: string, query: object): string {
    const baseUrl = 'http://localhost:5000'
    const q = qs.stringify(query);

    return baseUrl + url + '?' + q;
}
