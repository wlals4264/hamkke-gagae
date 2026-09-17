import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff5ee",
          100: "#ffe5d3",
          500: "#f97345",
          600: "#e85a2a",
          700: "#bd3f18",
        },
        ink: "#20332d",
        cream: "#fbf8f2",
        sage: {
          50: "#f0f5ed",
          100: "#dfeadd",
          500: "#71936d",
          700: "#456242",
        },
      },
      boxShadow: {
        soft: "0 14px 40px rgba(32, 51, 45, 0.09)",
        card: "0 8px 24px rgba(32, 51, 45, 0.08)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
