/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        primary: "#4F8DF9",
        accent: "#6EE7B7",
        textDark: "#111827",
        bgLight: "#F9FAFB",
        card: "#FFFFFF",
        border: "#E5E7EB",
      },
      backgroundImage: {
        gradient: "linear-gradient(90deg, #4F8DF9 0%,rgba(22, 9, 87, 0.4) 100%)",
      },
      boxShadow: {
        subtle: "0 4px 12px rgba(0, 0, 0, 0.05)",
        soft: "0 6px 20px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};
