import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';
import vercel from 'vite-plugin-vercel';

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
      vercel(),
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
            skipWaiting: true,
            clientsClaim: true,
            maximumFileSizeToCacheInBytes: 10485760,
            navigateFallback: "/index.html",

            globIgnores: ['**\/api\/**\/*'],
            globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],

            runtimeCaching: [
               {
                  urlPattern: ({request}) => request.mode === 'navigate',
                  handler: 'NetworkFirst',
                  options: {
                     cacheName: 'html'
                  }
               },
               {
                  urlPattern: /\.(json)$/,
                  handler: 'NetworkFirst',
                  options: {
                     cacheName: 'json'
                  }
               },
               {
                  urlPattern: /\.(js|css)$/,
                  handler: 'StaleWhileRevalidate',
                  options: {
                     cacheName: 'logic'
                  }
               },
               {
                  urlPattern: /\.(png|xml|txt|webmanifest)/,
                  handler: 'CacheFirst',
                  options: {
                     cacheName: 'assets'
                  }
               }
            ]
         }
      })
   ]
});
