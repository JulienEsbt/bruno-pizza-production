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


import type { PizzaImage } from "../../../types/pizzaImage";
const galleryPath = (pizzaId: string): string => `/api/catalog/pizzas/${encodeURIComponent(pizzaId)}/images`;
const parseGallery = (value: unknown): PizzaImage[] => {
    if (!Array.isArray(value) || !value.every((image) => image && typeof image === "object"
        && typeof image.id === "string" && typeof image.pizzaId === "string"
        && typeof image.originalName === "string" && typeof image.updatedAt === "string"
        && typeof image.mimeType === "string" && typeof image.sizeBytes === "number")) {
        throw new Error("Le serveur a renvoyé une galerie invalide.");
    }
    return value as PizzaImage[];
};
export const getPizzaGalleryImageUrl = (pizzaId: string, imageId: string): string =>
    getApiUrl(`${galleryPath(pizzaId)}/${encodeURIComponent(imageId)}`);
export const getPizzaImages = async (pizzaId: string, signal?: AbortSignal): Promise<PizzaImage[]> =>
    parseGallery(await requestJson(galleryPath(pizzaId), {signal, cache: "no-store"}));
export async function uploadPizzaImages(pizzaId: string, files: File[]): Promise<PizzaImage[]> {
    const data = new FormData();
    files.forEach((file) => data.append("images", file));
    return parseGallery(await requestJson(galleryPath(pizzaId), {method: "POST", body: data}, 60_000));
}
export const reorderPizzaImages = async (pizzaId: string, imageIds: string[]): Promise<PizzaImage[]> =>
    parseGallery(await requestJson(`${galleryPath(pizzaId)}/order`, {
        method: "PUT", headers: {"Content-Type": "application/json"}, body: JSON.stringify({imageIds}),
    }));
export const removePizzaGalleryImage = async (pizzaId: string, imageId: string): Promise<PizzaImage[]> =>
    parseGallery(await requestJson(`${galleryPath(pizzaId)}/${encodeURIComponent(imageId)}`, {method: "DELETE"}));
