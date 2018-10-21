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

export function getRequest(url: string, query?: object) {
    const baseUrl = 'http://localhost:5000'

    const token = localStorage.getItem("authToken");
    const customHeaders: any = !token ? {} : ({
        'Authorization': `Bearer ${token}`,
    });

    console.log(customHeaders)

    return fetch(baseUrl + url, {
        headers: new Headers(customHeaders),
    })
}
