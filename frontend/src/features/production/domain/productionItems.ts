import type { ProductionDay } from "../../../types/production";

// These accessories are sold by the distributors but are not pizzas to make.
// Match the whole label so that unrelated or unknown recipes remain visible.
export const isPizzaKit = (name: string): boolean => {
    const normalizedName = name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("fr-FR")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();

    return /^kits? pizzas?$/.test(normalizedName);
};

export const excludePizzaKits = (
    production: ProductionDay,
): ProductionDay => ({
    ...production,
    pizzas: production.pizzas.filter(
        (pizza) => !isPizzaKit(pizza.name),
    ),
});
