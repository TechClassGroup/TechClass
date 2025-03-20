/** @type {import("tailwindcss").Config} */
export default {
    content: [
        "./index.html",
        "./src/*.{js,ts,jsx,tsx,vue}",
        "./src/**/*.{js,ts,jsx,tsx,vue}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "rgb(var(--color-primary))",
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
};

