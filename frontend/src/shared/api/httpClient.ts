const DEFAULT_API_BASE_URL = "";

const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL?.trim() ||
    DEFAULT_API_BASE_URL
).replace(/\/+$/, "");

const DEFAULT_TIMEOUT_MS = 10_000;

interface ApiErrorBody {
    error?: unknown;
    message?: unknown;
}

export class HttpError extends Error {
    readonly status: number;

    constructor(
        message: string,
        status: number,
    ) {
        super(message);
        this.name = "HttpError";
        this.status = status;
    }
}

export const getApiUrl = (
    path: string,
): string => {
    const normalizedPath = path.startsWith("/")
        ? path
        : `/${path}`;

    return `${API_BASE_URL}${normalizedPath}`;
};

const getErrorMessage = async (
    response: Response,
): Promise<string> => {
    const fallbackMessage =
        `Le backend a répondu avec le statut ${response.status}.`;

    try {
        const body =
            (await response.json()) as ApiErrorBody;

        if (
            typeof body.error === "string" &&
            body.error.trim()
        ) {
            return body.error.trim();
        }

        if (
            typeof body.message === "string" &&
            body.message.trim()
        ) {
            return body.message.trim();
        }
    } catch {
        return fallbackMessage;
    }

    return fallbackMessage;
};

const createRequestSignal = (
    signal: AbortSignal | null | undefined,
    timeoutMs: number,
): AbortSignal => {
    const timeoutSignal =
        AbortSignal.timeout(timeoutMs);

    return signal
        ? AbortSignal.any([
              signal,
              timeoutSignal,
          ])
        : timeoutSignal;
};

export const request = async (
    path: string,
    init: RequestInit = {},
    timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> => {
    let response: Response;

    try {
        response = await fetch(
            getApiUrl(path),
            {
                ...init,
                headers: {
                    Accept: "application/json",
                    ...init.headers,
                },
                signal: createRequestSignal(
                    init.signal,
                    timeoutMs,
                ),
            },
        );
    } catch (error) {
        if (
            error instanceof DOMException &&
            error.name === "TimeoutError"
        ) {
            throw new Error(
                "Le backend ne répond pas dans le délai attendu.",
                {
                    cause: error,
                },
            );
        }

        if (
            error instanceof DOMException &&
            error.name === "AbortError"
        ) {
            throw error;
        }

        throw new Error(
            "Impossible de joindre le backend.",
            {
                cause: error,
            },
        );
    }

    if (!response.ok) {
        throw new HttpError(
            await getErrorMessage(response),
            response.status,
        );
    }

    return response;
};

export const requestJson = async (
    path: string,
    init: RequestInit = {},
): Promise<unknown> => {
    const response = await request(path, init);

    try {
        return await response.json();
    } catch {
        throw new Error(
            "Le backend a renvoyé une réponse JSON invalide.",
        );
    }
};
