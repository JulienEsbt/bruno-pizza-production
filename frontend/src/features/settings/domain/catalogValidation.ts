import type {
    DistributorCatalogItem,
    IngredientCatalogItem,
    PizzaBase,
    PizzaCatalogItem,
    ProductionSettings,
} from "../../../types/settings";

const isRecord = (
    value: unknown,
): value is Record<string, unknown> => {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
    );
};

const isPizzaBase = (
    value: unknown,
): value is PizzaBase => {
    return (
        value === "tomato" ||
        value === "cream" ||
        value === "other"
    );
};

const isIngredient = (
    value: unknown,
): value is IngredientCatalogItem => {
    return (
        isRecord(value) &&
        typeof value.id === "string" &&
        Boolean(value.id.trim()) &&
        typeof value.name === "string" &&
        Boolean(value.name.trim()) &&
        typeof value.active === "boolean"
    );
};

const isPizza = (
    value: unknown,
): value is PizzaCatalogItem => {
    return (
        isRecord(value) &&
        typeof value.id === "string" &&
        Boolean(value.id.trim()) &&
        typeof value.name === "string" &&
        Boolean(value.name.trim()) &&
        isPizzaBase(value.base) &&
        typeof value.order === "number" &&
        Number.isInteger(value.order) &&
        value.order > 0 &&
        typeof value.active === "boolean" &&
        typeof value.configured === "boolean" &&
        (value.imageUpdatedAt === undefined ||
            (typeof value.imageUpdatedAt === "string" &&
                Boolean(
                    value.imageUpdatedAt.trim(),
                ))) &&
        Array.isArray(value.ingredientIds) &&
        value.ingredientIds.every(
            (ingredientId) =>
                typeof ingredientId === "string",
        )
    );
};

const isDistributor = (
    value: unknown,
): value is DistributorCatalogItem => {
    return (
        isRecord(value) &&
        typeof value.id === "string" &&
        Boolean(value.id.trim()) &&
        typeof value.name === "string" &&
        Boolean(value.name.trim()) &&
        typeof value.sourceName === "string" &&
        Boolean(value.sourceName.trim()) &&
        typeof value.shortName === "string" &&
        Boolean(value.shortName.trim()) &&
        typeof value.order === "number" &&
        Number.isInteger(value.order) &&
        value.order > 0 &&
        typeof value.active === "boolean" &&
        typeof value.backgroundColor === "string" &&
        /^#[0-9A-F]{6}$/i.test(
            value.backgroundColor,
        ) &&
        typeof value.foregroundColor === "string" &&
        /^#[0-9A-F]{6}$/i.test(
            value.foregroundColor,
        ) &&
        typeof value.accentColor === "string" &&
        /^#[0-9A-F]{6}$/i.test(value.accentColor)
    );
};

const hasUniqueValues = <T>(
    values: T[],
): boolean => {
    return new Set(values).size === values.length;
};

export const parseProductionSettings = (
    value: unknown,
): ProductionSettings => {
    if (
        !isRecord(value) ||
        !Array.isArray(value.ingredients) ||
        !value.ingredients.every(isIngredient) ||
        !Array.isArray(value.pizzas) ||
        !value.pizzas.every(isPizza) ||
        !Array.isArray(value.distributors) ||
        !value.distributors.every(isDistributor)
    ) {
        throw new Error(
            "Le catalogue reçu du backend est invalide.",
        );
    }

    const ingredientIds = new Set(
        value.ingredients.map(
            (ingredient) => ingredient.id,
        ),
    );

    const hasValidRelationships =
        hasUniqueValues(
            value.ingredients.map(
                (ingredient) => ingredient.id,
            ),
        ) &&
        hasUniqueValues(
            value.pizzas.map((pizza) => pizza.id),
        ) &&
        hasUniqueValues(
            value.pizzas.map((pizza) => pizza.order),
        ) &&
        hasUniqueValues(
            value.distributors.map(
                (distributor) => distributor.id,
            ),
        ) &&
        hasUniqueValues(
            value.distributors.map(
                (distributor) =>
                    distributor.order,
            ),
        ) &&
        value.pizzas.every(
            (pizza) =>
                hasUniqueValues(
                    pizza.ingredientIds,
                ) &&
                pizza.ingredientIds.every(
                    (ingredientId) =>
                        ingredientIds.has(
                            ingredientId,
                        ),
                ),
        );

    if (!hasValidRelationships) {
        throw new Error(
            "Le catalogue reçu du backend contient des références incohérentes.",
        );
    }

    return {
        ingredients: value.ingredients,
        pizzas: value.pizzas,
        distributors: value.distributors,
    };
};
