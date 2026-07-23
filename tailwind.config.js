/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./packages/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    colors: {
      base: {
        900: "#05060E",
        800: "#0E1120",
        700: "#181E33",
        600: "#2D3565",
      },
      ink: {
        100: "#F5F7FF",
        300: "#A8B0D6",
        500: "#7C88B0",
      },
      signal: {
        DEFAULT: "#37E8C4",
        500: "#37E8C4",
        600: "#2AC6A7",
      },
      alert: {
        DEFAULT: "#F9B24B",
      },
      critical: {
        DEFAULT: "#F1495B",
      },
    },
    boxShadow: {
      panel: "0 24px 80px rgba(1, 7, 25, 0.15)",
    },
    fontFamily: {
      display: ["Inter", "system-ui", "sans-serif"],
      body: ["Inter", "system-ui", "sans-serif"],
      data: ["Inter", "system-ui", "sans-serif"],
    },
    animation: {
      "pulse-dot": "pulse 1.5s ease-in-out infinite",
    },
  },
  plugins: [],
};
