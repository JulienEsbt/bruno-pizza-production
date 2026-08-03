import assert from "node:assert/strict";
import {
    mkdtempSync,
    rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test, {
    after,
} from "node:test";

const testDirectory = mkdtempSync(
    path.join(
        tmpdir(),
        "bruno-pizza-catalog-",
    ),
);

process.env.DATABASE_PATH = path.join(
    testDirectory,
    "catalog.sqlite",
);
process.env.PIZZA_IMAGES_DIRECTORY = path.join(
    testDirectory,
    "images",
);

const {
    CatalogError,
    createIngredient,
    createPizza,
    getCatalog,
    updateDistributor,
    updatePizza,
} = await import(
    "../src/services/catalogService.js"
);

const {
    database,
    initializeDatabase,
    migrateLegacyPizzaDefaults,
} = await import(
    "../src/database/database.js"
);

initializeDatabase();

after(() => {
    database.close();
    rmSync(testDirectory, {
        recursive: true,
        force: true,
    });
});

test("initialise le catalogue de référence", () => {
    const catalog = getCatalog();

    assert.ok(catalog.pizzas.length > 0);
    assert.ok(catalog.ingredients.length > 0);
    assert.ok(catalog.distributors.length > 0);

    assert.deepEqual(
        catalog.pizzas
            .filter((pizza) => pizza.active)
            .map((pizza) => pizza.name),
        [
            "REINE",
            "ROYALE",
            "BURGER",
            "CANNIBALE",
            "4 FROMAGES",
            "CHÈVRE MIEL",
            "POULET CURRY",
            "KEBAB",
            "LANGROISE",
            "RACLETTE",
            "FRANC-COMTOISE",
        ],
    );
});

test("met à niveau uniquement l’ancien catalogue pizza intact", () => {
    const legacyPizzaIds = [
        "4-fromages",
        "basquaise",
        "bearnaise",
        "buffalo",
        "burger",
        "campagnarde",
        "cannibale",
        "capra",
        "forestiere",
        "italienne",
        "merguez-chorizo",
        "reine",
        "royale",
        "boursin",
        "chevre-miel",
        "flammekueche",
        "franc-comtoise",
        "kebab",
        "langroise",
        "montagnarde",
        "morbiflette",
        "poulet-curry",
        "raclette",
        "tartiflette",
    ];
    const restoreLegacyPizza = database.prepare(`
        UPDATE pizzas
        SET display_order = ?, active = 1
        WHERE id = ?
    `);

    database.exec("BEGIN IMMEDIATE");
    database.exec(`
        UPDATE pizzas
        SET display_order = display_order + 100
    `);

    for (const [index, pizzaId] of
        legacyPizzaIds.entries()) {
        restoreLegacyPizza.run(index + 1, pizzaId);
    }

    database.exec("COMMIT");

    migrateLegacyPizzaDefaults();

    assert.deepEqual(
        getCatalog().pizzas
            .filter((pizza) => pizza.active)
            .map((pizza) => pizza.name),
        [
            "REINE",
            "ROYALE",
            "BURGER",
            "CANNIBALE",
            "4 FROMAGES",
            "CHÈVRE MIEL",
            "POULET CURRY",
            "KEBAB",
            "LANGROISE",
            "RACLETTE",
            "FRANC-COMTOISE",
        ],
    );

    database.prepare(`
        UPDATE pizzas
        SET active = 1
        WHERE id = 'basquaise'
    `).run();

    migrateLegacyPizzaDefaults();

    assert.equal(
        getCatalog().pizzas.find(
            (pizza) => pizza.id === "basquaise",
        )?.active,
        true,
    );
});

test("crée une pizza puis configure sa recette", () => {
    const ingredientCount =
        getCatalog().ingredients.length;

    const withIngredient = createIngredient({
        name: "Sauce test",
    });

    assert.equal(
        withIngredient.ingredients.length,
        ingredientCount + 1,
    );

    const ingredient =
        withIngredient.ingredients.find(
            (item) =>
                item.name === "Sauce test",
        );

    assert.ok(ingredient);

    const withPizza = createPizza({
        name: "Pizza test",
        base: "tomato",
    });

    const pizza = withPizza.pizzas.find(
        (item) => item.name === "PIZZA TEST",
    );

    assert.ok(pizza);
    assert.equal(pizza.active, false);
    assert.equal(pizza.configured, false);

    const configured = updatePizza(pizza.id, {
        ingredientIds: [ingredient.id],
        active: true,
    }).pizzas.find(
        (item) => item.id === pizza.id,
    );

    assert.equal(configured?.active, true);
    assert.equal(configured?.configured, true);
});

test("réordonne les distributeurs sans dupliquer leur position", () => {
    const distributors = getCatalog().distributors;
    const distributorToMove = distributors.at(-1);

    assert.ok(distributorToMove);

    const reorderedCatalog = updateDistributor(
        distributorToMove.id,
        {
            order: 1,
        },
    );

    assert.equal(
        reorderedCatalog.distributors[0]?.id,
        distributorToMove.id,
    );
    assert.deepEqual(
        reorderedCatalog.distributors.map(
            (distributor) => distributor.order,
        ),
        reorderedCatalog.distributors.map(
            (_, index) => index + 1,
        ),
    );
});

test("refuse un corps de requête invalide", () => {
    assert.throws(
        () =>
            createPizza(
                null as unknown as Parameters<
                    typeof createPizza
                >[0],
            ),
        (error: unknown) =>
            error instanceof CatalogError &&
            error.status === 400,
    );
});
