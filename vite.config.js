import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
    server: {
        host: "0.0.0.0", // Permite acceso desde cualquier dispositivo en la red
        port: 5173, // Puedes cambiar el puerto si lo necesitas
        strictPort: true,
        cors: true, // Habilita CORS
    },
    plugins: [
        laravel({
            input: "resources/js/app.jsx",
            refresh: true,
        }),
        react(),
    ],
});
