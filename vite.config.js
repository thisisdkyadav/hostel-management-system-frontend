import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Hostel Management System - IIT Indore",
        short_name: "HMS - IIT Indore",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000",
        icons: [
          {
            src: "/IITILogo.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/IITILogo.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      // devOptions: {
      //   enabled: true, // Enables PWA in development mode
      // },
    }),
  ],
  base: "/", // Ensures relative paths for assets
})
