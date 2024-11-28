import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";

const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.jsx",
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: [
                    '"Montserrat Variable"',
                    ...defaultTheme.fontFamily.sans,
                ],
            },
            colors: {
                primary: "#44749d",
                secondary: "#c6d4e1",
                accent: "#bdb8adB",
            },
        },
    },

    plugins: [
        plugin(function ({ addUtilities, addComponents, e, config }) {
            // Add your custom styles here
        }),
        forms,
        require("@tailwindcss/typography"),
    ],
};
