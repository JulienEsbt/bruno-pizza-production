import { database } from "../database/database.js";

import type {
    Catalog,
    Distributor,
    Ingredient,
    Pizza,
    PizzaBase,
} from "../types/catalog.js";

interface IngredientRow {
    id: string;
    name: string;
    active: number;
}

interface DistributorRow {
    id: string;
    name: string;
    source_name: string;
    short_name: string;
    display_order: number;
    active: number;
    background_color: string;
    foreground_color: string;
    accent_color: string;
}

interface PizzaRow {
    id: string;
    name: string;
    base: PizzaBase;
    display_order: number;
    active: number;
    configured: number;
    image_updated_at: string | null;
}

interface MappingRow {
    pizza_id: string;
    ingredient_id: string;
}

interface CountRow {
    count: number;
}

interface OrderRow {
    id: string;
}

export const runInTransaction = <T>(
    operation: () => T,
): T => {
    database.exec("BEGIN IMMEDIATE");

    try {
        const result = operation();

        database.exec("COMMIT");

        return result;
    } catch (error) {
        database.exec("ROLLBACK");

        throw error;
    }
};

export const getCatalogFromDatabase = (): Catalog => {
    const distributorRows = database
        .prepare(`
            SELECT
                id,
                name,
                source_name,
                short_name,
                display_order,
                active,
                background_color,
                foreground_color,
                accent_color
            FROM distributors
            ORDER BY display_order, name COLLATE NOCASE
        `)
        .all() as unknown as DistributorRow[];

    const ingredientRows = database
        .prepare(`
            SELECT
                id,
                name,
                active
            FROM ingredients
            ORDER BY name COLLATE NOCASE
        `)
        .all() as unknown as IngredientRow[];

    const pizzaRows = database
        .prepare(`
            SELECT
                pizzas.id,
                pizzas.name,
                pizzas.base,
                pizzas.display_order,
                pizzas.active,
                pizzas.configured,
                pizza_images.updated_at AS image_updated_at
            FROM pizzas
            LEFT JOIN pizza_images
                ON pizza_images.pizza_id = pizzas.id
            ORDER BY
                pizzas.display_order,
                pizzas.name COLLATE NOCASE
        `)
        .all() as unknown as PizzaRow[];

    const mappingRows = database
        .prepare(`
            SELECT
                pizza_id,
                ingredient_id
            FROM pizza_ingredients
            ORDER BY pizza_id, position
        `)
        .all() as unknown as MappingRow[];

    const ingredientIdsByPizzaId = new Map<
        string,
        string[]
    >();

    for (const mapping of mappingRows) {
        const ingredientIds =
            ingredientIdsByPizzaId.get(
                mapping.pizza_id,
            ) ?? [];

        ingredientIds.push(mapping.ingredient_id);

        ingredientIdsByPizzaId.set(
            mapping.pizza_id,
            ingredientIds,
        );
    }

    const ingredients: Ingredient[] =
        ingredientRows.map((row) => ({
            id: row.id,
            name: row.name,
            active: row.active === 1,
        }));

    const distributors: Distributor[] =
        distributorRows.map((row) => ({
            id: row.id,
            name: row.name,
            sourceName: row.source_name,
            shortName: row.short_name,
            order: row.display_order,
            active: row.active === 1,
            backgroundColor:
                row.background_color,
            foregroundColor:
                row.foreground_color,
            accentColor: row.accent_color,
        }));

    const pizzas: Pizza[] = pizzaRows.map(
        (row) => ({
            id: row.id,
            name: row.name,
            base: row.base,
            order: row.display_order,
            active: row.active === 1,
            configured: row.configured === 1,
            ingredientIds:
                ingredientIdsByPizzaId.get(row.id) ??
                [],
            ...(row.image_updated_at
                ? {
                      imageUpdatedAt:
                          row.image_updated_at,
                  }
                : {}),
        }),
    );

    return {
        ingredients,
        pizzas,
        distributors,
    };
};

export const ingredientExists = (
    ingredientId: string,
): boolean => {
    const row = database
        .prepare(`
            SELECT id
            FROM ingredients
            WHERE id = ?
        `)
        .get(ingredientId);

    return Boolean(row);
};

