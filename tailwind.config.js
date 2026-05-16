/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        violet: {
          50:  "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)",
        panel: "0 8px 40px -8px rgba(0,0,0,0.15)",
      },
      animation: {
        "slide-in-right": "slideInRight 0.3s cubic-bezier(0.16,1,0.3,1)",
        "slide-up": "slideUp 0.3s cubic-bezier(0.16,1,0.3,1)",
        "fade-in": "fadeIn 0.2s ease-out",
        "scale-in": "scaleIn 0.2s cubic-bezier(0.16,1,0.3,1)",
      },
      keyframes: {
        slideInRight: {
          from: { transform: "translateX(100%)", opacity: 0 },
          to:   { transform: "translateX(0)",    opacity: 1 },
        },
        slideUp: {
          from: { transform: "translateY(100%)", opacity: 0 },
          to:   { transform: "translateY(0)",    opacity: 1 },
        },
        fadeIn: {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
        scaleIn: {
          from: { transform: "scale(0.95)", opacity: 0 },
          to:   { transform: "scale(1)",    opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
