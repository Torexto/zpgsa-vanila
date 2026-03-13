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
            injectRegister: 'script-defer',
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


            }
        })
    ]
});
