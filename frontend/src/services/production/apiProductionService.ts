import type { ProductionDay } from "../../types/production";

const DEFAULT_API_BASE_URL = "http://localhost:3001";

const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL?.trim() ||
    DEFAULT_API_BASE_URL
).replace(/\/+$/, "");

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const getIsoDate = (date: Date): string => {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(
        2,
        "0",
    );

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getErrorMessage = async (
    response: Response,
): Promise<string> => {
    const fallbackMessage =
        `Impossible de récupérer la production ` +
        `(erreur ${response.status}).`;

    try {
        const responseBody = (await response.json()) as {
            error?: unknown;
            message?: unknown;
        };

        if (
            typeof responseBody.error === "string" &&
            responseBody.error.trim()
        ) {
            return responseBody.error.trim();
        }

        if (
            typeof responseBody.message === "string" &&
            responseBody.message.trim()
        ) {
            return responseBody.message.trim();
        }

        return fallbackMessage;
    } catch {
        return fallbackMessage;
    }
};

const validateProductionDay = (
    value: unknown,
): ProductionDay => {
    if (
        typeof value !== "object" ||
        value === null
    ) {
        throw new Error(
            "La réponse reçue du backend est invalide.",
        );
    }

    const production = value as Partial<ProductionDay>;

    if (
        typeof production.date !== "string" ||
        typeof production.updatedAt !== "string" ||
        production.source !== "api" ||
        !Array.isArray(production.pizzas)
    ) {
        throw new Error(
            "La réponse reçue du backend est incomplète.",
        );
    }

    for (const pizza of production.pizzas) {
        if (
            typeof pizza !== "object" ||
            pizza === null ||
            typeof pizza.id !== "string" ||
            typeof pizza.name !== "string" ||
            typeof pizza.quantity !== "number" ||
            !Number.isFinite(pizza.quantity) ||
            !Array.isArray(pizza.ingredients) ||
            !Array.isArray(pizza.distributors)
        ) {
            throw new Error(
                "Une recette reçue du backend est invalide.",
            );
        }
    }

    return production as ProductionDay;
};

export const getProductionFromApi = async (
    date: string,
    signal?: AbortSignal,
): Promise<ProductionDay> => {
    const normalizedDate = date.trim();

    if (!ISO_DATE_PATTERN.test(normalizedDate)) {
        throw new Error(
            "La date de production est invalide.",
        );
    }

    const response = await fetch(
        `${API_BASE_URL}/api/production/${encodeURIComponent(
            normalizedDate,
        )}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
            signal,
        },
    );

    if (!response.ok) {
        throw new Error(
            await getErrorMessage(response),
        );
    }

    const responseBody: unknown = await response.json();

    return validateProductionDay(responseBody);
};

export const getTodayProductionFromApi =
    async (): Promise<ProductionDay> => {
        return getProductionFromApi(
            getIsoDate(new Date()),
        );
    };
