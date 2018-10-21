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

export function errorMessage(message: string): object {
    return error({
        message,
    });
}
