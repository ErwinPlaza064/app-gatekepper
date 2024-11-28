export default function Typography({
    as: Tag,
    children,
    className = "",
    variant,
    color,
    ...props
}) {
    const variantClasses = {
        h1: "text-3xl md:text-4xl font-semi-bold font-sans",
        h2: "text-2xl md:text-3xl sans",
        h3: "text-xl md:text-2xl sans",
        h4: "text-lg md:text-xl sans",
        h5: "text-md md:text-lg sans",
        h6: "text 4xl md:text-5xl font-bold",
        title: " text-4xl md:text-6xl sans",
        titleLg: " text-3xl md:text-5xl font-raleway",
        titleMd: " text-2xl md:text-4xl font-raleway",
        subtitle: "text-2xl md:text-3xl font-bold",
        subtitle1: "text-md md:text-lg font-medium",
        subtitle2: "text-base font-medium",
        body1: "text-base",
        body2: "text-sm",
        caption: "text-xs",
        overline: "text-xs uppercase",
        price: "text-3xl md:text-3xl font-bold font-Arial",
    };

    const colorClasses = {
        primary: "text-primary",
        secondary: "text-secondary",
        success: "text-success",
        error: "text-error",
        warning: "text-warning",
        info: "text-info",
        light: "text-light",
        dark: "text-dark",
        white: "text-white",
        black: "text-black",
    };

    return (
        <Tag
            className={`${variantClasses[variant]} ${colorClasses[color]} ${className}`}
            {...props}
        >
            {children}
        </Tag>
    );
}
