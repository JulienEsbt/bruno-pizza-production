import { database } from "../database/database.js";

export interface PizzaImageRecord {
    pizzaId: string;
    filename: string;
    mimeType: string;
    originalName: string;
    sizeBytes: number;
    updatedAt: string;
}

interface PizzaImageRow {
    pizza_id: string;
    filename: string;
    mime_type: string;
    original_name: string;
    size_bytes: number;
    updated_at: string;
}

const mapPizzaImageRow = (
    row: PizzaImageRow,
): PizzaImageRecord => ({
    pizzaId: row.pizza_id,
    filename: row.filename,
    mimeType: row.mime_type,
    originalName: row.original_name,
    sizeBytes: Number(row.size_bytes),
    updatedAt: row.updated_at,
});

export const getPizzaImage = (
    pizzaId: string,
): PizzaImageRecord | undefined => {
    const row = database
        .prepare(`
            SELECT
                pizza_id,
                filename,
                mime_type,
                original_name,
                size_bytes,
                updated_at
            FROM pizza_images
            WHERE pizza_id = ?
        `)
        .get(pizzaId) as
        | PizzaImageRow
        | undefined;

    return row
        ? mapPizzaImageRow(row)
        : undefined;
};

export const upsertPizzaImage = (
    image: Omit<PizzaImageRecord, "updatedAt">,
): void => {
    database
        .prepare(`
            INSERT INTO pizza_images (
                pizza_id,
                filename,
                mime_type,
                original_name,
                size_bytes
            )
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(pizza_id)
            DO UPDATE SET
                filename = excluded.filename,
                mime_type = excluded.mime_type,
                original_name = excluded.original_name,
                size_bytes = excluded.size_bytes,
                updated_at = CURRENT_TIMESTAMP
        `)
        .run(
            image.pizzaId,
            image.filename,
            image.mimeType,
            image.originalName,
            image.sizeBytes,
        );
};

export const removePizzaImage = (
    pizzaId: string,
): void => {
    database
        .prepare(`
            DELETE FROM pizza_images
            WHERE pizza_id = ?
        `)
        .run(pizzaId);
};
