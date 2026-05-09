import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      includeAssets: ['favicon.svg', 'lumi-icon.svg', 'lumi-icon-maskable.svg', 'lumi-logo-transparent.png'],
      manifest: {
        name: 'LUMI BOOK',
        short_name: 'LUMI',
        description: 'Спокойная система записи для мастеров.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        background_color: '#FBF6EC',
        theme_color: '#FBF6EC',
        orientation: 'portrait',
        icons: [
          { src: '/lumi-icon.svg', sizes: 'any', type: 'image/svg+xml' },
          { src: '/lumi-icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
      },
    }),
  ],
})
