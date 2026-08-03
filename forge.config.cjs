const path = require("node:path");

const packageJson = require("./package.json");
const electronDownloadCache =
    process.env.ELECTRON_DOWNLOAD_CACHE?.trim();

module.exports = {
    packagerConfig: {
        asar: true,
        appBundleId: "fr.brunopizza.production",
        ...(electronDownloadCache
            ? {
                  download: {
                      cacheRoot: electronDownloadCache,
                  },
              }
            : {}),
        executableName: "BrunoPizza",
        icon: path.resolve(
            __dirname,
            "desktop/assets/bruno-pizza",
        ),
        overwrite: true,
        prune: true,
        ignore: [
            /^\/\.git(?:\/|$)/,
            /^\/\.github(?:\/|$)/,
            /^\/\.idea(?:\/|$)/,
            /^\/(?:\.editorconfig|\.gitignore|\.nvmrc)$/,
            /^\/(?:CHANGELOG|README)\.md$/,
            /^\/backups(?:\/|$)/,
            /^\/docs(?:\/|$)/,
            /^\/backend\/(?:data|src|test)(?:\/|$)/,
            /^\/backend\/(?:\.env\.example|package-lock\.json|tsconfig\.json)$/,
            /^\/frontend\/(?:\.cache|src|test)(?:\/|$)/,
            /^\/frontend\/(?:\.env\.example|README\.md|eslint\.config\.js|index\.html|package-lock\.json|package\.json|tsconfig(?:\.[^.]+)?\.json|vite\.config\.ts)$/,
            /^\/desktop\/(?:assets|scripts|test)(?:\/|$)/,
            /^\/(?:backend|frontend)\/node_modules(?:\/|$)/,
            /^\/(?:backend|frontend)\/\.env(?:\.|$)/,
            /^\/(?:forge\.config\.cjs|package-lock\.json)$/,
            /^\/out(?:\/|$)/,
        ],
    },
    makers: [
        {
            name: "@electron-forge/maker-squirrel",
            platforms: ["win32"],
            config: {
                name: "BrunoPizza",
                authors: packageJson.author,
                description: packageJson.description,
                noMsi: true,
                setupExe:
                    `Bruno-Pizza-Setup-${packageJson.version}.exe`,
                setupIcon: path.resolve(
                    __dirname,
                    "desktop/assets/bruno-pizza.ico",
                ),
            },
        },
    ],
};
