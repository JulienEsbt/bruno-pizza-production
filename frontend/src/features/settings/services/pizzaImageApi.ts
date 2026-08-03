import {
    getApiUrl,
    HttpError,
    request,
    requestJson,
} from "../../../shared/api/httpClient";

interface PizzaImageUploadResponse {
    updatedAt: string;
}

const getPizzaImagePath = (
    pizzaId: string,
): string => {
    return (
        "/api/catalog/pizzas/" +
        `${encodeURIComponent(pizzaId)}/image`
    );
};

export const getPizzaImageUrl = (
    pizzaId: string,
    cacheKey?: string | number,
): string => {
    const baseUrl = getApiUrl(
        getPizzaImagePath(pizzaId),
    );

    return cacheKey === undefined
        ? baseUrl
        : `${baseUrl}?v=${encodeURIComponent(
              String(cacheKey),
          )}`;
};

export const uploadPizzaImage = async (
    pizzaId: string,
    file: File,
): Promise<PizzaImageUploadResponse> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await requestJson(
        getPizzaImagePath(pizzaId),
        {
            method: "PUT",
            body: formData,
        },
        30_000,
    );

    if (
        !response ||
        typeof response !== "object" ||
        !("updatedAt" in response) ||
        typeof response.updatedAt !== "string" ||
        !response.updatedAt.trim()
    ) {
        throw new Error(
            "Le serveur a renvoyé une réponse photo invalide.",
        );
    }

    return {
        updatedAt: response.updatedAt,
    };
};

export const deletePizzaImage = async (
    pizzaId: string,
): Promise<void> => {
    try {
        await request(
            getPizzaImagePath(pizzaId),
            {
                method: "DELETE",
            },
        );
    } catch (error) {
        if (
            error instanceof HttpError &&
            error.status === 404
        ) {
            return;
        }

        throw error;
    }
};
