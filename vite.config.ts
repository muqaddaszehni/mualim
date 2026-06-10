/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/mualim/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      workbox: { globPatterns: ['**/*.{js,css,html,png,svg,json}'], maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 },
      manifest: {
        name: 'Mualim — HKSI Paper 1',
        short_name: 'Mualim',
        display: 'standalone',
        background_color: '#101418',
        theme_color: '#101418',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }
    })
  ],
  test: { environment: 'node' }
})
