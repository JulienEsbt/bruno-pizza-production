import type { DatabaseSync } from "node:sqlite";

/** Transactional migration: the existing photo becomes the sole/final frame.
 * Files are not moved or rewritten. Re-running initialization is a no-op. */
export function migratePizzaImages(database: DatabaseSync, backupPath?: string): void {
    const columns = database.prepare("PRAGMA table_info(pizza_images)").all();
    if (columns.some((column) => column.name === "id")) return;
    const populated = Number(database.prepare("SELECT COUNT(*) AS count FROM pizzas").get()?.count) > 0;
    if (populated && backupPath) {
        // VACUUM INTO creates a consistent snapshot, including committed WAL data.
        // If backup creation fails, abort before touching the old schema.
        database.prepare("VACUUM INTO ?").run(backupPath);
    }
    database.exec("BEGIN IMMEDIATE");
    try {
        database.exec(`
            CREATE TABLE pizza_images_v2 (
                id TEXT PRIMARY KEY,
                pizza_id TEXT NOT NULL REFERENCES pizzas(id) ON UPDATE CASCADE ON DELETE CASCADE,
                filename TEXT NOT NULL UNIQUE,
                mime_type TEXT NOT NULL,
                original_name TEXT NOT NULL,
                size_bytes INTEGER NOT NULL CHECK (size_bytes > 0),
                display_order INTEGER NOT NULL CHECK (display_order >= 0),
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (pizza_id, display_order)
            );
            INSERT INTO pizza_images_v2
                (id, pizza_id, filename, mime_type, original_name, size_bytes, display_order, updated_at)
            SELECT 'legacy-' || pizza_id, pizza_id, filename, mime_type, original_name, size_bytes, 0, updated_at
            FROM pizza_images;
            DROP TABLE pizza_images;
            ALTER TABLE pizza_images_v2 RENAME TO pizza_images;
            COMMIT;
        `);
    } catch (error) {
        database.exec("ROLLBACK");
        throw error;
    }
}
