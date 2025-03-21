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
                    50: "rgb(var(--color-primary-50))",
                    100: "rgb(var(--color-primary-100))",
                    200: "rgb(var(--color-primary-200))",
                    300: "rgb(var(--color-primary-300))",
                    400: "rgb(var(--color-primary-400))",
                    500: "rgb(var(--color-primary-500))",
                    600: "rgb(var(--color-primary-600))",
                    700: "rgb(var(--color-primary-700))",
                    800: "rgb(var(--color-primary-800))",
                    900: "rgb(var(--color-primary-900))",
                    950: "rgb(var(--color-primary-950))",
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
