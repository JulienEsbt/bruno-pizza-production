import type {
    CreateDistributorInput,
    DistributorCatalogUpdate,
    CreateIngredientInput,
    CreatePizzaInput,
    IngredientCatalogUpdate,
    PizzaCatalogUpdate,
    ProductionSettings,
} from "../../types/settings";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ??
    "http://localhost:3001";

interface ApiErrorResponse {
    error?: string;
}

const parseResponse = async (
    response: Response,
): Promise<ProductionSettings> => {
    if (!response.ok) {
        const errorResponse = (await response
            .json()
            .catch(() => null)) as ApiErrorResponse | null;

        throw new Error(
            errorResponse?.error ??
                `Le backend a répondu avec le statut ${response.status}.`,
        );
    }

    return (await response.json()) as ProductionSettings;
};

export const getCatalog =
    async (): Promise<ProductionSettings> => {
        const response = await fetch(
            `${API_BASE_URL}/api/catalog`,
        );

        return parseResponse(response);
    };

export const createIngredient = async (
    input: CreateIngredientInput,
): Promise<ProductionSettings> => {
    const response = await fetch(
        `${API_BASE_URL}/api/catalog/ingredients`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify(input),
        },
    );

    return parseResponse(response);
};

export const updateIngredient = async (
    ingredientId: string,
    input: IngredientCatalogUpdate,
): Promise<ProductionSettings> => {
    const response = await fetch(
        `${API_BASE_URL}/api/catalog/ingredients/${encodeURIComponent(
            ingredientId,
        )}`,
        {
            method: "PATCH",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify(input),
        },
    );

    return parseResponse(response);
};

export const createPizza = async (
    input: CreatePizzaInput,
): Promise<ProductionSettings> => {
    const response = await fetch(
        `${API_BASE_URL}/api/catalog/pizzas`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify(input),
        },
    );

    return parseResponse(response);
};

export const updatePizza = async (
    pizzaId: string,
    input: PizzaCatalogUpdate,
): Promise<ProductionSettings> => {
    const response = await fetch(
        `${API_BASE_URL}/api/catalog/pizzas/${encodeURIComponent(
            pizzaId,
        )}`,
        {
            method: "PATCH",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify(input),
        },
    );

    return parseResponse(response);
};

export const deleteIngredient = async (
    ingredientId: string,
): Promise<ProductionSettings> => {
    const response = await fetch(
        `${API_BASE_URL}/api/catalog/ingredients/${encodeURIComponent(
            ingredientId,
        )}`,
        {
            method: "DELETE",
        },
    );

    return parseResponse(response);
};

export const deletePizza = async (
    pizzaId: string,
): Promise<ProductionSettings> => {
    const response = await fetch(
        `${API_BASE_URL}/api/catalog/pizzas/${encodeURIComponent(
            pizzaId,
        )}`,
        {
            method: "DELETE",
        },
    );

    return parseResponse(response);
};

export const createDistributor = async (
    input: CreateDistributorInput,
): Promise<ProductionSettings> => {
    const response = await fetch(
        `${API_BASE_URL}/api/catalog/distributors`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(input),
        },
    );

    return parseResponse(response);
};

export const updateDistributor = async (
    distributorId: string,
    update: DistributorCatalogUpdate,
): Promise<ProductionSettings> => {
    const response = await fetch(
        `${API_BASE_URL}/api/catalog/distributors/${encodeURIComponent(
            distributorId,
        )}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(update),
        },
    );

    return parseResponse(response);
};

export const deleteDistributor = async (
    distributorId: string,
): Promise<ProductionSettings> => {
    const response = await fetch(
        `${API_BASE_URL}/api/catalog/distributors/${encodeURIComponent(
            distributorId,
        )}`,
        {
            method: "DELETE",
        },
    );

    return parseResponse(response);
};
