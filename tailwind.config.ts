import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        zexo: {
          blue: {
            50: "#EFF6FF",
            100: "#DBEAFE",
            200: "#BFDBFE",
            300: "#93C5FD",
            400: "#60A5FA",
            500: "#3B82F6",
            600: "#0066FF",
            700: "#0052CC",
            800: "#003D99",
            900: "#002966",
          },
          cyan: "#00C6FF",
          gold: "#F59E0B",
          dark: "#0F172A",
        },
      },
      backgroundImage: {
        "zexo-gradient": "linear-gradient(180deg, #0084FF 0%, #0052CC 100%)",
        "zexo-header": "linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)",
        "zexo-bg": "linear-gradient(180deg, #E6F3FF 0%, #F5F9FF 60%, #E0F0FE 100%)",
      },
    },
  },
  plugins: [],
};
export default config;

