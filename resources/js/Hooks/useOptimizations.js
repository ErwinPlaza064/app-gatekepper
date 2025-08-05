import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook para memoización inteligente que previene re-renders innecesarios
 */
export function useSmartMemo(dependencies = [], delay = 300) {
    const [memoizedValue, setMemoizedValue] = useState(null);
    const timeoutRef = useRef(null);
    const previousDepsRef = useRef(dependencies);

    const updateValue = useCallback(() => {
        setMemoizedValue(dependencies);
        previousDepsRef.current = dependencies;
    }, dependencies);

    useEffect(() => {
        const depsChanged = dependencies.some(
            (dep, index) => dep !== previousDepsRef.current[index]
        );

        if (depsChanged) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(updateValue, delay);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, dependencies);

    return memoizedValue || previousDepsRef.current;
}

/**
 * Hook para lazy loading de imágenes
 */
export function useLazyImage(src, options = {}) {
    const [imageSrc, setImageSrc] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isError, setIsError] = useState(false);
    const imgRef = useRef();

    useEffect(() => {
        if (!src) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    const img = new Image();
                    img.onload = () => {
                        setImageSrc(src);
                        setIsLoaded(true);
                        observer.disconnect();
                    };
                    img.onerror = () => {
                        setIsError(true);
                        observer.disconnect();
                    };
                    img.src = src;
                }
            },
            {
                threshold: 0.1,
                rootMargin: "50px",
                ...options,
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, [src]);

    return { imageSrc, isLoaded, isError, imgRef };
}

/**
 * Hook para debounce de valores
 */
export function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Hook para detectar si el usuario está inactivo
 */
export function useIdleTimer(timeout = 300000) {
    // 5 minutos por defecto
    const [isIdle, setIsIdle] = useState(false);
    const timeoutRef = useRef(null);

    const resetTimer = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsIdle(false);

        timeoutRef.current = setTimeout(() => {
            setIsIdle(true);
        }, timeout);
    }, [timeout]);

    useEffect(() => {
        const events = [
            "mousedown",
            "mousemove",
            "keypress",
            "scroll",
            "touchstart",
        ];

        const resetTimerHandler = () => resetTimer();

        events.forEach((event) => {
            document.addEventListener(event, resetTimerHandler, true);
        });

        resetTimer();

        return () => {
            events.forEach((event) => {
                document.removeEventListener(event, resetTimerHandler, true);
            });
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [resetTimer]);

    return isIdle;
}

/**
 * Hook para gestión optimizada del localStorage
 */
export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = useCallback(
        (value) => {
            try {
                const valueToStore =
                    value instanceof Function ? value(storedValue) : value;
                setStoredValue(valueToStore);
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            } catch (error) {
                console.error(
                    `Error setting localStorage key "${key}":`,
                    error
                );
            }
        },
        [key, storedValue]
    );

    return [storedValue, setValue];
}
