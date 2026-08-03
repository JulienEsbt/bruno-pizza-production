import assert from "node:assert/strict";
import {
    mkdirSync,
    mkdtempSync,
    rmSync,
    writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test, {
    after,
} from "node:test";

const testDirectory = mkdtempSync(
    path.join(tmpdir(), "bruno-pizza-app-"),
);
const frontendDirectory = path.join(
    testDirectory,
    "frontend",
);
const assetsDirectory = path.join(
    frontendDirectory,
    "assets",
);

mkdirSync(assetsDirectory, {
    recursive: true,
});
writeFileSync(
    path.join(frontendDirectory, "index.html"),
    "<!doctype html><title>Bruno Pizza test</title>",
);
writeFileSync(
    path.join(assetsDirectory, "app.js"),
    "console.log('test');",
);

process.env.DATABASE_PATH = path.join(
    testDirectory,
    "catalog.sqlite",
);
process.env.PIZZA_IMAGES_DIRECTORY = path.join(
    testDirectory,
    "images",
);
process.env.FRONTEND_DIST_PATH = frontendDirectory;
process.env.FRONTEND_URL = "http://localhost:5173";

const { createApp } = await import(
    "../src/app.js"
);
const {
    database,
    initializeDatabase,
} = await import(
    "../src/database/database.js"
);

initializeDatabase();

const server = createApp().listen(
    0,
    "127.0.0.1",
);

await new Promise<void>((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
});

const address = server.address();

if (!address || typeof address === "string") {
    throw new Error(
        "Impossible de déterminer le port du serveur de test.",
    );
}

const baseUrl = `http://127.0.0.1:${address.port}`;

after(async () => {
    await new Promise<void>((resolve, reject) => {
        server.close((error) => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });

    database.close();
    rmSync(testDirectory, {
        recursive: true,
        force: true,
    });
});

test("expose l’état de santé avec les en-têtes de sécurité", async () => {
    const response = await fetch(
        `${baseUrl}/api/health`,
    );

    assert.equal(response.status, 200);
    assert.equal(
        response.headers.get(
            "x-content-type-options",
        ),
        "nosniff",
    );
    assert.equal(
        response.headers.get("x-frame-options"),
        "DENY",
    );
    assert.deepEqual(await response.json(), {
        status: "ok",
        service:
            "bruno-pizza-production-backend",
        database: "sqlite",
    });
});

test("sert l’application compilée et ses routes navigateur", async () => {
    const pageResponse = await fetch(
        `${baseUrl}/production`,
    );

    assert.equal(pageResponse.status, 200);
    assert.equal(
        pageResponse.headers.get("cache-control"),
        "no-cache",
    );
    assert.match(
        await pageResponse.text(),
        /Bruno Pizza test/,
    );

    const assetResponse = await fetch(
        `${baseUrl}/assets/app.js`,
    );

    assert.equal(assetResponse.status, 200);
    assert.equal(
        assetResponse.headers.get("cache-control"),
        "public, max-age=31536000, immutable",
    );
});

test("ne transforme jamais une route API inconnue en page HTML", async () => {
    const response = await fetch(
        `${baseUrl}/api/inconnue`,
    );

    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), {
        error: "Route introuvable.",
    });
});
