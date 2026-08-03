import type { Pizza } from "../../types/catalog.js";

type PizzaSeed = Omit<Pizza, "ingredientIds">;

const pizza = (
    id: string,
    name: string,
    base: PizzaSeed["base"],
    order: number,
    active: boolean,
): PizzaSeed => ({
    id,
    name,
    base,
    order,
    active,
    configured: true,
});

export const PIZZAS_SEED: PizzaSeed[] = [
    pizza("reine", "REINE", "tomato", 1, true),
    pizza("royale", "ROYALE", "tomato", 2, true),
    pizza("burger", "BURGER", "tomato", 3, true),
    pizza("cannibale", "CANNIBALE", "tomato", 4, true),
    pizza("4-fromages", "4 FROMAGES", "tomato", 5, true),
    pizza("chevre-miel", "CHÈVRE MIEL", "cream", 6, true),
    pizza("poulet-curry", "POULET CURRY", "cream", 7, true),
    pizza("kebab", "KEBAB", "cream", 8, true),
    pizza("langroise", "LANGROISE", "cream", 9, true),
    pizza("raclette", "RACLETTE", "cream", 10, true),
    pizza(
        "franc-comtoise",
        "FRANC-COMTOISE",
        "cream",
        11,
        true,
    ),
    pizza("basquaise", "BASQUAISE", "tomato", 12, false),
    pizza("bearnaise", "BÉARNAISE", "tomato", 13, false),
    pizza("buffalo", "BUFFALO", "tomato", 14, false),
    pizza("campagnarde", "CAMPAGNARDE", "tomato", 15, false),
    pizza("capra", "CAPRA", "tomato", 16, false),
    pizza("forestiere", "FORESTIÈRE", "tomato", 17, false),
    pizza("italienne", "ITALIENNE", "tomato", 18, false),
    pizza(
        "merguez-chorizo",
        "MERGUEZ CHORIZO",
        "tomato",
        19,
        false,
    ),
    pizza("boursin", "BOURSIN", "cream", 20, false),
    pizza("flammekueche", "FLAMMEKUECHE", "cream", 21, false),
    pizza("montagnarde", "MONTAGNARDE", "cream", 22, false),
    pizza("morbiflette", "MORBIFLETTE", "cream", 23, false),
    pizza("tartiflette", "TARTIFLETTE", "cream", 24, false),
];
