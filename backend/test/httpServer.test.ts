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
    path.join(tmpdir(), "bruno-pizza-http-server-"),
);

process.env.DATABASE_PATH = path.join(
    testDirectory,
    "catalog.sqlite",
);
process.env.PIZZA_IMAGES_DIRECTORY = path.join(
    testDirectory,
    "images",
);

const { database } = await import(
    "../src/database/database.js"
);
const { startHttpServer } = await import(
    "../src/httpServer.js"
);

after(() => {
    database.close();
    rmSync(testDirectory, {
        recursive: true,
        force: true,
    });
});

test("attribue un port local dynamique et expose son origine", async () => {
    const runningServer = await startHttpServer({
        host: "127.0.0.1",
        port: 0,
    });

    try {
        assert.ok(runningServer.port > 0);
        assert.equal(
            runningServer.origin,
            `http://127.0.0.1:${runningServer.port}`,
        );

        const response = await fetch(
            `${runningServer.origin}/api/health`,
        );

        assert.equal(response.status, 200);
    } finally {
        await runningServer.close();
    }
});
