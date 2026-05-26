import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: "oklch(16% 0.06 270)",
          elevated: "oklch(22% 0.08 270)",
        },
        foreground: {
          primary: "oklch(98% 0.01 270)",
          secondary: "oklch(85% 0.04 270)",
          muted: "oklch(60% 0.06 270)",
        },
        accent: {
          mint: "oklch(82% 0.16 150)",
          magenta: "oklch(75% 0.14 320)",
        },
        indicator: {
          track: "oklch(30% 0.08 270)",
          border: "oklch(35% 0.1 270)",
        }
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      },
      animation: {
        shimmer: 'shimmer 3s infinite linear',
      },
      transitionTimingFunction: {
        "expo-out": "cubic-bezier(0.2, 0, 0, 1)",
        "soft-overshoot": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      }
    },
  },
  plugins: [],
};
export default config;
