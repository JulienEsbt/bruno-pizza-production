import type { Server } from "node:http";
import type { AddressInfo } from "node:net";

import { createApp } from "./app.js";
import { config } from "./config.js";
import { initializeDatabase } from "./database/database.js";

export interface StartHttpServerOptions {
    host?: string;
    port?: number;
}

export interface RunningHttpServer {
    host: string;
    port: number;
    origin: string;
    server: Server;
    close: () => Promise<void>;
}

const waitUntilListening = (
    server: Server,
): Promise<void> => {
    return new Promise((resolve, reject) => {
        const handleError = (error: Error) => {
            server.off("listening", handleListening);
            reject(error);
        };
        const handleListening = () => {
            server.off("error", handleError);
            resolve();
        };

        server.once("error", handleError);
        server.once("listening", handleListening);
    });
};

const closeServer = (
    server: Server,
): Promise<void> => {
    if (!server.listening) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        server.close((error) => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });
};

export const startHttpServer = async (
    options: StartHttpServerOptions = {},
): Promise<RunningHttpServer> => {
    const host = options.host ?? config.host;
    const requestedPort = options.port ?? config.port;

    initializeDatabase();

    const server = createApp().listen(
        requestedPort,
        host,
    );

    await waitUntilListening(server);

    const address = server.address();

    if (!address || typeof address === "string") {
        await closeServer(server);
        throw new Error(
            "Impossible de déterminer le port du serveur HTTP.",
        );
    }

    const port = (address as AddressInfo).port;

    return {
        host,
        port,
        origin: `http://${host}:${port}`,
        server,
        close: () => closeServer(server),
    };
};
