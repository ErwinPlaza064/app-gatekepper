import { useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { Link } from "@inertiajs/react";
import Typography from "../UI/Typography";

export default function Benefits() {
    const covers = [
        {
            src: "/Assets/Benefits-Section.png",
            srcMobile: "/Assets/Benefits-Section-Mobile.png",
            alt: "Img_Benefits",
            href: "",
            text: "REGISTRO RAPIDO Y SENCILLO",
        },
        {
            src: "/Assets/Img-Notification.png",
            srcMobile: "/Assets/Img-Notification-Mobile.png",
            alt: "",
            href: "",
            text: "NOTIFICACIONES INMEDIATAS",
        },
        {
            src: "/Assets/Img-Security.png",
            srcMobile: "/Assets/Img-Security-Mobile.png",
            alt: "",
            href: "",
            text: "MEJORA EN LA SEGURIDAD",
        },
        {
            src: "/Assets/Img-Mantenimiento.png",
            srcMobile: "/Assets/Img-Mantenimiento-Mobile.png",
            alt: "",
            href: "",
            text: "MANTENIMIENTO Y ACTUZALIZACIONES",
        },
    ];
    const WheelControls = (slider) => {
        let touchTimeout;
        let position;
        let wheelActive;

        function dispatch(e, name) {
            position.x -= e.deltaX;
            position.y -= e.deltaY;
            slider.container.dispatchEvent(
                new CustomEvent(name, {
                    detail: {
                        x: position.x,
                        y: position.y,
                    },
                })
            );
        }

        function wheelStart(e) {
            position = {
                x: e.pageX,
                y: e.pageY,
            };
            dispatch(e, "ksDragStart");
        }

        function wheel(e) {
            dispatch(e, "ksDrag");
        }

        function wheelEnd(e) {
            dispatch(e, "ksDragEnd");
        }

        function eventWheel(e) {
            e.preventDefault();
            if (!wheelActive) {
                wheelStart(e);
                wheelActive = true;
            }
            wheel(e);
            clearTimeout(touchTimeout);
            touchTimeout = setTimeout(() => {
                wheelActive = false;
                wheelEnd(e);
            }, 50);
        }

        slider.on("created", () => {
            slider.container.addEventListener("wheel", eventWheel, {
                passive: false,
            });
        });
    };
    const [sliderRef] = useKeenSlider(
        {
            loop: false,
            rubberband: false,
            vertical: true,
        },
        [WheelControls]
    );

    return (
        <div
            ref={sliderRef}
            className="keen-slider flex justify-center px-4 md:px-64 relative z-0"
        >
            {covers.map(({ src, srcMobile, alt, href, text }, idx) => (
                <div className="relative keen-slider__slide">
                    <div className={`${idx + 1}`}>
                        <Link href={href}>
                            <picture>
                                <source
                                    media="(max-width: 640px)"
                                    srcSet={srcMobile}
                                />
                                <img
                                    className="h-48 md:h-60 w-full object-cover"
                                    src={src}
                                    alt={alt}
                                />
                                <Typography
                                    as={"h3"}
                                    variant={"h3"}
                                    color={"white"}
                                    className="absolute bottom-28 w-full text-center text-lg md:text-xl bg-black bg-opacity-70 py-2"
                                >
                                    {text}
                                </Typography>
                            </picture>
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
}
