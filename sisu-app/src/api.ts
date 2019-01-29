import * as qs from "querystring";
import { IFile, IProjectInfo } from './core';

export interface IApiResponse {
    status: "ok" | "failed";
    resource?: any;
    error?: any;
}

export function isResponseOk(response: IApiResponse): boolean {
    return response.status === "ok";
}

function getAuthHeaders(): any {
    const token = localStorage.getItem("authToken");

    return !token ? {} : ({
        'Authorization': `Bearer ${token}`,
    });
}

export function makeRequest(path: string, options: any = {}) {
    const url = buildUrl(path);
    const authHeaders = getAuthHeaders();

    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            ...authHeaders,
        },
    })
}

export function postRequest(path: string, data: any, options: any = {}) {
    const body = JSON.stringify(data);

    return makeRequest(path, {
        ...options,
        body,
        headers: {
            ...options.headers,
            'Content-Type': 'application/json',
        },
        method: "POST",
    })
}

export function putRequest(path: string, data: any, options: any = {}) {
    let body: any;
    let headers: any;

    if (typeof data === "string") {
        body = data;
        headers = {};
    } else {
        body = JSON.stringify(data);
        headers = {
            'Content-Type': 'application/json',
        };
    }

    return makeRequest(path, {
        ...options,
        body,
        headers: {
            ...options.headers,
            ...headers,
        },
        method: "PUT",
    })
}

export function getRequest(path: string, query?: object) {
    const url = buildUrl(path, query);
    const authHeaders = getAuthHeaders();

    return fetch(url, {
        headers: new Headers(authHeaders),
    })
}

export async function getProjectInfo(pid: string): Promise<IProjectInfo | null> {
    const url = `/projects/${pid}/info`

    try {
        const res = await getRequest(url)
        const data = await res.json() as IApiResponse
        if (isResponseOk(data)) {
            return data.resource
        } else {
            return null
        }
    } catch (e) {
        return null
    }
}

export async function getProjectFile(pid: string, fid: string): Promise<IFile | null> {
    const url = `/projects/${pid}/file/${fid}`

    try {
        const res = await getRequest(url)
        const data = await res.json() as IApiResponse
        if (isResponseOk(data)) {
            return data.resource
        } else {
            return null
        }
    } catch (e) {
        return null
    }
}

function buildUrl(url: string, query?: object): string {
    const baseUrl = process.env.REACT_APP_API
    const q = !query ? "" : (
        `?${qs.stringify(query)}`
    );

    return baseUrl + url + q;
}
