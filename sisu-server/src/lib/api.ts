export function success(extend?: object): object {
    return {
        status: "ok",
        ...extend,
    };
}

export function error(error: object): object {
    return {
        status: "failed",
        error,
    };
}

export function resource(resource: any): object {
    return success({
        resource,
    });
}

export function errorMessage(message: string): object {
    return error({
        message,
    });
}

export function errorNotFound(resourceId: string): object {
    return errorMessage(`Resrource ${resourceId} not found`);
}
