import type { PizzaIngredientMapping } from "../../types/catalog.js";

const mapPizza = (
    pizzaId: string,
    ingredientIds: string[],
): PizzaIngredientMapping[] => {
    return ingredientIds.map((ingredientId, index) => ({
        pizzaId,
        ingredientId,
        position: index + 1,
    }));
};

export const PIZZA_INGREDIENTS_SEED: PizzaIngredientMapping[] = [
    ...mapPizza("4-fromages", [
        "tomate",
        "mix-e-m",
        "langres",
        "chevre",
        "origan",
    ]),

    ...mapPizza("basquaise", [
        "tomate",
        "poulet",
        "oignons-frits",
        "poivrons",
        "sauce-andalouse",
        "mix-e-m",
        "chorizo",
        "olives-noires",
        "origan",
    ]),

    ...mapPizza("bearnaise", [
        "tomate",
        "sauce-bearnaise",
        "poulet-roti",
        "oignons-frits",
        "mix-e-m",
        "cheddar",
        "bacon",
        "poivrons",
        "origan",
    ]),

    ...mapPizza("buffalo", [
        "tomate",
        "boeuf-hache",
        "poivrons",
        "oignons",
        "sauce-andalouse",
        "mix-e-m",
        "chorizo",
        "origan",
    ]),

    ...mapPizza("burger", [
        "tomate",
        "boeuf-hache",
        "oignons-frits",
        "sauce-burger",
        "mix-e-m",
        "cheddar",
        "tomates",
        "origan",
    ]),

    ...mapPizza("campagnarde", [
        "tomate",
        "champignons",
        "poulet",
        "mix-e-m",
        "persillade",
        "chevre",
    ]),

    ...mapPizza("cannibale", [
        "tomate",
        "boeuf-hache",
        "poulet",
        "sauce-barbecue",
        "mix-e-m",
        "chorizo",
        "merguez",
        "herbes-de-provence",
    ]),

    ...mapPizza("capra", [
        "tomate",
        "champignons",
        "jambon-blanc",
        "mix-e-m",
        "chevre",
        "chorizo",
        "olives-noires",
        "origan",
    ]),

    ...mapPizza("forestiere", [
        "tomate",
        "champignons-de-paris",
        "jambon",
        "champignons-des-bois",
        "mix-e-m",
        "persillade",
    ]),

    ...mapPizza("italienne", [
        "tomate",
        "mix-e-m",
        "gorgonzola",
        "jambon-cru",
        "olives-noires",
        "origan",
    ]),

    ...mapPizza("merguez-chorizo", [
        "tomate",
        "merguez",
        "poivrons",
        "epices-tex-mex",
        "sauce-andalouse",
        "chorizo",
        "mix-e-m",
    ]),

    ...mapPizza("reine", [
        "tomate",
        "jambon",
        "mix-e-m",
        "origan",
        "olives-noires",
    ]),

    ...mapPizza("royale", [
        "tomate",
        "jambon",
        "champignons-de-paris",
        "creme-fraiche",
        "mix-e-m",
        "jambon-cru",
        "origan",
    ]),

    ...mapPizza("boursin", [
        "creme",
        "tomates",
        "fromage-ail-fines-herbes",
        "boeuf-hache",
        "boursin",
        "mix-e-m",
        "origan",
    ]),

    ...mapPizza("chevre-miel", [
        "creme",
        "mix-e-m",
        "chevre",
        "miel",
    ]),

    ...mapPizza("flammekueche", [
        "creme",
        "lardons",
        "oignons",
        "mix-e-m",
    ]),

    ...mapPizza("franc-comtoise", [
        "creme",
        "pomme-de-terre",
        "saucisse-fumee",
        "mix-e-m",
        "cancoillotte",
        "origan",
    ]),

    ...mapPizza("kebab", [
        "creme",
        "viande-kebab-poulet",
        "tomates-fraiches",
        "sauce-kebab",
        "salade",
        "mix-e-m",
        "origan",
    ]),

    ...mapPizza("langroise", [
        "creme",
        "pomme-de-terre",
        "lardons",
        "oignons",
        "mix-e-m",
        "fromage-de-langres",
        "origan",
    ]),

    ...mapPizza("montagnarde", [
        "creme",
        "pomme-de-terre",
        "jambon-blanc",
        "mix-e-m",
        "lard-fume",
        "mont-d-or",
        "origan",
    ]),

    ...mapPizza("morbiflette", [
        "creme",
        "pomme-de-terre",
        "lardons",
        "oignons",
        "mix-e-m",
        "morbier",
        "origan",
    ]),

    ...mapPizza("poulet-curry", [
        "creme",
        "champignons-de-paris",
        "oignons",
        "sauce-curry",
        "curry",
        "poulet-roti",
        "mix-e-m",
    ]),

    ...mapPizza("raclette", [
        "creme",
        "pomme-de-terre",
        "jambon",
        "mix-e-m",
        "bacon",
        "fromage-raclette",
        "origan",
    ]),

    ...mapPizza("tartiflette", [
        "creme",
        "pomme-de-terre",
        "lardons",
        "mix-e-m",
        "reblochon",
        "oignons-frits",
        "origan",
    ]),
];
