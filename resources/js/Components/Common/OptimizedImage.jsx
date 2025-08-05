import React, { memo } from "react";
import { useLazyImage } from "@/Hooks/useOptimizations";

const OptimizedImage = memo(
    ({
        src,
        alt,
        className = "",
        placeholder = "/placeholder.svg",
        loading = "lazy",
        ...props
    }) => {
        const { imageSrc, isLoaded, isError, imgRef } = useLazyImage(src);

        if (isError) {
            return (
                <div
                    className={`bg-gray-200 flex items-center justify-center ${className}`}
                    {...props}
                >
                    <span className="text-gray-500 text-sm">
                        Error cargando imagen
                    </span>
                </div>
            );
        }

        return (
            <div ref={imgRef} className={`relative ${className}`}>
                {!isLoaded && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
                )}
                {imageSrc && (
                    <img
                        src={imageSrc}
                        alt={alt}
                        loading={loading}
                        className={`transition-opacity duration-300 ${
                            isLoaded ? "opacity-100" : "opacity-0"
                        } ${className}`}
                        {...props}
                    />
                )}
            </div>
        );
    }
);

OptimizedImage.displayName = "OptimizedImage";

export default OptimizedImage;
