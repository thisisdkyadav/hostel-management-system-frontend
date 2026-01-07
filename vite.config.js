import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import fs from "fs";
import path from "path";

/* --------------------------------
   Copy meta.json into dist
-------------------------------- */
const copyMetaJson = () => {
  return {
    name: "copy-meta-json",
    writeBundle() {
      const publicPath = path.resolve("public/meta.json");
      const distPath = path.resolve("dist/meta.json");

      if (fs.existsSync(publicPath)) {
        fs.copyFileSync(publicPath, distPath);
      } else {
        const packageJson = JSON.parse(
          fs.readFileSync("package.json", "utf8")
        );

        const metaContent = {
          version: packageJson.version || "0.0.0",
          buildTimestamp: new Date().toISOString(),
        };

        fs.writeFileSync(distPath, JSON.stringify(metaContent, null, 2));
      }
    },
  };
};

export default defineConfig({
  base: "/",

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  plugins: [
    tailwindcss(),

    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),

    /* --------------------------------
       PWA CONFIG (FIXED)
    -------------------------------- */
    VitePWA({
      /* ✅ REQUIRED for installability */
      registerType: "autoUpdate",
      injectRegister: "auto",

      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "masked-icon.svg",
      ],

      manifest: {
        name: "Hostel Management System - IIT Indore",
        short_name: "HMS - IITI",
        description:
          "Hostel Management System for IIT Indore students and staff",

        start_url: "/",
        scope: "/",
        display: "standalone",

        background_color: "#ffffff",
        theme_color: "#1360AB",

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
        ],
      },

      /* Dev mode PWA */
      devOptions: {
        enabled: true,
        type: "module",
      },

      /* --------------------------------
         Workbox (NO STALE USERS)
      -------------------------------- */
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,

        /* ❌ NEVER precache index.html */
        navigateFallback: undefined,

        /* ❌ No precache at all (safe) */
        globPatterns: [],

        runtimeCaching: [
          /* ✅ SPA navigation */
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "html-cache",
            },
          },

          /* ✅ JS runtime caching */
          {
            urlPattern: /\.(?:js)$/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "js-runtime-cache",
            },
          },

          /* ✅ Google Fonts */
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-styles",
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-files",
            },
          },
        ],
      },
    }),

    copyMetaJson(),
  ],
});