import fs from "node:fs";
import path from "node:path";

import cors from "cors";
import express, {
    type ErrorRequestHandler,
} from "express";

import { config } from "./config.js";
import { catalogRouter } from "./routes/catalogRoutes.js";
import { pizzaImageRouter } from "./routes/pizzaImageRoutes.js";

const sendRequestError: ErrorRequestHandler = (
    error,
    _request,
    response,
    _next,
) => {
    if (
        error instanceof SyntaxError &&
        "body" in error
    ) {
        response.status(400).json({
            error: "Le corps JSON est invalide.",
        });
        return;
    }

    if (
        typeof error === "object" &&
        error !== null &&
        "type" in error &&
        error.type === "entity.too.large"
    ) {
        response.status(413).json({
            error:
                "Le corps de la requête est trop volumineux.",
        });
        return;
    }

    console.error("Erreur HTTP inattendue :", error);
    response.status(500).json({
        error: "Une erreur interne est survenue.",
    });
};

export const createApp = () => {
    const app = express();
    const frontendIndexPath = path.join(
        config.frontendDistPath,
        "index.html",
    );

    app.disable("x-powered-by");

    app.use((_request, response, next) => {
        response.setHeader(
            "X-Content-Type-Options",
            "nosniff",
        );
        response.setHeader(
            "X-Frame-Options",
            "DENY",
        );
        response.setHeader(
            "Referrer-Policy",
            "no-referrer",
        );
        response.setHeader(
            "Permissions-Policy",
            "camera=(), microphone=(), geolocation=()",
        );
        next();
    });

    app.use(
        cors({
            origin: config.frontendUrl,
            methods: [
                "GET",
                "POST",
                "PATCH",
                "PUT",
                "DELETE",
            ],
        }),
    );

    app.use(
        express.json({
            limit: "32kb",
        }),
    );

    app.get(
        "/api/health",
        (_request, response) => {
            response.json({
                status: "ok",
                service:
                    "bruno-pizza-production-backend",
                database: "sqlite",
            });
        },
    );

    app.use("/api/catalog", catalogRouter);
    app.use(
        "/api/catalog/pizzas",
        pizzaImageRouter,
    );

    if (fs.existsSync(frontendIndexPath)) {
        app.use(
            express.static(
                config.frontendDistPath,
                {
                    index: false,
                    setHeaders: (
                        response,
                        filePath,
                    ) => {
                        if (
                            filePath.includes(
                                `${path.sep}assets${path.sep}`,
                            )
                        ) {
                            response.setHeader(
                                "Cache-Control",
                                "public, max-age=31536000, immutable",
                            );
                        }
                    },
                },
            ),
        );

        app.use((request, response, next) => {
            const isApiRequest =
                request.path === "/api" ||
                request.path.startsWith("/api/");

            if (
                request.method !== "GET" ||
                isApiRequest
            ) {
                next();
                return;
            }

            response.setHeader(
                "Cache-Control",
                "no-cache",
            );
            response.sendFile(frontendIndexPath);
        });
    }

    app.use((_request, response) => {
        response.status(404).json({
            error: "Route introuvable.",
        });
    });

    app.use(sendRequestError);

    return app;
};
