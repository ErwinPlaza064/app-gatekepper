import { useEffect } from "react";

/**
 * Componente que se asegura de que no haya temas aplicados
 * fuera del dashboard
 */
export default function ThemeCleaner() {
    useEffect(() => {
        // Remover cualquier tema aplicado al cargar una página que no sea dashboard
        document.documentElement.classList.remove("dark");

        // Limpiar si hay algún evento de tema pendiente
        const cleanup = () => {
            document.documentElement.classList.remove("dark");
        };

        // Limpiar al desmontar
        return cleanup;
    }, []);

    // Este componente no renderiza nada
    return null;
}
