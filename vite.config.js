import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        laravel({
            input: "resources/js/app.jsx",
            refresh: true,
        }),
        react(),
    ],
    server: {
        host: process.env.VITE_HOST,
        port: 5173,
        cors: true,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
        https: {
            key: "ssl/server.key",
            cert: "ssl/server.crt",
        },
    },
});
