import react from "@vitejs/plugin-react";
import {
    defineConfig,
    loadEnv,
} from "vite";

export default defineConfig(({ mode }) => {
    const environment = loadEnv(
        mode,
        process.cwd(),
        "",
    );

    const developmentApiTarget =
        environment.VITE_DEV_API_TARGET?.trim() ||
        "http://127.0.0.1:3001";

    return {
        plugins: [react()],
        server: {
            proxy: {
                "/api": {
                    target: developmentApiTarget,
                },
            },
        },
    };
});
