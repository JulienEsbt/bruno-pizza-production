import type { DistributorProduction, ProductionDay } from "../../../types/production.ts";

export const isQuantityValid = (value: unknown): value is number =>
    typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

export const isQuantityModified = (cell: DistributorProduction): boolean =>
    cell.originalQuantity !== undefined && cell.quantity !== cell.originalQuantity;

export const countProductionChanges = (production: ProductionDay): number =>
    production.pizzas.reduce((count, pizza) =>
        count + pizza.distributors.filter(isQuantityModified).length, 0);

export function updateProductionQuantity(
    production: ProductionDay, pizzaId: string, distributorId: string, quantity: number,
): ProductionDay {
    if (production.source !== "excel" || !isQuantityValid(quantity)) return production;
    const pizza = production.pizzas.find((item) => item.id === pizzaId);
    const column = production.pizzas.flatMap((item) => item.distributors)
        .find((item) => item.id === distributorId);
    if (!pizza || !column) return production;
    const previous = pizza.distributors.find((item) => item.id === distributorId);
    if ((previous?.quantity ?? 0) === quantity) return production;
    const total = production.pizzas.reduce((sum, item) => sum + item.quantity, 0)
        - (previous?.quantity ?? 0) + quantity;
    if (!isQuantityValid(total)) return production;
    const updated = {
        id: distributorId, name: column.name, quantity,
        originalQuantity: previous?.originalQuantity ?? previous?.quantity ?? 0,
    };
    const distributors = previous
        ? pizza.distributors.map((item) => item.id === distributorId ? updated : item)
        : [...pizza.distributors, updated];
    return {
        ...production,
        revision: (production.revision ?? 0) + 1,
        pizzas: production.pizzas.map((item) => item.id === pizzaId ? {
            ...item, distributors,
            quantity: distributors.reduce((sum, cell) => sum + cell.quantity, 0),
        } : item),
    };
}

export function resetProductionChanges(production: ProductionDay): ProductionDay {
    if (!countProductionChanges(production)) return production;
    return {
        ...production,
        revision: (production.revision ?? 0) + 1,
        pizzas: production.pizzas.map((pizza) => {
            const distributors = pizza.distributors.map((cell) => ({
                id: cell.id, name: cell.name,
                quantity: cell.originalQuantity ?? cell.quantity,
            }));
            return {...pizza, distributors,
                quantity: distributors.reduce((sum, cell) => sum + cell.quantity, 0)};
        }),
    };
}
