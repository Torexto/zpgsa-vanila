import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig({
   server: {
      proxy: {
         "/api/buses": {
            target: "http://bielawa.trapeze.fi",
            changeOrigin: true,
            rewrite: _ =>
               "/bussit/web?command=olmapvehicles&action=getVehicles"
         }
      }
   },
   plugins: [
      VitePWA({
         registerType: 'autoUpdate',
         manifest: {
            name: "Zpgsa",
            short_name: "Zpgsa",
            theme_color: "#000000",
            background_color: "#000000",
            display: "standalone",
            scope: "./",
            start_url: "./",
            icons: [
               {
                  "src": "icons/icon-192x192.png",
                  "sizes": "192x192",
                  "type": "image/png",
                  "purpose": "maskable any"
               },
               {
                  "src": "icons/icon-512x512.png",
                  "sizes": "512x512",
                  "type": "image/png",
                  "purpose": "maskable any"
               }
            ]
         },
         workbox: {
            maximumFileSizeToCacheInBytes: 10485760,
            globPatterns: [
               '**/*.{js,css,html,png,jpg,jpeg,svg,gif,woff2,woff,ttf,webmanifest,json}'
            ],
            runtimeCaching: [
               {
                  urlPattern: /^\/api\//,
                  handler: 'NetworkOnly',
                  options: {
                     cacheName: 'api-cache',
                     expiration: {
                        maxEntries: 50,
                        maxAgeSeconds: 60 * 60 * 24 // 1 dzień
                     }
                  }
               }
            ]
         }
      })
   ]
});