export const ingredientNameExists = (
    name: string,
    excludedIngredientId?: string,
): boolean => {
    const row = excludedIngredientId
        ? database
              .prepare(`
                  SELECT id
                  FROM ingredients
                  WHERE
                      name = ? COLLATE NOCASE
                      AND id <> ?
              `)
              .get(name, excludedIngredientId)
        : database
              .prepare(`
                  SELECT id
                  FROM ingredients
                  WHERE name = ? COLLATE NOCASE
              `)
              .get(name);

    return Boolean(row);
};

export const countIngredientUsages = (
    ingredientId: string,
): number => {
    const row = database
        .prepare(`
            SELECT COUNT(*) AS count
            FROM pizza_ingredients
            WHERE ingredient_id = ?
        `)
        .get(ingredientId) as unknown as CountRow;

    return Number(row.count);
};

export const insertIngredient = (
    id: string,
    name: string,
): void => {
    database
        .prepare(`
            INSERT INTO ingredients (
                id,
                name,
                active
            )
            VALUES (?, ?, 1)
        `)
        .run(id, name);
};

export const updateIngredientFields = (
    ingredientId: string,
    fields: {
        name?: string;
        active?: boolean;
    },
): void => {
    if (fields.name !== undefined) {
        database
            .prepare(`
                UPDATE ingredients
                SET
                    name = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `)
            .run(fields.name, ingredientId);
    }

    if (fields.active !== undefined) {
        database
            .prepare(`
                UPDATE ingredients
                SET
                    active = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `)
            .run(
                fields.active ? 1 : 0,
                ingredientId,
            );
    }
};

export const removeIngredient = (
    ingredientId: string,
): void => {
    database
        .prepare(`
            DELETE FROM ingredients
            WHERE id = ?
        `)
        .run(ingredientId);
};

export const pizzaExists = (
    pizzaId: string,
): boolean => {
    const row = database
        .prepare(`
            SELECT id
            FROM pizzas
            WHERE id = ?
        `)
        .get(pizzaId);

    return Boolean(row);
};

export const pizzaNameExists = (
    name: string,
    excludedPizzaId?: string,
): boolean => {
    const row = excludedPizzaId
        ? database
              .prepare(`
                  SELECT id
                  FROM pizzas
                  WHERE
                      name = ? COLLATE NOCASE
                      AND id <> ?
              `)
              .get(name, excludedPizzaId)
        : database
              .prepare(`
                  SELECT id
                  FROM pizzas
                  WHERE name = ? COLLATE NOCASE
              `)
              .get(name);

    return Boolean(row);
};

export const countPizzas = (): number => {
    const row = database
        .prepare(`
            SELECT COUNT(*) AS count
            FROM pizzas
        `)
        .get() as unknown as CountRow;

    return Number(row.count);
};

export const countPizzaIngredients = (
    pizzaId: string,
): number => {
    const row = database
        .prepare(`
            SELECT COUNT(*) AS count
            FROM pizza_ingredients
            WHERE pizza_id = ?
        `)
        .get(pizzaId) as unknown as CountRow;

    return Number(row.count);
};

export const insertPizza = (
    pizza: {
        id: string;
        name: string;
        base: PizzaBase;
        order: number;
    },
): void => {
    database
        .prepare(`
            INSERT INTO pizzas (
                id,
                name,
                base,
                display_order,
                active,
                configured
            )
            VALUES (?, ?, ?, ?, 0, 0)
        `)
        .run(
            pizza.id,
            pizza.name,
            pizza.base,
            pizza.order,
        );
};

