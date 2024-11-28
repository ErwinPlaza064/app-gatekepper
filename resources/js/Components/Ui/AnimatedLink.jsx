import { Link } from "@inertiajs/react";

export default function AnimatedLink({
    children,
    variant,
    color,
    onClick,
    className,
    disabled,
    type,
    ...rest
}) {
    const variantClasses = {
        primary: "text-primary text-sm font-semibold",
        secondary: "text-secondary text-sm font-semibold",
        white: "text-white text-sm font-semibold",
        black: "text-black text-sm font-semibold",
        mobileLink: "text-black",
        outline: "border border-primary text-primary",
    };

    return (
        <Link
            onClick={onClick}
            className={`relative inline-flex items-center leading-3 no-underline space-x-1 mx-1 py-1 transition group focus:outline-none focus:ring-2 focus:ring-${color} hover:brightness-125 transition ease-linear duration-150 ${variantClasses[variant]} ${className}`}
            disabled={disabled}
            type={type}
            {...rest}
        >
            {children}
            <span
                className={`absolute top-[62%] left-0 w-full h-[1px] bg-${color} origin-bottom-right transform transition duration-200 ease-out scale-x-0 group-hover:scale-x-100 group-hover:origin-bottom-left`}
            ></span>
        </Link>
    );
}
