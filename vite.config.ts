
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "favicon.ico"
      ],

      manifest: {
        name: "School Students Registration",
        short_name: "Student Portal",
        description: "Student registration and login application",

        theme_color: "#315d89",
        background_color: "#f3f5f8",

        display: "standalone",
        start_url: "/",

        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },

      workbox: {
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg}"
        ]
      }
    })
  ]
});