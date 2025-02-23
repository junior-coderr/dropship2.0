/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "brand-green": "#D6F3A2",
        "brand-black": "#000000",
      },
      fontFamily: {
        playfair: ["var(--font-playfair)"],
        sora: ["var(--font-sora)"],
        "dm-sans": ["var(--font-dm-sans)"],
      },
      keyframes: {
        progress: {
          "0%": { width: "0%" },
          "50%": { width: "70%" },
          "100%": { width: "100%" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        progress: "progress 1s ease-in-out",
        shimmer: "shimmer 1s linear infinite",
      },
      screens: {
        xs: "400px",
      },
    },
  },
  plugins: [],
};
