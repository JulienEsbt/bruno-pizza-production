import {
    Router,
    type Response,
} from "express";

import {
    createDistributor,
    updateDistributor,
    createIngredient,
    createPizza,
    CatalogError,
    deleteIngredient,
    deletePizza,
    getCatalog,
    updateIngredient,
    updatePizza,
    deleteDistributor,
} from "../services/catalogService.js";

import type {
    CreateDistributorInput,
    UpdateDistributorInput,
    CreateIngredientInput,
    CreatePizzaInput,
    UpdateIngredientInput,
    UpdatePizzaInput,
} from "../types/catalog.js";

export const catalogRouter = Router();

const sendCatalogError = (
    response: Response,
    error: unknown,
): void => {
    console.error("Erreur catalogue :", error);

    if (error instanceof CatalogError) {
        response.status(error.status).json({
            error: error.message,
        });
        return;
    }

    response.status(500).json({
        error:
            "Une erreur interne est survenue dans le catalogue.",
    });
};

catalogRouter.get(
    "/",
    (_request, response) => {
        response.json(getCatalog());
    },
);

catalogRouter.post(
    "/distributors",
    (request, response) => {
        try {
            const catalog = createDistributor(
                request.body as CreateDistributorInput,
            );

            response.status(201).json(catalog);
        } catch (error) {
            sendCatalogError(response, error);
        }
    },
);

catalogRouter.patch(
    "/distributors/:distributorId",
    (request, response) => {
        try {
            const catalog = updateDistributor(
                request.params.distributorId,
                request.body as UpdateDistributorInput,
            );

            response.json(catalog);
        } catch (error) {
            sendCatalogError(response, error);
        }
    },
);

catalogRouter.delete(
    "/distributors/:distributorId",
    (request, response) => {
        try {
            const catalog = deleteDistributor(
                request.params.distributorId,
            );

            response.json(catalog);
        } catch (error) {
            sendCatalogError(response, error);
        }
    },
);

catalogRouter.post(
    "/ingredients",
    (request, response) => {
        try {
            const catalog = createIngredient(
                request.body as CreateIngredientInput,
            );

            response.status(201).json(catalog);
        } catch (error) {
            sendCatalogError(response, error);
        }
    },
);

catalogRouter.patch(
    "/ingredients/:ingredientId",
    (request, response) => {
        try {
            const catalog = updateIngredient(
                request.params.ingredientId,
                request.body as UpdateIngredientInput,
            );

            response.json(catalog);
        } catch (error) {
            sendCatalogError(response, error);
        }
    },
);

catalogRouter.delete(
    "/ingredients/:ingredientId",
    (request, response) => {
        try {
            const catalog = deleteIngredient(
                request.params.ingredientId,
            );

            response.json(catalog);
        } catch (error) {
            sendCatalogError(response, error);
        }
    },
);

catalogRouter.post(
    "/pizzas",
    (request, response) => {
        try {
            const catalog = createPizza(
                request.body as CreatePizzaInput,
            );

            response.status(201).json(catalog);
        } catch (error) {
            sendCatalogError(response, error);
        }
    },
);

catalogRouter.patch(
    "/pizzas/:pizzaId",
    (request, response) => {
        try {
            const catalog = updatePizza(
                request.params.pizzaId,
                request.body as UpdatePizzaInput,
            );

            response.json(catalog);
        } catch (error) {
            sendCatalogError(response, error);
        }
    },
);

catalogRouter.delete(
    "/pizzas/:pizzaId",
    (request, response) => {
        try {
            const catalog = deletePizza(
                request.params.pizzaId,
            );

            response.json(catalog);
        } catch (error) {
            sendCatalogError(response, error);
        }
    },
);
