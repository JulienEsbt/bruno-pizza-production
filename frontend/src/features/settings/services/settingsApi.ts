import { requestJson } from "../../../shared/api/httpClient";

import type {
    CreateDistributorInput,
    DistributorCatalogUpdate,
    CreateIngredientInput,
    CreatePizzaInput,
    IngredientCatalogUpdate,
    PizzaCatalogUpdate,
    ProductionSettings,
} from "../../../types/settings";

import { parseProductionSettings } from "../domain/catalogValidation";

const requestCatalog = async (
    path: string,
    init: RequestInit = {},
): Promise<ProductionSettings> => {
    return parseProductionSettings(
        await requestJson(path, init),
    );
};

const createJsonRequest = (
    method: "POST" | "PATCH",
    body: unknown,
): RequestInit => ({
    method,
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
});

export const getCatalog =
    async (): Promise<ProductionSettings> => {
        return requestCatalog("/api/catalog");
    };

export const createIngredient = async (
    input: CreateIngredientInput,
): Promise<ProductionSettings> => {
    return requestCatalog(
        "/api/catalog/ingredients",
        createJsonRequest("POST", input),
    );
};

export const updateIngredient = async (
    ingredientId: string,
    input: IngredientCatalogUpdate,
): Promise<ProductionSettings> => {
    return requestCatalog(
        `/api/catalog/ingredients/${encodeURIComponent(
            ingredientId,
        )}`,
        createJsonRequest("PATCH", input),
    );
};

export const deleteIngredient = async (
    ingredientId: string,
): Promise<ProductionSettings> => {
    return requestCatalog(
        `/api/catalog/ingredients/${encodeURIComponent(
            ingredientId,
        )}`,
        {
            method: "DELETE",
        },
    );
};

export const createPizza = async (
    input: CreatePizzaInput,
): Promise<ProductionSettings> => {
    return requestCatalog(
        "/api/catalog/pizzas",
        createJsonRequest("POST", input),
    );
};

export const updatePizza = async (
    pizzaId: string,
    input: PizzaCatalogUpdate,
): Promise<ProductionSettings> => {
    return requestCatalog(
        `/api/catalog/pizzas/${encodeURIComponent(
            pizzaId,
        )}`,
        createJsonRequest("PATCH", input),
    );
};

export const deletePizza = async (
    pizzaId: string,
): Promise<ProductionSettings> => {
    return requestCatalog(
        `/api/catalog/pizzas/${encodeURIComponent(
            pizzaId,
        )}`,
        {
            method: "DELETE",
        },
    );
};

export const createDistributor = async (
    input: CreateDistributorInput,
): Promise<ProductionSettings> => {
    return requestCatalog(
        "/api/catalog/distributors",
        createJsonRequest("POST", input),
    );
};

export const updateDistributor = async (
    distributorId: string,
    update: DistributorCatalogUpdate,
): Promise<ProductionSettings> => {
    return requestCatalog(
        `/api/catalog/distributors/${encodeURIComponent(
            distributorId,
        )}`,
        createJsonRequest("PATCH", update),
    );
};

export const deleteDistributor = async (
    distributorId: string,
): Promise<ProductionSettings> => {
    return requestCatalog(
        `/api/catalog/distributors/${encodeURIComponent(
            distributorId,
        )}`,
        {
            method: "DELETE",
        },
    );
};
