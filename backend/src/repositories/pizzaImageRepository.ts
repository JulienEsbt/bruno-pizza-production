import { database } from "../database/database.js";

export interface PizzaImageRecord {
    id: string;
    pizzaId: string;
    filename: string;
    mimeType: string;
    originalName: string;
    sizeBytes: number;
    updatedAt: string;
}

export const getPizzaImages = (pizzaId: string): PizzaImageRecord[] => {
    const rows = database.prepare(`
        SELECT id, pizza_id, filename, mime_type, original_name, size_bytes, updated_at
        FROM pizza_images WHERE pizza_id = ? ORDER BY display_order
    `).all(pizzaId);
    return rows.map((row) => ({
        id: String(row.id), pizzaId: String(row.pizza_id), filename: String(row.filename),
        mimeType: String(row.mime_type), originalName: String(row.original_name),
        sizeBytes: Number(row.size_bytes), updatedAt: String(row.updated_at),
    }));
};

export const getPizzaImage = (pizzaId: string): PizzaImageRecord | undefined =>
    getPizzaImages(pizzaId).at(-1);

// All ordering mutations are atomic, including uploads and deletions.
export function replacePizzaImages(pizzaId: string, images: PizzaImageRecord[]): void {
    database.exec("BEGIN IMMEDIATE");
    try {
        database.prepare("DELETE FROM pizza_images WHERE pizza_id = ?").run(pizzaId);
        const insert = database.prepare(`
            INSERT INTO pizza_images
                (id, pizza_id, filename, mime_type, original_name, size_bytes, display_order, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        images.forEach((image, index) => insert.run(
            image.id, pizzaId, image.filename, image.mimeType, image.originalName,
            image.sizeBytes, index, image.updatedAt,
        ));
        database.exec("COMMIT");
    } catch (error) {
        database.exec("ROLLBACK");
        throw error;
    }
}
