import assert from "node:assert/strict";
import test from "node:test";
import { countProductionChanges, resetProductionChanges, updateProductionQuantity } from "../src/features/production/domain/productionEditing.ts";
import { restoreProduction, PRODUCTION_STORAGE_VERSION } from "../src/features/production/domain/productionStorage.ts";
import { parseProductionRows } from "../src/features/production/services/excelProductionService.ts";

const fixture = () => parseProductionRows([
    ["30/09/2026 05:33"],
    ["Pizza", "Turenne 393", "CHAL 1030", "Total"],
    ["REINE", 2, 3, 5],
    ["ROYALE", 0, 10, 10],
    ["Total", 2, 13, 15],
], "production.xlsx", "2026-09-30T05:34:00.000Z");

test("corrige une case sans toucher au fichier ni aux autres pizzas et conserve son origine", () => {
    const initial = fixture();
    const before = JSON.stringify(initial);
    const pizza = initial.pizzas[0];
    const column = pizza.distributors[0];
    const changed = updateProductionQuantity(initial, pizza.id, column.id, 7);
    assert.equal(changed.pizzas[0].quantity, 10);
    assert.equal(changed.pizzas.reduce((sum, p) => sum + p.quantity, 0), 20);
    assert.equal(changed.pizzas.reduce((sum, p) => sum + p.distributors[0].quantity, 0), 7);
    assert.equal(changed.pizzas[0].distributors[0].originalQuantity, 2);
    assert.equal(changed.pizzas[1], initial.pizzas[1]);
    assert.equal(changed.sourceFileName, initial.sourceFileName);
    assert.equal(changed.sourceUpdatedAt, initial.sourceUpdatedAt);
    assert.equal(JSON.stringify(initial), before);
    const second = updateProductionQuantity(changed, pizza.id, column.id, 8);
    assert.equal(second.pizzas[0].distributors[0].originalQuantity, 2);
    assert.equal(countProductionChanges(second), 1);
    assert.equal(second.revision, 2);
});

test("une case revenue à sa valeur Excel n'est plus marquée", () => {
    const initial = fixture();
    const pizza = initial.pizzas[0];
    const id = pizza.distributors[0].id;
    const changed = updateProductionQuantity(initial, pizza.id, id, 0);
    const reverted = updateProductionQuantity(changed, pizza.id, id, 2);
    assert.equal(countProductionChanges(reverted), 0);
    assert.equal(reverted.pizzas[0].quantity, 5);
    assert.equal(resetProductionChanges(initial), initial);
});

test("conserve lignes et colonnes à zéro, les restaure après fermeture et permet de les réaugmenter", () => {
    const initial = fixture();
    let zero = initial;
    for (const pizza of initial.pizzas) for (const cell of pizza.distributors) {
        zero = updateProductionQuantity(zero, pizza.id, cell.id, 0);
    }
    const loaded = restoreProduction(JSON.stringify({version: PRODUCTION_STORAGE_VERSION, production: zero}));
    assert.deepEqual(loaded, zero);
    assert.equal(loaded.pizzas.length, 2);
    assert.equal(loaded.pizzas.filter((pizza) => pizza.quantity > 0).length, 0);
    assert.equal(countProductionChanges(loaded), 3);
    const readded = updateProductionQuantity(loaded, loaded.pizzas[1].id, loaded.pizzas[1].distributors[0].id, 4);
    assert.equal(readded.pizzas[1].quantity, 4);
    assert.equal(countProductionChanges(readded), 4);
    const reset = resetProductionChanges(readded);
    assert.deepEqual(reset.pizzas, initial.pizzas);
    assert.equal(countProductionChanges(reset), 0);
    assert.ok((reset.revision ?? 0) > (loaded.revision ?? 0));
});

test("permet de corriger une cellule implicite à zéro d'une ancienne session V1", () => {
    const initial = fixture();
    initial.pizzas[1].distributors = initial.pizzas[1].distributors.filter((cell) => cell.quantity > 0);
    const restored = restoreProduction(JSON.stringify({version: 2, production: initial}));
    const changed = updateProductionQuantity(restored, restored.pizzas[1].id, restored.pizzas[0].distributors[0].id, 3);
    assert.equal(changed.pizzas[1].quantity, 13);
    assert.equal(changed.pizzas[1].distributors[1].originalQuantity, 0);
    const reset = resetProductionChanges(changed);
    assert.equal(reset.pizzas[1].quantity, 10);
    assert.equal(reset.pizzas[1].distributors[1].quantity, 0);
});

test("refuse quantités invalides, inconnues ou débordements et ne crée pas de fausse modification", () => {
    const initial = fixture();
    const pizza = initial.pizzas[0];
    const column = pizza.distributors[0];
    for (const value of [-1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, Number.MAX_SAFE_INTEGER]) {
        assert.equal(updateProductionQuantity(initial, pizza.id, column.id, value), initial);
    }
    assert.equal(updateProductionQuantity(initial, pizza.id, column.id, column.quantity), initial);
    assert.equal(updateProductionQuantity(initial, "absent", column.id, 5), initial);
    assert.equal(updateProductionQuantity(initial, pizza.id, "absent", 5), initial);
});

test("refuse les sauvegardes dont les totaux, origines ou axes sont corrompus", () => {
    for (const corrupt of [
        (p: ReturnType<typeof fixture>) => {p.pizzas[0].quantity = 100;},
        (p: ReturnType<typeof fixture>) => {p.pizzas[0].distributors[0].originalQuantity = -1;},
        (p: ReturnType<typeof fixture>) => {p.pizzas.push(p.pizzas[0]);},
        (p: ReturnType<typeof fixture>) => {p.pizzas[0].distributors[1].id = p.pizzas[0].distributors[0].id;},
    ]) {
        const initial = fixture(); corrupt(initial);
        assert.equal(restoreProduction(JSON.stringify({version: 3, production: initial})).source, "empty");
    }
});

test("un nouvel import repart de l'Excel et de zéro correction", () => {
    const initial = fixture();
    const changed = updateProductionQuantity(initial, initial.pizzas[0].id, initial.pizzas[0].distributors[0].id, 100);
    assert.equal(countProductionChanges(changed), 1);
    const reimported = fixture();
    assert.equal(countProductionChanges(reimported), 0);
    assert.equal(reimported.pizzas[0].quantity, 5);
    assert.equal(reimported.revision, undefined);
});
