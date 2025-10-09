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
        description: "Hostel Management System for IIT Indore students and staff",
        start_url: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#ffffff",
        theme_color: "#1360AB",
        categories: ["education", "productivity"],
        icons: [
          {
            src: "/IITILogo.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/IITILogo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png",
            purpose: "apple touch icon",
          },
        ],
        related_applications: [],
        prefer_related_applications: false,
        shortcuts: [
          {
            name: "Dashboard",
            short_name: "Dashboard",
            url: "/student",
            description: "View your dashboard",
          },
        ],
      },
      devOptions: {
        enabled: true, // Enable PWA in development mode for testing
        type: "module",
        navigateFallback: "index.html",
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,webp}"],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: /^https:\/\/api\..*\/api\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
    }),
    copyMetaJson(),
  ],
  base: "/", // Ensures relative paths for assets
})
