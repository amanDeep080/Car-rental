import type { Config } from "tailwindcss";

// VELOCIRA design tokens
// Palette: dark obsidian automotive base + a single brass/copper ignition accent.
// Deliberately avoiding the generic "cream + terracotta" and "black + acid green" AI defaults.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: "#0A0A0B", // page background
          soft: "#101012",
        },
        graphite: {
          DEFAULT: "#17171A", // card / panel surface
          raised: "#201F22", // elevated surface (modals, hovered cards)
          line: "#2A2A2E", // hairline borders
        },
        ivory: {
          DEFAULT: "#EDEAE4", // primary text on dark
          dim: "#C9C6BF",
        },
        steel: {
          DEFAULT: "#8B8A8F", // secondary / metadata text
          dark: "#5C5B60",
        },
        brass: {
          DEFAULT: "#C98A3B", // primary ignition accent
          bright: "#E8A33D", // hover / active state
          dim: "#8A5F2B", // pressed / subtle accent
        },
        signal: {
          available: "#4C9A6A",
          booked: "#B4483C",
          pending: "#C9A23B",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        "hero": ["clamp(3.25rem, 7vw, 7.5rem)", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2.5rem, 4.5vw, 4.25rem)", { lineHeight: "1.02", letterSpacing: "-0.015em" }],
        "display-md": ["clamp(1.75rem, 2.8vw, 2.5rem)", { lineHeight: "1.08", letterSpacing: "-0.01em" }],
      },
      borderRadius: {
        xs: "4px",
        card: "14px",
        panel: "22px",
      },
      backgroundImage: {
        "brass-sheen": "linear-gradient(135deg, #E8A33D 0%, #C98A3B 45%, #8A5F2B 100%)",
        "grain": "url('/textures/grain.png')",
      },
      boxShadow: {
        "brass-glow": "0 0 40px -8px rgba(232, 163, 61, 0.35)",
        "panel": "0 20px 60px -20px rgba(0,0,0,0.6)",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
