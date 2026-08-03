import assert from "node:assert/strict";
import test from "node:test";

import {
    enrichProductionFromCatalog,
    normalizeCatalogName,
} from "../src/features/production/domain/productionCatalog.ts";

import type { ProductionDay } from "../src/types/production.ts";
import type { ProductionSettings } from "../src/types/settings.ts";

const production: ProductionDay = {
    date: "29 juillet 2026",
    sourceUpdatedAt: "06:30",
    importedAt: "2026-07-29T06:35:00.000Z",
    sourceFileName: "production.xlsx",
    source: "excel",
    pizzas: [
        {
            id: "bearnaise",
            name: "Bearnaise",
            quantity: 4,
            ingredients: [],
            distributors: [
                {
                    id: "turenne",
                    name: "Turenne 393",
                    quantity: 4,
                },
            ],
        },
        {
            id: "inconnue",
            name: "INCONNUE",
            quantity: 1,
            ingredients: [],
            distributors: [
                {
                    id: "turenne",
                    name: "Turenne 393",
                    quantity: 1,
                },
            ],
        },
    ],
};

const settings: ProductionSettings = {
    ingredients: [
        {
            id: "tomate",
            name: "Tomate",
            active: true,
        },
    ],
    pizzas: [
        {
            id: "catalog-bearnaise",
            name: "BÉARNAISE",
            base: "tomato",
            order: 1,
            active: true,
            configured: true,
            ingredientIds: ["tomate"],
        },
    ],
    distributors: [],
};

test("normalise accents, ponctuation et espaces", () => {
    assert.equal(
        normalizeCatalogName("  BÉARNAISE - maison "),
        "BEARNAISE MAISON",
    );
});

test("enrichit et trie la production depuis le catalogue", () => {
    const result = enrichProductionFromCatalog(
        production,
        settings,
    );

    assert.equal(
        result.production.pizzas[0]?.id,
        "catalog-bearnaise",
    );
    assert.deepEqual(
        result.production.pizzas[0]?.ingredients,
        ["Tomate"],
    );
    assert.equal(result.report.matchedPizzaCount, 1);
    assert.deepEqual(
        result.report.unmatchedPizzaNames,
        ["INCONNUE"],
    );
});
