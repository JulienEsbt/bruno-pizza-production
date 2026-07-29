const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ??
    "http://localhost:3001";

interface ApiErrorResponse {
    error?: string;
}

const parseError = async (
    response: Response,
): Promise<Error> => {
    const body = (await response
        .json()
        .catch(() => null)) as
        | ApiErrorResponse
        | null;

    return new Error(
        body?.error ??
            `Le backend a répondu avec le statut ${response.status}.`,
    );
};

export const getPizzaImageUrl = (
    pizzaId: string,
    cacheKey?: string | number,
): string => {
    const baseUrl =
        `${API_BASE_URL}/api/catalog/pizzas/` +
        `${encodeURIComponent(pizzaId)}/image`;

    return cacheKey === undefined
        ? baseUrl
        : `${baseUrl}?v=${encodeURIComponent(
              String(cacheKey),
          )}`;
};

export const uploadPizzaImage = async (
    pizzaId: string,
    file: File,
): Promise<void> => {
    const formData = new FormData();

    formData.append(
        "image",
        file,
    );

    const response = await fetch(
        getPizzaImageUrl(pizzaId),
        {
            method: "PUT",
            body: formData,
        },
    );

    if (!response.ok) {
        throw await parseError(response);
    }
};

export const deletePizzaImage = async (
    pizzaId: string,
): Promise<void> => {
    const response = await fetch(
        getPizzaImageUrl(pizzaId),
        {
            method: "DELETE",
        },
    );

    if (!response.ok && response.status !== 404) {
        throw await parseError(response);
    }
};
