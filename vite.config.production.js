import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => {
    const isProduction = command === "build";

    return {
        plugins: [
            laravel({
                input: [
                    "resources/js/app.jsx",
                    "resources/js/Pages/Dashboard.jsx",
                ],
                refresh: !isProduction,
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
            cssCodeSplit: true,
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
            host: "0.0.0.0",
            port: 5173,
            cors: true,
        },
    };
});
