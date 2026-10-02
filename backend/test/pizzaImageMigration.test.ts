import assert from "node:assert/strict";
import {DatabaseSync} from "node:sqlite";
import {mkdtempSync, rmSync} from "node:fs";
import {tmpdir} from "node:os";
import path from "node:path";
import test from "node:test";
import {migratePizzaImages} from "../src/database/pizzaImageMigration.js";

test("migre une ancienne photo sans changer son fichier, conserve une sauvegarde et ne la ressuscite pas", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "bruno-gallery-migration-"));
    const db = new DatabaseSync(path.join(dir, "catalog.sqlite"));
    try {
        db.exec(`PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;
            CREATE TABLE pizzas (id TEXT PRIMARY KEY);
            INSERT INTO pizzas VALUES ('reine');
            CREATE TABLE pizza_images (pizza_id TEXT PRIMARY KEY REFERENCES pizzas(id), filename TEXT, mime_type TEXT, original_name TEXT, size_bytes INTEGER, updated_at TEXT);
            INSERT INTO pizza_images VALUES ('reine', 'reine.png', 'image/png', 'ancienne photo.png', 123, '2026-08-17');`);
        const backupPath = path.join(dir, "backup.sqlite");
        migratePizzaImages(db, backupPath);
        const images = db.prepare("SELECT * FROM pizza_images").all();
        assert.equal(images.length, 1);
        assert.equal(images[0].filename, "reine.png");
        assert.equal(images[0].original_name, "ancienne photo.png");
        assert.equal(images[0].display_order, 0);
        assert.equal(images[0].updated_at, "2026-08-17");
        const backup = new DatabaseSync(backupPath, {readOnly: true});
        assert.equal(backup.prepare("SELECT filename FROM pizza_images").get()?.filename, "reine.png");
        assert.equal(backup.prepare("PRAGMA table_info(pizza_images)").all().some((c) => c.name === "id"), false);
        backup.close();
        migratePizzaImages(db, backupPath);
        assert.deepEqual(db.prepare("SELECT * FROM pizza_images").all(), images);
        db.exec("DELETE FROM pizza_images");
        migratePizzaImages(db, backupPath);
        assert.equal(db.prepare("SELECT count(*) AS count FROM pizza_images").get()?.count, 0);
    } finally { db.close(); rmSync(dir, {recursive: true, force: true}); }
});

test("une migration impossible restaure intégralement la table V1", () => {
    const db = new DatabaseSync(":memory:");
    try {
        db.exec(`CREATE TABLE pizzas (id TEXT PRIMARY KEY); INSERT INTO pizzas VALUES ('reine');
            CREATE TABLE pizza_images (pizza_id TEXT PRIMARY KEY, filename TEXT, mime_type TEXT, original_name TEXT, size_bytes INTEGER, updated_at TEXT);
            INSERT INTO pizza_images VALUES ('reine','reine.png','image/png','photo.png',0,'2026-08-17');`);
        assert.throws(() => migratePizzaImages(db));
        assert.equal(db.prepare("SELECT filename FROM pizza_images").get()?.filename, "reine.png");
        assert.equal(db.prepare("PRAGMA table_info(pizza_images)").all().some((c) => c.name === "id"), false);
    } finally {db.close();}
});