export const updatePizzaFields = (
    pizzaId: string,
    fields: {
        name?: string;
        base?: PizzaBase;
        active?: boolean;
        configured?: boolean;
    },
): void => {
    if (fields.name !== undefined) {
        database
            .prepare(`
                UPDATE pizzas
                SET
                    name = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `)
            .run(fields.name, pizzaId);
    }

    if (fields.base !== undefined) {
        database
            .prepare(`
                UPDATE pizzas
                SET
                    base = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `)
            .run(fields.base, pizzaId);
    }

    if (fields.active !== undefined) {
        database
            .prepare(`
                UPDATE pizzas
                SET
                    active = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `)
            .run(
                fields.active ? 1 : 0,
                pizzaId,
            );
    }

    if (fields.configured !== undefined) {
        database
            .prepare(`
                UPDATE pizzas
                SET
                    configured = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `)
            .run(
                fields.configured ? 1 : 0,
                pizzaId,
            );
    }
};

export const replacePizzaIngredientMappings = (
    pizzaId: string,
    ingredientIds: string[],
): void => {
    database
        .prepare(`
            DELETE FROM pizza_ingredients
            WHERE pizza_id = ?
        `)
        .run(pizzaId);

    const insertStatement = database.prepare(`
        INSERT INTO pizza_ingredients (
            pizza_id,
            ingredient_id,
            position
        )
        VALUES (?, ?, ?)
    `);

    ingredientIds.forEach(
        (ingredientId, index) => {
            insertStatement.run(
                pizzaId,
                ingredientId,
                index + 1,
            );
        },
    );
};

export const getOrderedPizzaIds =
    (): string[] => {
        const rows = database
            .prepare(`
                SELECT id
                FROM pizzas
                ORDER BY display_order, name COLLATE NOCASE
            `)
            .all() as unknown as OrderRow[];

        return rows.map((row) => row.id);
    };

