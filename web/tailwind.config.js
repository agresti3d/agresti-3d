/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#070f1f",
        surface: "#0d1a30",
        surface2: "#111f38",
        ink: "#edf2fb",
        muted: "#93a4bf",
        accent: "#ff6a3d",
        accentDeep: "#d23c14",
        line: "rgba(255,255,255,.10)",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
