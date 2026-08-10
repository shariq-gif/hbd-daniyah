import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FFF8F0",
        blush: "#FFD9E0",
        blushdeep: "#FFB3C6",
        lavender: "#E4DCFF",
        lavenderdeep: "#C9B8FF",
        peach: "#FFD9BE",
        butter: "#FFF3C4",
        rose: "#FF7EA0",
        ink: "#4A3F55",
        inksoft: "#6B5E7A",
        night: "#14101F",
        nightdeep: "#0B0814",
      },
      fontFamily: {
        display: ["var(--font-display)", "cursive"],
        hand: ["var(--font-hand)", "cursive"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(122, 90, 140, 0.35)",
        card: "0 18px 50px -18px rgba(122, 90, 140, 0.45)",
        glow: "0 0 40px -4px rgba(255, 158, 190, 0.55)",
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
        wiggle: "wiggle 2.5s ease-in-out infinite",
        shimmer: "shimmer 8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
