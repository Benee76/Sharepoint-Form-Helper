import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Custom domain sharepoint.andreas-benee.dk is served at the domain root.
export default defineConfig({
  base: "/",
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
});
