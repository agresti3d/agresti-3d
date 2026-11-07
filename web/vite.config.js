import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/nuevo-home/",
  build: {
    outDir: "../nuevo-home",
    emptyOutDir: true,
  },
});
