/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      "sm": "448px",
      "md": "768px",
      "lg": "1024px",
    },
    extend: {},
  },
  plugins: [],
}

