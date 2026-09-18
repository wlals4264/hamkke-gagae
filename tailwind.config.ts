import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff3e9",
          100: "#f6d6be",
          500: "#e8a07c",
          600: "#885039",
          700: "#703e2b",
        },
        ink: "#3f3828",
        muted: "#6d604a",
        cream: "#ffeed6",
        brown: "#827148",
        sage: {
          50: "#f0f2e5",
          100: "#e3e7cd",
          500: "#a5af79",
          700: "#505c32",
        },
      },
      boxShadow: {
        soft: "0 14px 40px rgba(64, 54, 47, 0.09)",
        card: "0 8px 24px rgba(64, 54, 47, 0.08)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
