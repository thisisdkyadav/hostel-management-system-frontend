import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { VitePWA } from "vite-plugin-pwa"
import fs from "fs"
import path from "path"

// Custom plugin to copy meta.json to dist folder
const copyMetaJson = () => {
  return {
    name: "copy-meta-json",
    writeBundle() {
      const publicPath = path.resolve("public/meta.json")
      const distPath = path.resolve("dist/meta.json")

      if (fs.existsSync(publicPath)) {
        fs.copyFileSync(publicPath, distPath)
        console.log("Copied meta.json to dist folder")
      } else {
        // Create a default meta.json if it doesn't exist
        const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"))
        const metaContent = {
          version: packageJson.version || "0.0.0",
          buildTimestamp: new Date().toISOString(),
        }
        fs.writeFileSync(distPath, JSON.stringify(metaContent, null, 2))
        console.log("Created default meta.json in dist folder")
      }
    },
  }
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],

      manifest: {
        name: "Hostel Management System - IIT Indore",
        short_name: "HMS - IITI",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#1360AB",
      },

      devOptions: {
        enabled: true,
        type: "module",
      },

      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,

        navigateFallback: undefined,

        globPatterns: [],

        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "html-cache",
            },
          },
          {
            urlPattern: /\.(?:js)$/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "js-runtime-cache",
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
          },
        ],
      },
    }),
    copyMetaJson(),
  ],
  base: "/", // Ensures relative paths for assets
})
