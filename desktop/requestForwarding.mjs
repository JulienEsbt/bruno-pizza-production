const METHODS_WITHOUT_BODY = new Set([
    "GET",
    "HEAD",
]);

export const createBackendRequestInit = async (
    request,
) => {
    const method = request.method.toUpperCase();
    const body = METHODS_WITHOUT_BODY.has(method)
        ? undefined
        : await request.arrayBuffer();

    return {
        method,
        headers: request.headers,
        ...(body === undefined ? {} : { body }),
        bypassCustomProtocolHandlers: true,
    };
};
