import type { Config } from "tailwindcss";

const STATUS_COLORS = {
    pending: "#f59e0b",
    approved: "#3b82f6",
    rejected: "#ef4444",
    released: "#22c55e",
};

export const config: Config = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                ...STATUS_COLORS,
            },
        },
    },
    plugins: [],
};

export default config;
