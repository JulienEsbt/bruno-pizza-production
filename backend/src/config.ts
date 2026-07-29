import "dotenv/config";

import path from "node:path";

const getRequiredEnvironmentVariable = (
    variableName: string,
): string => {
    const value = process.env[variableName]?.trim();

    if (!value) {
        throw new Error(
            `La variable d’environnement ${variableName} est obligatoire.`,
        );
    }

    return value;
};

const parsePort = (value: string | undefined): number => {
    const parsedPort = Number(value ?? "3001");

    if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
        throw new Error("La variable PORT est invalide.");
    }

    return parsedPort;
};

export const config = {
    port: parsePort(process.env.PORT),

    frontendUrl:
        process.env.FRONTEND_URL?.trim() ??
        "http://localhost:5173",

    databasePath: path.resolve(
        process.env.DATABASE_PATH?.trim() ??
            "./data/bruno-pizza.sqlite",
    ),

    pizzaImagesDirectory: path.resolve(
        process.env.PIZZA_IMAGES_DIRECTORY?.trim() ??
            "./data/pizza-images",
    ),

    adial: {
        baseUrl: getRequiredEnvironmentVariable(
            "ADIAL_API_BASE_URL",
        ).replace(/\/+$/, ""),

        groupId: getRequiredEnvironmentVariable(
            "ADIAL_GROUP_ID",
        ),

        token: getRequiredEnvironmentVariable(
            "ADIAL_TOKEN",
        ),
    },
};
