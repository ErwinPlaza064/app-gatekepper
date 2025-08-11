import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import fs from "fs";

export default defineConfig(({ command }) => {
    const isProduction = command === "build";

    return {
        plugins: [
            laravel({
                input: [
                    "resources/css/app.css",
                    "resources/js/app.jsx",
                    "resources/js/Pages/Dashboard.jsx",
                ],
                refresh: !isProduction,
                // Configurar preloading para CSS
                buildDirectory: "build",
            }),
            react(),
        ],
        build: {
            rollupOptions: {
                output: {
                    manualChunks: {
                        vendor: ["react", "react-dom"],
                        charts: ["chart.js", "react-chartjs-2"],
                        utils: ["lodash", "axios"],
                        qr: ["html5-qrcode", "qrcode.react"],
                    },
                },
            },
            cssCodeSplit: false, // Deshabilitar CSS code splitting
            sourcemap: false,
            minify: isProduction ? "terser" : false,
            terserOptions: isProduction
                ? {
                      compress: {
                          drop_console: true,
                          drop_debugger: true,
                      },
                  }
                : undefined,
        },
        server: {
            host: process.env.VITE_HOST || "0.0.0.0",
            port: process.env.VITE_PORT || 5173,
            cors: true,
            https: {
                key: fs.readFileSync("./ssl/server.key"),
                cert: fs.readFileSync("./ssl/server.crt"),
            },
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
        },
    };
});
