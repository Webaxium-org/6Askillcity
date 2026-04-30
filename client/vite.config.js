import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["axios", "react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
  preview: {
    allowedHosts: ["six-a-skillcity-m25sx.ondigitalocean.app"],
  },
});
