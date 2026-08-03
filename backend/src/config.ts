import "dotenv/config";

import path from "node:path";

const parsePort = (value: string | undefined): number => {
    const parsedPort = Number(value ?? "3001");

    if (
        !Number.isInteger(parsedPort) ||
        parsedPort <= 0 ||
        parsedPort > 65_535
    ) {
        throw new Error("La variable PORT est invalide.");
    }

    return parsedPort;
};

export const config = {
    port: parsePort(process.env.PORT),

    host:
        process.env.HOST?.trim() ||
        "127.0.0.1",

    frontendUrl:
        process.env.FRONTEND_URL?.trim() ||
        "http://localhost:5173",

    databasePath: path.resolve(
        process.env.DATABASE_PATH?.trim() ||
            "./data/bruno-pizza.sqlite",
    ),

    pizzaImagesDirectory: path.resolve(
        process.env.PIZZA_IMAGES_DIRECTORY?.trim() ||
            "./data/pizza-images",
    ),

    frontendDistPath: path.resolve(
        process.env.FRONTEND_DIST_PATH?.trim() ||
            "../frontend/dist",
    ),
};
