import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { readFileSync } from "node:fs";

// Read package.json to get the version reliably in production environments
const packageJson = JSON.parse(readFileSync("./package.json", "utf-8"));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.js",
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "android-chrome-192x192.png",
        "android-chrome-512x512.png",
      ],

      devOptions: {
        enabled: true,
        type: "module",
      },

      injectManifest: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
      },

      manifest: {
        name: "6A Skillcity",
        short_name: "6A Skillcity",
        description:
          "6A Skillcity | Empowering Global Education & Skill Partnerships",

        theme_color: "#ffffff",
        background_color: "#ffffff",

        display: "standalone",
        start_url: "/",
        scope: "/",

        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("axios") ||
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router-dom")
            ) {
              return "vendor";
            }
          }
        },
      },
    },
  },

  preview: {
    allowedHosts: ["6askillcity.com"],
  },

  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __BUILD_TIME__: JSON.stringify(new Date().toLocaleString("EN-IN")),
  },
});
