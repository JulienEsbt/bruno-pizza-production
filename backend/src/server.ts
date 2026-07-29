import cors from "cors";
import express from "express";

import { config } from "./config.js";
import { initializeDatabase } from "./database/database.js";
import { catalogRouter } from "./routes/catalogRoutes.js";
import { pizzaImageRouter } from "./routes/pizzaImageRoutes.js";
import { getProductionDayFromAdial } from "./services/adialService.js";

initializeDatabase();

const app = express();

app.disable("x-powered-by");

app.use(
    cors({
        origin: config.frontendUrl,
    }),
);

app.use(express.json());

app.get("/api/health", (_request, response) => {
    response.json({
        status: "ok",
        service: "bruno-pizza-production-backend",
        database: "sqlite",
    });
});

app.use("/api/catalog", catalogRouter);
app.use(
    "/api/catalog/pizzas",
    pizzaImageRouter,
);

app.get(
    "/api/production/:date",
    async (request, response) => {
        const { date } = request.params;

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            response.status(400).json({
                error:
                    "La date doit être au format YYYY-MM-DD.",
            });

            return;
        }

        try {
            const production =
                await getProductionDayFromAdial(date);

            response.json(production);
        } catch (error) {
            console.error(
                "Impossible de récupérer la production :",
                error,
            );

            response.status(502).json({
                error:
                    error instanceof Error
                        ? error.message
                        : "Erreur inconnue lors de l’appel à l’API Adial.",
            });
        }
    },
);

app.use((_request, response) => {
    response.status(404).json({
        error: "Route introuvable.",
    });
});

app.listen(config.port, () => {
    console.log(
        `Backend démarré sur http://localhost:${config.port}`,
    );

    console.log(
        `Base SQLite : ${config.databasePath}`,
    );
});
