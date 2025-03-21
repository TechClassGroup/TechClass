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
                primary: {
                    100: "rgb(var(--color-primary-100))",
                    300: "rgb(var(--color-primary-300))",
                    500: "rgb(var(--color-primary-500))",
                    700: "rgb(var(--color-primary-700))",
                    900: "rgb(var(--color-primary-900))",
                    DEFAULT: "rgb(var(--color-primary-500))",
                },
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
};
