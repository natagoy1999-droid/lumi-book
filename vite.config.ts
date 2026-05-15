import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

/** Bust caches / precache namespace each deploy (override in CI with VITE_BUILD_ID). */
const APP_BUILD_ID = process.env.VITE_BUILD_ID ?? `${Date.now()}`

function lumiBuildCacheKey(buildId: string): Plugin {
  const v = encodeURIComponent(buildId)
  const metaSafe = buildId.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
  return {
    name: 'lumi-build-cache-key',
    enforce: 'post',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        let out = html.replace(/href="([^"]*manifest\.webmanifest)"/, `href="$1?v=${v}"`)
        out = out.replace(/href="\/lumi-icon\.svg"/g, `href="/lumi-icon.svg?v=${v}"`)
        out = out.replace(
          /href="\/icons\/apple-touch-icon\.png"/g,
          `href="/icons/apple-touch-icon.png?v=${v}"`,
        )
        out = out.replace('</head>', `  <meta name="lumi-build-id" content="${metaSafe}" />\n</head>`)
        return out
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  define: {
    'import.meta.env.VITE_APP_BUILD_ID': JSON.stringify(APP_BUILD_ID),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      /** Use `virtual:pwa-register` in main.tsx — inline/script stubs skip workbox-window and never auto-reload. */
      injectRegister: false,
      includeAssets: [
        'favicon.svg',
        'lumi-icon.svg',
        'lumi-icon-maskable.svg',
        'icons/icon-192.png',
        'icons/icon-512.png',
        'icons/icon-maskable-512.png',
        'icons/apple-touch-icon.png',
      ],
      manifest: {
        name: 'LUMI BOOK',
        short_name: 'LUMI',
        description: 'Онлайн-запись для мастеров и клиентов',
        lang: 'ru',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui', 'browser'],
        background_color: '#F6F2EA',
        theme_color: '#E8C86A',
        orientation: 'portrait',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          { src: '/lumi-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        cacheId: `lumi-book-${APP_BUILD_ID}`,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
      },
    }),
    lumiBuildCacheKey(APP_BUILD_ID),
  ],
})
