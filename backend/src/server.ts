import { createApp } from "./app.js";
import { config } from "./config.js";
import { initializeDatabase } from "./database/database.js";

initializeDatabase();

const server = createApp().listen(
    config.port,
    config.host,
    () => {
        console.log(
            `Backend démarré sur http://${config.host}:${config.port}`,
        );
        console.log(
            `Base SQLite : ${config.databasePath}`,
        );
    },
);

server.on("error", (error) => {
    console.error(
        "Impossible de démarrer le backend :",
        error,
    );
    process.exitCode = 1;
});
