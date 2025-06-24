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
      workbox: {
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // Increase to 3MB
      },
    }),
    copyMetaJson(),
  ],
  base: "/", // Ensures relative paths for assets
})
