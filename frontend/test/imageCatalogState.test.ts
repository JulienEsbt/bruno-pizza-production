import assert from "node:assert/strict";
import test from "node:test";

import { updatePizzaImageUpdatedAt } from "../src/features/settings/domain/imageCatalogState.ts";

const settings = {
    ingredients: [],
    distributors: [],
    pizzas: [
        {
            id: "reine",
            name: "REINE",
            base: "tomato" as const,
            order: 1,
            active: true,
            configured: true,
            ingredientIds: [],
        },
        {
            id: "royale",
            name: "ROYALE",
            base: "tomato" as const,
            order: 2,
            active: true,
            configured: true,
            ingredientIds: [],
        },
    ],
};

test("conserve une photo ajoutée lors du prochain affichage", () => {
    const updated = updatePizzaImageUpdatedAt(
        settings,
        "reine",
        "2026-08-03 15:30:00",
    );

    assert.equal(
        updated.pizzas[0]?.imageUpdatedAt,
        "2026-08-03 15:30:00",
    );
    assert.equal(
        updated.pizzas[1]?.imageUpdatedAt,
        undefined,
    );
});

test("retire uniquement l’état de photo lors de sa suppression", () => {
    const withImage = updatePizzaImageUpdatedAt(
        settings,
        "reine",
        "2026-08-03 15:30:00",
    );
    const withoutImage = updatePizzaImageUpdatedAt(
        withImage,
        "reine",
        null,
    );

    assert.equal(
        withoutImage.pizzas[0]?.imageUpdatedAt,
        undefined,
    );
    assert.equal(withoutImage.pizzas[0]?.name, "REINE");
});
