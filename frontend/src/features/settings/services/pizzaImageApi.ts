import {
    getApiUrl,
    HttpError,
    request,
} from "../../../shared/api/httpClient";

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
): Promise<void> => {
    const formData = new FormData();
    formData.append("image", file);

    await request(
        getPizzaImagePath(pizzaId),
        {
            method: "PUT",
            body: formData,
        },
        30_000,
    );
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
