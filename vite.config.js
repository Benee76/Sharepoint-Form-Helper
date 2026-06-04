import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repoName = "Sharepoint-Form-Helper";
const base = process.env.NODE_ENV === "production" ? `/${repoName}/` : "/";

// https://vitejs.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
