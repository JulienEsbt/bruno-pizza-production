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
            /^\/\.idea(?:\/|$)/,
            /^\/backups(?:\/|$)/,
            /^\/backend\/data(?:\/|$)/,
            /^\/(?:backend|frontend)\/node_modules(?:\/|$)/,
            /^\/(?:backend|frontend)\/\.env(?:\.|$)/,
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
