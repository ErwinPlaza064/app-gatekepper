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
    build: {
        rollupOptions: {
            external: ["@babel/runtime/helpers/extends"],
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
        minify: "terser",
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
        },
    },
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
