import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/extension/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#080c14",
        surface: {
          50: "#141c2e",
          100: "#0f1624",
          200: "#0a0f1a",
          300: "#060910",
        },
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
        accent: {
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
          cyan: "#06b6d4",
        },
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(99, 102, 241, 0.25)",
        "glow-emerald": "0 0 25px -5px rgba(16, 185, 129, 0.25)",
        "glow-amber": "0 0 25px -5px rgba(245, 158, 11, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
