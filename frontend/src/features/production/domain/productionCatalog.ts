import type {
    PizzaProduction,
    ProductionDay,
} from "../../../types/production";

import type {
    PizzaCatalogItem,
    ProductionSettings,
} from "../../../types/settings";

export interface ProductionImportReport {
    importedPizzaCount: number;
    matchedPizzaCount: number;
    unmatchedPizzaNames: string[];
    unconfiguredPizzaNames: string[];
    inactivePizzaNames: string[];
}

export const normalizeCatalogName = (
    value: string,
): string => {
    return value
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleUpperCase("fr-FR")
        .replace(/[^A-Z0-9]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
};

const createCatalogPizzaMap = (
    pizzas: PizzaCatalogItem[],
): Map<string, PizzaCatalogItem> => {
    const pizzasByName =
        new Map<string, PizzaCatalogItem>();

    for (const pizza of pizzas) {
        const normalizedName =
            normalizeCatalogName(pizza.name);

        if (!pizzasByName.has(normalizedName)) {
            pizzasByName.set(normalizedName, pizza);
        }
    }

    return pizzasByName;
};

export const sortProductionPizzasByCatalog = (
    pizzas: PizzaProduction[],
    catalogPizzas: PizzaCatalogItem[],
): PizzaProduction[] => {
    const catalogPizzasByName =
        createCatalogPizzaMap(catalogPizzas);

    return pizzas
        .map((pizza, originalIndex) => ({
            pizza,
            originalIndex,
            catalogOrder:
                catalogPizzasByName.get(
                    normalizeCatalogName(
                        pizza.name,
                    ),
                )?.order ??
                Number.MAX_SAFE_INTEGER,
        }))
        .sort((firstPizza, secondPizza) => {
            const orderDifference =
                firstPizza.catalogOrder -
                secondPizza.catalogOrder;

            return orderDifference !== 0
                ? orderDifference
                : firstPizza.originalIndex -
                      secondPizza.originalIndex;
        })
        .map(({ pizza }) => pizza);
};

export const enrichProductionFromCatalog = (
    production: ProductionDay,
    settings: ProductionSettings,
): {
    production: ProductionDay;
    report: ProductionImportReport;
} => {
    const ingredientsById = new Map(
        settings.ingredients.map((ingredient) => [
            ingredient.id,
            ingredient.name,
        ]),
    );

    const catalogPizzasByName =
        createCatalogPizzaMap(settings.pizzas);

    const unmatchedPizzaNames: string[] = [];
    const unconfiguredPizzaNames: string[] = [];
    const inactivePizzaNames: string[] = [];
    let matchedPizzaCount = 0;

    const enrichedPizzas = production.pizzas.map(
        (importedPizza) => {
            const catalogPizza =
                catalogPizzasByName.get(
                    normalizeCatalogName(
                        importedPizza.name,
                    ),
                );

            if (!catalogPizza) {
                unmatchedPizzaNames.push(
                    importedPizza.name,
                );

                return importedPizza;
            }

            matchedPizzaCount += 1;

            if (!catalogPizza.configured) {
                unconfiguredPizzaNames.push(
                    importedPizza.name,
                );
            }

            if (!catalogPizza.active) {
                inactivePizzaNames.push(
                    importedPizza.name,
                );
            }

            const ingredients =
                catalogPizza.ingredientIds
                    .map((ingredientId) =>
                        ingredientsById.get(
                            ingredientId,
                        ),
                    )
                    .filter(
                        (
                            ingredientName,
                        ): ingredientName is string =>
                            Boolean(ingredientName),
                    );

            return {
                ...importedPizza,
                id: catalogPizza.id,
                name: catalogPizza.name,
                ingredients,
            };
        },
    );

    return {
        production: {
            ...production,
            pizzas: sortProductionPizzasByCatalog(
                enrichedPizzas,
                settings.pizzas,
            ),
        },
        report: {
            importedPizzaCount:
                production.pizzas.length,
            matchedPizzaCount,
            unmatchedPizzaNames,
            unconfiguredPizzaNames,
            inactivePizzaNames,
        },
    };
};
