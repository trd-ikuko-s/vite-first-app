import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Vite PWA プラグインの設定
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Gen AI Chat PWA',
        short_name: 'Gen AI PWA',
        description: 'RealtimeAPIを通じてインタラクティブなやり取りができるチャットアプリです。',
        theme_color: '#4D4E4E',
        icons: [
          {
            purpose : "maskable",
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            purpose : "any",
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          
        ],
      },
    }),
  ],
  base: './',
});
