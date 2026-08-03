import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import {
    configureDesktopBackendEnvironment,
    resolveDesktopPaths,
} from "../backendEnvironment.mjs";

test("place SQLite et les photos dans le dossier utilisateur Windows", () => {
    const desktopPaths = resolveDesktopPaths({
        appPath: "C:\\Program Files\\Bruno Pizza\\resources\\app.asar",
        userDataPath:
            "C:\\Users\\Bruno\\AppData\\Roaming\\Bruno Pizza",
        pathApi: path.win32,
    });

    assert.deepEqual(desktopPaths, {
        dataDirectory:
            "C:\\Users\\Bruno\\AppData\\Roaming\\Bruno Pizza\\data",
        databasePath:
            "C:\\Users\\Bruno\\AppData\\Roaming\\Bruno Pizza\\data\\bruno-pizza.sqlite",
        pizzaImagesDirectory:
            "C:\\Users\\Bruno\\AppData\\Roaming\\Bruno Pizza\\data\\pizza-images",
        frontendDistPath:
            "C:\\Program Files\\Bruno Pizza\\resources\\app.asar\\frontend\\dist",
    });
});

test("configure explicitement le backend desktop", () => {
    const previousEnvironment = {
        HOST: process.env.HOST,
        FRONTEND_URL: process.env.FRONTEND_URL,
        DATABASE_PATH: process.env.DATABASE_PATH,
        PIZZA_IMAGES_DIRECTORY:
            process.env.PIZZA_IMAGES_DIRECTORY,
        FRONTEND_DIST_PATH:
            process.env.FRONTEND_DIST_PATH,
    };
    const desktopPaths = {
        databasePath: "/user/data/catalog.sqlite",
        pizzaImagesDirectory: "/user/data/images",
        frontendDistPath: "/app/frontend/dist",
    };

    try {
        configureDesktopBackendEnvironment(
            desktopPaths,
            "bruno-pizza://app",
        );

        assert.equal(process.env.HOST, "127.0.0.1");
        assert.equal(
            process.env.FRONTEND_URL,
            "bruno-pizza://app",
        );
        assert.equal(
            process.env.DATABASE_PATH,
            desktopPaths.databasePath,
        );
        assert.equal(
            process.env.PIZZA_IMAGES_DIRECTORY,
            desktopPaths.pizzaImagesDirectory,
        );
        assert.equal(
            process.env.FRONTEND_DIST_PATH,
            desktopPaths.frontendDistPath,
        );
    } finally {
        for (const [key, value] of Object.entries(
            previousEnvironment,
        )) {
            if (value === undefined) {
                delete process.env[key];
            } else {
                process.env[key] = value;
            }
        }
    }
});
