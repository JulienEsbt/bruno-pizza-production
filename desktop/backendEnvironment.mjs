import path from "node:path";

export const resolveDesktopPaths = ({
    appPath,
    userDataPath,
    pathApi = path,
}) => {
    const dataDirectory = pathApi.join(
        userDataPath,
        "data",
    );

    return {
        dataDirectory,
        databasePath: pathApi.join(
            dataDirectory,
            "bruno-pizza.sqlite",
        ),
        pizzaImagesDirectory: pathApi.join(
            dataDirectory,
            "pizza-images",
        ),
        frontendDistPath: pathApi.join(
            appPath,
            "frontend",
            "dist",
        ),
    };
};

export const configureDesktopBackendEnvironment = (
    desktopPaths,
    frontendUrl,
) => {
    process.env.HOST = "127.0.0.1";
    process.env.FRONTEND_URL = frontendUrl;
    process.env.DATABASE_PATH =
        desktopPaths.databasePath;
    process.env.PIZZA_IMAGES_DIRECTORY =
        desktopPaths.pizzaImagesDirectory;
    process.env.FRONTEND_DIST_PATH =
        desktopPaths.frontendDistPath;
};
