import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Use root base in dev, relative paths in production so GitHub Pages works consistently.
export default defineConfig(({ command }) => ({
  base: command === "serve" ? "/" : "./",
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
}));
