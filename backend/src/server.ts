import { config } from "./config.js";
import { startHttpServer } from "./httpServer.js";

try {
    const runningServer = await startHttpServer();

    console.log(
        `Backend démarré sur ${runningServer.origin}`,
    );
    console.log(
        `Base SQLite : ${config.databasePath}`,
    );
} catch (error) {
    console.error(
        "Impossible de démarrer le backend :",
        error,
    );
    process.exitCode = 1;
}
