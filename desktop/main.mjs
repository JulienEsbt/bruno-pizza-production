import { app, BrowserWindow, dialog, session } from "electron";
import electronSquirrelStartup from "electron-squirrel-startup";

import {
    configureDesktopBackendEnvironment,
    resolveDesktopPaths,
} from "./backendEnvironment.mjs";

const APP_USER_MODEL_ID =
    "com.squirrel.BrunoPizza.BrunoPizza";

let mainWindow;
let runningServer;
let database;
let quitAfterCleanup = false;

const configureBackend = () => {
    const desktopPaths = resolveDesktopPaths({
        appPath: app.getAppPath(),
        userDataPath: app.getPath("userData"),
    });

    configureDesktopBackendEnvironment(
        desktopPaths,
    );
};

const startBackend = async () => {
    configureBackend();

    const [{ startHttpServer }, databaseModule] =
        await Promise.all([
            import("../backend/dist/httpServer.js"),
            import("../backend/dist/database/database.js"),
        ]);

    database = databaseModule.database;
    runningServer = await startHttpServer({
        host: "127.0.0.1",
        port: 0,
    });
};

const isBackendNavigation = (
    candidateUrl,
) => {
    try {
        return (
            new URL(candidateUrl).origin ===
            runningServer?.origin
        );
    } catch {
        return false;
    }
};

const createMainWindow = async () => {
    if (!runningServer) {
        throw new Error(
            "Le serveur local n’est pas démarré.",
        );
    }

    const window = new BrowserWindow({
        title: "Bruno Pizza",
        width: 1440,
        height: 900,
        minWidth: 1024,
        minHeight: 700,
        backgroundColor: "#111827",
        autoHideMenuBar: true,
        show: false,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
            webviewTag: false,
        },
    });

    window.removeMenu();
    window.once("ready-to-show", () => {
        window.show();
    });
    window.on("closed", () => {
        if (mainWindow === window) {
            mainWindow = undefined;
        }
    });

    window.webContents.setWindowOpenHandler(
        () => ({ action: "deny" }),
    );
    window.webContents.on(
        "will-navigate",
        (event, navigationUrl) => {
            if (!isBackendNavigation(navigationUrl)) {
                event.preventDefault();
            }
        },
    );

    await window.loadURL(runningServer.origin);

    mainWindow = window;
};

const stopBackend = async () => {
    const serverToClose = runningServer;

    runningServer = undefined;

    if (serverToClose) {
        await serverToClose.close();
    }

    if (database) {
        database.close();
        database = undefined;
    }
};

const showStartupError = (error) => {
    const details =
        error instanceof Error
            ? error.message
            : String(error);

    console.error(
        "Impossible de démarrer Bruno Pizza :",
        error,
    );
    dialog.showErrorBox(
        "Bruno Pizza ne peut pas démarrer",
        `Le serveur local n’a pas pu être lancé.\n\n${details}`,
    );
};

const bootApplication = async () => {
    session.defaultSession.setPermissionRequestHandler(
        (_webContents, _permission, callback) => {
            callback(false);
        },
    );

    await startBackend();
    await createMainWindow();
};

if (electronSquirrelStartup) {
    app.quit();
} else {
    app.setAppUserModelId(APP_USER_MODEL_ID);

    const ownsSingleInstanceLock =
        app.requestSingleInstanceLock();

    if (!ownsSingleInstanceLock) {
        app.quit();
    } else {
        app.on("second-instance", () => {
            if (!mainWindow) {
                return;
            }

            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }

            mainWindow.show();
            mainWindow.focus();
        });

        app.on("before-quit", (event) => {
            if (
                quitAfterCleanup ||
                (!runningServer && !database)
            ) {
                return;
            }

            event.preventDefault();

            void stopBackend()
                .catch((error) => {
                    console.error(
                        "Impossible de fermer proprement les données locales :",
                        error,
                    );
                })
                .finally(() => {
                    quitAfterCleanup = true;
                    app.quit();
                });
        });

        app.on("window-all-closed", () => {
            app.quit();
        });

        void app
            .whenReady()
            .then(bootApplication)
            .catch(async (error) => {
                showStartupError(error);
                await stopBackend().catch(() => undefined);
                quitAfterCleanup = true;
                app.quit();
            });
    }
}
