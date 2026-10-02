import assert from "node:assert/strict";
import test from "node:test";

import { restoreProduction } from "../src/features/production/domain/productionStorage.ts";

const storedProduction = {
    version: 2,
    production: {
        source: "excel",
        date: "30 septembre 2026",
        sourceUpdatedAt: "05:33",
        importedAt: "2026-09-30T05:33:00.000Z",
        sourceFileName: "avant-mise-a-jour.xlsx",
        pizzas: [
            { id: "kit-pizza", name: "KIT Pizza", quantity: 1, ingredients: [],
                distributors: [{ id: "inter", name: "INTER 2194", quantity: 1 }] },
            { id: "reine", name: "REINE", quantity: 3, ingredients: ["Tomate", "Jambon"],
                distributors: [{ id: "inter", name: "INTER 2194", quantity: 3 }] },
            { id: "inconnue", name: "INCONNUE", quantity: 2, ingredients: [],
                distributors: [{ id: "inter", name: "INTER 2194", quantity: 2 }] },
        ],
    },
};

test("restaure une sauvegarde V1 en retirant seulement les kits", () => {
    const result = restoreProduction(JSON.stringify(storedProduction));

    assert.deepEqual(result, {
        ...storedProduction.production,
        pizzas: storedProduction.production.pizzas.slice(1),
    });
    assert.equal(result.pizzas.reduce((sum, pizza) => sum + pizza.quantity, 0), 5);
    assert.equal(storedProduction.production.pizzas.length, 3);
});

test("conserve une production vide et sa date après retrait du dernier kit", () => {
    const result = restoreProduction(JSON.stringify({
        ...storedProduction,
        production: {
            ...storedProduction.production,
            pizzas: storedProduction.production.pizzas.slice(0, 1),
        },
    }));

    assert.equal(result.source, "excel");
    assert.equal(result.date, storedProduction.production.date);
    assert.deepEqual(result.pizzas, []);
    assert.deepEqual(restoreProduction(JSON.stringify({ version: 2, production: result })), result);
});

test("une sauvegarde invalide ne restaure pas de production", () => {
    for (const value of [null, "{", "null", "[]", JSON.stringify({ ...storedProduction, version: 99 }),
        JSON.stringify({ ...storedProduction, production: { ...storedProduction.production, pizzas: [null] } })]) {
        const result = restoreProduction(value);
        assert.equal(result.source, "empty");
        assert.deepEqual(result.pizzas, []);
    }
});
