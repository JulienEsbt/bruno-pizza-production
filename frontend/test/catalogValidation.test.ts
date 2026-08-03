import assert from "node:assert/strict";
import test from "node:test";

import { parseProductionSettings } from "../src/features/settings/domain/catalogValidation.ts";

const createValidCatalog = () => ({
    ingredients: [
        {
            id: "ingredient-1",
            name: "Mozzarella",
            active: true,
        },
    ],
    pizzas: [
        {
            id: "pizza-1",
            name: "REINE",
            base: "tomato",
            order: 1,
            active: true,
            configured: true,
            ingredientIds: ["ingredient-1"],
        },
    ],
    distributors: [
        {
            id: "distributor-1",
            name: "Turenne",
            sourceName: "Turenne 393",
            shortName: "TURE",
            order: 1,
            active: true,
            backgroundColor: "#2563EB",
            foregroundColor: "#FFFFFF",
            accentColor: "#1D4ED8",
        },
    ],
});

test("valide un catalogue cohérent", () => {
    const catalog = createValidCatalog();

    assert.deepEqual(
        parseProductionSettings(catalog),
        catalog,
    );
});

test("refuse une référence d’ingrédient inconnue", () => {
    const catalog = createValidCatalog();
    catalog.pizzas[0].ingredientIds = [
        "ingredient-inconnu",
    ];

    assert.throws(
        () => parseProductionSettings(catalog),
        /références incohérentes/,
    );
});

test("refuse les identifiants dupliqués", () => {
    const catalog = createValidCatalog();
    catalog.ingredients.push({
        id: "ingredient-1",
        name: "Jambon",
        active: true,
    });

    assert.throws(
        () => parseProductionSettings(catalog),
        /références incohérentes/,
    );
});
