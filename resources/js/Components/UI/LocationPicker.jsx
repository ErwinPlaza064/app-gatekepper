import React, { useEffect, useRef, useState } from "react";

export default function LocationPicker({
    onLocationChange,
    initialLocation = null,
}) {
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const [map, setMap] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(initialLocation);
    const [address, setAddress] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Default location (Mexico City)
    const defaultLocation = { lat: 19.4326, lng: -99.1332 };

    useEffect(() => {
        // Load Google Maps Script
        const loadGoogleMaps = () => {
            if (window.google && window.google.maps) {
                initMap();
                return;
            }

            const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

            if (!apiKey) {
                setError("API Key de Google Maps no configurada");
                setIsLoading(false);
                return;
            }

            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => initMap();
            script.onerror = () => {
                setError("Error al cargar Google Maps");
                setIsLoading(false);
            };
            document.head.appendChild(script);
        };

        loadGoogleMaps();
    }, []);

    const initMap = () => {
        try {
            const initialPos = initialLocation || defaultLocation;

            const mapInstance = new window.google.maps.Map(mapRef.current, {
                center: initialPos,
                zoom: 13,
                mapTypeControl: true,
                streetViewControl: false,
                fullscreenControl: false,
            });

            const marker = new window.google.maps.Marker({
                position: initialPos,
                map: mapInstance,
                draggable: true,
                animation: window.google.maps.Animation.DROP,
            });

            // Click on map to move marker
            mapInstance.addListener("click", (e) => {
                const location = {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng(),
                };
                updateLocation(location, marker, mapInstance);
            });

            // Drag marker
            marker.addListener("dragend", (e) => {
                const location = {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng(),
                };
                updateLocation(location, marker, mapInstance);
            });

            setMap(mapInstance);
            markerRef.current = marker;

            if (initialLocation) {
                updateLocation(initialLocation, marker, mapInstance);
            } else {
                // Try to get user's current location
                getCurrentLocation(marker, mapInstance);
            }

            setIsLoading(false);
        } catch (err) {
            setError("Error al inicializar el mapa");
            setIsLoading(false);
        }
    };

    const getCurrentLocation = (marker, mapInstance) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    updateLocation(location, marker, mapInstance);
                    mapInstance.setCenter(location);
                },
                () => {
                    // If user denies, use default location
                    updateLocation(defaultLocation, marker, mapInstance);
                }
            );
        }
    };

    const updateLocation = (location, marker, mapInstance) => {
        setSelectedLocation(location);
        marker.setPosition(location);
        mapInstance.panTo(location);

        // Reverse geocoding to get address
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location }, (results, status) => {
            if (status === "OK" && results[0]) {
                setAddress(results[0].formatted_address);
                if (onLocationChange) {
                    onLocationChange({
                        lat: location.lat,
                        lng: location.lng,
                        address: results[0].formatted_address,
                    });
                }
            } else {
                setAddress(
                    `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
                );
                if (onLocationChange) {
                    onLocationChange({
                        lat: location.lat,
                        lng: location.lng,
                        address: `${location.lat.toFixed(
                            6
                        )}, ${location.lng.toFixed(6)}`,
                    });
                }
            }
        });
    };

    const handleUseCurrentLocation = () => {
        if (navigator.geolocation) {
            setIsLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    updateLocation(location, markerRef.current, map);
                    map.setCenter(location);
                    map.setZoom(15);
                    setIsLoading(false);
                },
                (error) => {
                    setError("No se pudo obtener tu ubicación");
                    setIsLoading(false);
                }
            );
        } else {
            setError("La geolocalización no está disponible en tu navegador");
        }
    };

    if (error) {
        return (
            <div className="p-8 text-center border-2 border-red-200 rounded-xl bg-red-50">
                <svg
                    className="w-16 h-16 mx-auto mb-4 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
                <p className="text-lg font-semibold text-red-700">{error}</p>
                <p className="mt-2 text-sm text-red-600">
                    Por favor, verifica tu configuración de Google Maps API
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Map Container */}
            <div className="relative overflow-hidden border-2 border-gray-200 rounded-xl">
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75">
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
                            <p className="mt-2 text-sm text-gray-600">
                                Cargando mapa...
                            </p>
                        </div>
                    </div>
                )}
                <div ref={mapRef} className="w-full h-96" />
            </div>

            {/* Instructions */}
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                <div className="flex items-start">
                    <svg
                        className="w-5 h-5 mt-0.5 mr-3 text-blue-600 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <div className="text-sm text-blue-800">
                        <p className="font-semibold">
                            ¿Cómo seleccionar tu ubicación?
                        </p>
                        <ul className="mt-2 space-y-1 list-disc list-inside">
                            <li>
                                Haz clic en el mapa para colocar el marcador
                            </li>
                            <li>Arrastra el marcador a tu ubicación exacta</li>
                            <li>
                                O usa el botón para obtener tu ubicación actual
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Current Location Button */}
            <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-blue-600 transition-all duration-200 bg-white border-2 border-blue-300 rounded-xl hover:bg-blue-50 hover:border-blue-400"
            >
                <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                </svg>
                Usar mi ubicación actual
            </button>

            {/* Selected Address Display */}
            {address && (
                <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                    <div className="flex items-start">
                        <svg
                            className="w-5 h-5 mt-0.5 mr-3 text-green-600 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <div className="text-sm">
                            <p className="font-semibold text-green-800">
                                Ubicación seleccionada:
                            </p>
                            <p className="mt-1 text-green-700">{address}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
