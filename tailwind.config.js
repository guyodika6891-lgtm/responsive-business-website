/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./business-website/index.html",
    "./business-website/src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#20231f",
        paper: "#f7f7f2",
        forest: "#27382f",
        lime: "#c5ef86",
      },
    },
  },
  plugins: [],
};