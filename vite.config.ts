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
    vercel: {
        rewrites: [
            {
                "source": "/api/buses",
                "destination": "http://bielawa.trapeze.fi/bussit/web?command=olmapvehicles&action=getVehicles"
            }
        ]
    },
    plugins: [
        vercel(),
        VitePWA({
            injectRegister: 'inline',
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

            }
        })
    ]
});
