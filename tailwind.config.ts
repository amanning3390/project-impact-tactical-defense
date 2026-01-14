import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Retro Sci-Fi Color Palette
        primary: {
          DEFAULT: "#00ffff",
          light: "#06b6d4",
          dark: "#0891b2",
        },
        secondary: {
          DEFAULT: "#fbbf24",
          light: "#f59e0b",
        },
        success: {
          DEFAULT: "#10b981",
          dark: "#059669",
        },
        warning: {
          DEFAULT: "#fbbf24",
          light: "#eab308",
        },
        error: {
          DEFAULT: "#ef4444",
          dark: "#dc2626",
        },
        extinction: {
          DEFAULT: "#991b1b",
          dark: "#7f1d1d",
        },
        surface: {
          DEFAULT: "#1a1a1a",
          light: "#262626",
        },
      },
      fontFamily: {
        mono: ["Space Mono", "JetBrains Mono", "Fira Code", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "neon-cyan": "0 0 10px rgba(0, 255, 255, 0.5), 0 0 20px rgba(0, 255, 255, 0.3)",
        "neon-cyan-lg": "0 0 20px rgba(0, 255, 255, 0.6), 0 0 40px rgba(0, 255, 255, 0.4)",
        "neon-amber": "0 0 10px rgba(251, 191, 36, 0.5), 0 0 20px rgba(251, 191, 36, 0.3)",
        "neon-gold": "0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.4)",
      },
      animation: {
        "neon-pulse": "neon-pulse 2s ease-in-out infinite",
        "dial-tick": "dial-tick 0.2s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "shimmer": "shimmer 2s linear infinite",
        "coordinate-reveal": "coordinate-reveal 1s ease-out",
        "impact-flash": "impact-flash 0.5s ease-out",
        "spin-slow": "spin 12s linear infinite",
      },
      keyframes: {
        "neon-pulse": {
          "0%, 100%": { boxShadow: "0 0 10px rgba(0, 255, 255, 0.5)" },
          "50%": { boxShadow: "0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(0, 255, 255, 0.5)" },
        },
        "dial-tick": {
          "0%": { transform: "rotate(-5deg)" },
          "50%": { transform: "rotate(5deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "coordinate-reveal": {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "impact-flash": {
          "0%": { opacity: "1", filter: "brightness(3)" },
          "100%": { opacity: "1", filter: "brightness(1)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;