export const replacePizzaOrder = (
    orderedPizzaIds: string[],
): void => {
    /*
     * Première passe avec des ordres négatifs.
     *
     * Cela évite les collisions avec la contrainte
     * UNIQUE de display_order pendant la réorganisation.
     */
    const temporaryOrderStatement =
        database.prepare(`
            UPDATE pizzas
            SET display_order = ?
            WHERE id = ?
        `);

    orderedPizzaIds.forEach(
        (pizzaId, index) => {
            temporaryOrderStatement.run(
                -(index + 1),
                pizzaId,
            );
        },
    );

    const definitiveOrderStatement =
        database.prepare(`
            UPDATE pizzas
            SET
                display_order = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);

    orderedPizzaIds.forEach(
        (pizzaId, index) => {
            definitiveOrderStatement.run(
                index + 1,
                pizzaId,
            );
        },
    );
};

export const removePizza = (
    pizzaId: string,
): void => {
    database
        .prepare(`
            DELETE FROM pizzas
            WHERE id = ?
        `)
        .run(pizzaId);
};


export const distributorExists = (
    distributorId: string,
): boolean => {
    const row = database
        .prepare(`
            SELECT id
            FROM distributors
            WHERE id = ?
        `)
        .get(distributorId);

    return Boolean(row);
};

export const distributorNameExists = (
    name: string,
    excludedDistributorId?: string,
): boolean => {
    const row = excludedDistributorId
        ? database
              .prepare(`
                  SELECT id
                  FROM distributors
                  WHERE
                      name = ? COLLATE NOCASE
                      AND id <> ?
              `)
              .get(name, excludedDistributorId)
        : database
              .prepare(`
                  SELECT id
                  FROM distributors
                  WHERE name = ? COLLATE NOCASE
              `)
              .get(name);

    return Boolean(row);
};

export const distributorSourceNameExists = (
    sourceName: string,
    excludedDistributorId?: string,
): boolean => {
    const row = excludedDistributorId
        ? database
              .prepare(`
                  SELECT id
                  FROM distributors
                  WHERE
                      source_name = ? COLLATE NOCASE
                      AND id <> ?
              `)
              .get(
                  sourceName,
                  excludedDistributorId,
              )
        : database
              .prepare(`
                  SELECT id
                  FROM distributors
                  WHERE source_name = ? COLLATE NOCASE
              `)
              .get(sourceName);

    return Boolean(row);
};

export const distributorShortNameExists = (
    shortName: string,
    excludedDistributorId?: string,
): boolean => {
    const row = excludedDistributorId
        ? database
              .prepare(`
                  SELECT id
                  FROM distributors
                  WHERE
                      short_name = ? COLLATE NOCASE
                      AND id <> ?
              `)
              .get(
                  shortName,
                  excludedDistributorId,
              )
        : database
              .prepare(`
                  SELECT id
                  FROM distributors
                  WHERE short_name = ? COLLATE NOCASE
              `)
              .get(shortName);

    return Boolean(row);
};

export const countDistributors = (): number => {
    const row = database
        .prepare(`
            SELECT COUNT(*) AS count
            FROM distributors
        `)
        .get() as unknown as CountRow;

    return Number(row.count);
};

export const insertDistributor = (
    distributor: {
        id: string;
        name: string;
        sourceName: string;
        shortName: string;
        order: number;
        backgroundColor: string;
        foregroundColor: string;
        accentColor: string;
    },
): void => {
    database
        .prepare(`
            INSERT INTO distributors (
                id,
                name,
                source_name,
                short_name,
                display_order,
                active,
                background_color,
                foreground_color,
                accent_color
            )
            VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
        `)
        .run(
            distributor.id,
            distributor.name,
            distributor.sourceName,
            distributor.shortName,
            distributor.order,
            distributor.backgroundColor,
            distributor.foregroundColor,
            distributor.accentColor,
        );
};

export const updateDistributorFields = (
    distributorId: string,
    fields: {
        name?: string;
        sourceName?: string;
        shortName?: string;
        active?: boolean;
        backgroundColor?: string;
        foregroundColor?: string;
        accentColor?: string;
    },
): void => {
    if (fields.name !== undefined) {
        database
            .prepare(`
                UPDATE distributors
                SET
                    name = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `)
            .run(fields.name, distributorId);
    }


    if (fields.sourceName !== undefined) {
        database
            .prepare(`
                UPDATE distributors
                SET
                    source_name = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `)
            .run(
                fields.sourceName,
                distributorId,
            );
    }

    if (fields.shortName !== undefined) {
        database
            .prepare(`
                UPDATE distributors
                SET
                    short_name = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `)
            .run(
                fields.shortName,
                distributorId,
            );
    }

    if (fields.active !== undefined) {
        database
            .prepare(`
                UPDATE distributors
                SET
                    active = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `)
            .run(
                fields.active ? 1 : 0,
                distributorId,
            );
    }

    if (fields.backgroundColor !== undefined) {
        database
            .prepare(`
                UPDATE distributors
                SET
                    background_color = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `)
            .run(
                fields.backgroundColor,
                distributorId,
            );
    }

    if (fields.foregroundColor !== undefined) {
        database
            .prepare(`
                UPDATE distributors
                SET
                    foreground_color = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `)
            .run(
                fields.foregroundColor,
                distributorId,
            );
    }

    if (fields.accentColor !== undefined) {
        database
            .prepare(`
                UPDATE distributors
                SET
                    accent_color = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `)
            .run(
                fields.accentColor,
                distributorId,
            );
    }
};

export const getOrderedDistributorIds =
    (): string[] => {
        const rows = database
            .prepare(`
                SELECT id
                FROM distributors
                ORDER BY
                    display_order,
                    name COLLATE NOCASE
            `)
            .all() as unknown as OrderRow[];

        return rows.map((row) => row.id);
    };

export const replaceDistributorOrder = (
    orderedDistributorIds: string[],
): void => {
    const temporaryStatement =
        database.prepare(`
            UPDATE distributors
            SET display_order = ?
            WHERE id = ?
        `);

    orderedDistributorIds.forEach(
        (distributorId, index) => {
            temporaryStatement.run(
                -(index + 1),
                distributorId,
            );
        },
    );

    const definitiveStatement =
        database.prepare(`
            UPDATE distributors
            SET
                display_order = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);

    orderedDistributorIds.forEach(
        (distributorId, index) => {
            definitiveStatement.run(
                index + 1,
                distributorId,
            );
        },
    );
};

export const removeDistributor = (
    distributorId: string,
): void => {
    database
        .prepare(`
            DELETE FROM distributors
            WHERE id = ?
        `)
        .run(distributorId);
};
