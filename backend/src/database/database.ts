import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { config } from "../config.js";
import { INGREDIENTS_SEED } from "../data/seed/ingredients.seed.js";
import { PIZZA_INGREDIENTS_SEED } from "../data/seed/pizzaIngredients.seed.js";
import { PIZZAS_SEED } from "../data/seed/pizzas.seed.js";
import { DISTRIBUTORS_SEED } from "../data/seed/distributors.seed.js";

const databaseDirectory = path.dirname(
    config.databasePath,
);

fs.mkdirSync(databaseDirectory, {
    recursive: true,
});

export const database = new DatabaseSync(
    config.databasePath,
);

database.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
`);

const createSchema = (): void => {
    database.exec(`
        CREATE TABLE IF NOT EXISTS distributors (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE COLLATE NOCASE,
            source_name TEXT,
            short_name TEXT NOT NULL UNIQUE COLLATE NOCASE,
            display_order INTEGER NOT NULL UNIQUE,
            active INTEGER NOT NULL DEFAULT 1
                CHECK (active IN (0, 1)),
            background_color TEXT NOT NULL,
            foreground_color TEXT NOT NULL,
            accent_color TEXT NOT NULL,
            created_at TEXT NOT NULL
                DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL
                DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS ingredients (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE COLLATE NOCASE,
            active INTEGER NOT NULL DEFAULT 1
                CHECK (active IN (0, 1)),
            created_at TEXT NOT NULL
                DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL
                DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS pizzas (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE COLLATE NOCASE,
            base TEXT NOT NULL
                CHECK (base IN ('tomato', 'cream', 'other')),
            display_order INTEGER NOT NULL UNIQUE,
            active INTEGER NOT NULL DEFAULT 1
                CHECK (active IN (0, 1)),
            configured INTEGER NOT NULL DEFAULT 1
                CHECK (configured IN (0, 1)),
            created_at TEXT NOT NULL
                DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL
                DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS pizza_images (
            pizza_id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            mime_type TEXT NOT NULL,
            original_name TEXT NOT NULL,
            size_bytes INTEGER NOT NULL
                CHECK (size_bytes > 0),
            created_at TEXT NOT NULL
                DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL
                DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (pizza_id)
                REFERENCES pizzas(id)
                ON UPDATE CASCADE
                ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS pizza_ingredients (
            pizza_id TEXT NOT NULL,
            ingredient_id TEXT NOT NULL,
            position INTEGER NOT NULL CHECK (position > 0),

            PRIMARY KEY (pizza_id, ingredient_id),

            UNIQUE (pizza_id, position),

            FOREIGN KEY (pizza_id)
                REFERENCES pizzas(id)
                ON UPDATE CASCADE
                ON DELETE CASCADE,

            FOREIGN KEY (ingredient_id)
                REFERENCES ingredients(id)
                ON UPDATE CASCADE
                ON DELETE RESTRICT
        );

        CREATE INDEX IF NOT EXISTS
            idx_pizza_ingredients_pizza_position
        ON pizza_ingredients (
            pizza_id,
            position
        );
    `);
};


const migrateDistributorSchema = (): void => {
    const columns = database
        .prepare(`
            PRAGMA table_info(distributors)
        `)
        .all() as unknown as Array<{
            name: string;
        }>;

    const hasSourceName = columns.some(
        (column) => column.name === "source_name",
    );

    if (!hasSourceName) {
        database.exec(`
            ALTER TABLE distributors
            ADD COLUMN source_name TEXT
        `);
    }

    database.exec(`
        UPDATE distributors
        SET source_name = name
        WHERE
            source_name IS NULL
            OR TRIM(source_name) = ''
    `);

    database.exec(`
        CREATE UNIQUE INDEX IF NOT EXISTS
            idx_distributors_source_name
        ON distributors (
            source_name COLLATE NOCASE
        )
    `);
};

const seedDatabaseIfEmpty = (): void => {
    const row = database
        .prepare(`
            SELECT COUNT(*) AS count
            FROM pizzas
        `)
        .get() as { count: number };

    if (Number(row.count) > 0) {
        return;
    }

    const insertIngredient = database.prepare(`
        INSERT INTO ingredients (
            id,
            name,
            active
        )
        VALUES (?, ?, ?)
    `);

    const insertPizza = database.prepare(`
        INSERT INTO pizzas (
            id,
            name,
            base,
            display_order,
            active,
            configured
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertMapping = database.prepare(`
        INSERT INTO pizza_ingredients (
            pizza_id,
            ingredient_id,
            position
        )
        VALUES (?, ?, ?)
    `);

    database.exec("BEGIN IMMEDIATE");

    try {
        for (const ingredient of INGREDIENTS_SEED) {
            insertIngredient.run(
                ingredient.id,
                ingredient.name,
                ingredient.active ? 1 : 0,
            );
        }

        for (const pizza of PIZZAS_SEED) {
            insertPizza.run(
                pizza.id,
                pizza.name,
                pizza.base,
                pizza.order,
                pizza.active ? 1 : 0,
                pizza.configured ? 1 : 0,
            );
        }

        for (const mapping of PIZZA_INGREDIENTS_SEED) {
            insertMapping.run(
                mapping.pizzaId,
                mapping.ingredientId,
                mapping.position,
            );
        }

        database.exec("COMMIT");

        console.log(
            "Catalogue SQLite initialisé.",
        );
    } catch (error) {
        database.exec("ROLLBACK");
        throw error;
    }
};

const LEGACY_DEFAULT_PIZZA_IDS = [
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

export const migrateLegacyPizzaDefaults = (): void => {
    const pizzas = database
        .prepare(`
            SELECT
                id,
                display_order,
                active
            FROM pizzas
            ORDER BY display_order
        `)
        .all() as unknown as Array<{
            id: string;
            display_order: number;
            active: number;
        }>;

    const isUntouchedLegacyCatalog =
        pizzas.length ===
            LEGACY_DEFAULT_PIZZA_IDS.length &&
        pizzas.every(
            (pizza, index) =>
                pizza.id ===
                    LEGACY_DEFAULT_PIZZA_IDS[index] &&
                pizza.display_order === index + 1 &&
                pizza.active === 1,
        );

    if (!isUntouchedLegacyCatalog) {
        return;
    }

    const updatePizza = database.prepare(`
        UPDATE pizzas
        SET
            display_order = ?,
            active = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `);

    database.exec("BEGIN IMMEDIATE");

    try {
        database.exec(`
            UPDATE pizzas
            SET display_order = display_order + 100
        `);

        for (const pizza of PIZZAS_SEED) {
            updatePizza.run(
                pizza.order,
                pizza.active ? 1 : 0,
                pizza.id,
            );
        }

        database.exec("COMMIT");

        console.log(
            "Catalogue pizzas par défaut mis à jour.",
        );
    } catch (error) {
        database.exec("ROLLBACK");
        throw error;
    }
};


const migrateDistributorExcelNames =
    (): void => {
        const columns = database
            .prepare(`
                PRAGMA table_info(distributors)
            `)
            .all() as unknown as Array<{
                name: string;
            }>;

        const hasSourceName = columns.some(
            (column) =>
                column.name === "source_name",
        );

        if (!hasSourceName) {
            return;
        }

        const updateStatement =
            database.prepare(`
                UPDATE distributors
                SET
                    source_name = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE
                    id = ?
                    AND (
                        source_name IS NULL
                        OR TRIM(source_name) = ''
                        OR source_name = name
                        OR source_name = ?
                    )
            `);

        const knownExcelNames = [
            {
                id: "distributor-turenne",
                previousName: "Turenne",
                excelName: "Turenne 393",
            },
            {
                id: "distributor-chal",
                previousName: "Chal",
                excelName: "CHAL 1030",
            },
            {
                id: "distributor-inter",
                previousName: "Inter",
                excelName: "INTER 2194",
            },
            {
                id: "distributor-vaux",
                previousName: "Vaux",
                excelName: "VAUX 1031",
            },
            {
                id: "distributor-fayl",
                previousName: "Fayl",
                excelName: "FAYL 1478",
            },
        ];

        for (
            const distributor of knownExcelNames
        ) {
            updateStatement.run(
                distributor.excelName,
                distributor.id,
                distributor.previousName,
            );
        }
    };

const seedDistributorsIfEmpty = (): void => {
    const row = database
        .prepare(`
            SELECT COUNT(*) AS count
            FROM distributors
        `)
        .get() as { count: number };

    if (Number(row.count) > 0) {
        return;
    }

    const insertDistributor = database.prepare(`
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
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    database.exec("BEGIN IMMEDIATE");

    try {
        for (
            const distributor of DISTRIBUTORS_SEED
        ) {
            insertDistributor.run(
                distributor.id,
                distributor.name,
                distributor.sourceName,
                distributor.shortName,
                distributor.order,
                distributor.active ? 1 : 0,
                distributor.backgroundColor,
                distributor.foregroundColor,
                distributor.accentColor,
            );
        }

        database.exec("COMMIT");

        console.log(
            "Distributeurs SQLite initialisés.",
        );
    } catch (error) {
        database.exec("ROLLBACK");
        throw error;
    }
};

export const initializeDatabase = (): void => {
    createSchema();
    migrateDistributorSchema();
    migrateDistributorExcelNames();
    migrateLegacyPizzaDefaults();
    seedDatabaseIfEmpty();
    seedDistributorsIfEmpty();
};
