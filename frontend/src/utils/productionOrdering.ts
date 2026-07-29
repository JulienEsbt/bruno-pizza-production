import type {
    PizzaProduction,
} from "../types/production";

import type {
    PizzaCatalogItem,
} from "../types/settings";

const normalizeForMatching = (
    value: string,
): string => {
    return value
        .trim()
        .replace(/\s+/g, " ")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleUpperCase("fr-FR");
};

/**
 * Trie les pizzas d'une production selon l'ordre défini
 * dans le catalogue SQLite.
 *
 * Les pizzas absentes du catalogue restent affichées
 * à la fin, dans leur ordre d'origine.
 */
export const sortProductionPizzasByCatalog = (
    pizzas: PizzaProduction[],
    catalogPizzas: PizzaCatalogItem[],
): PizzaProduction[] => {
    const catalogOrderByName = new Map(
        catalogPizzas.map((pizza) => [
            normalizeForMatching(pizza.name),
            pizza.order,
        ]),
    );

    return pizzas
        .map((pizza, originalIndex) => ({
            pizza,
            originalIndex,
            catalogOrder:
                catalogOrderByName.get(
                    normalizeForMatching(
                        pizza.name,
                    ),
                ) ??
                Number.MAX_SAFE_INTEGER,
        }))
        .sort((firstPizza, secondPizza) => {
            const orderDifference =
                firstPizza.catalogOrder -
                secondPizza.catalogOrder;

            if (orderDifference !== 0) {
                return orderDifference;
            }

            return (
                firstPizza.originalIndex -
                secondPizza.originalIndex
            );
        })
        .map(({ pizza }) => pizza);
};
