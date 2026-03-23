import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Chỉ cache App Shell tĩnh, không cache API calls Supabase
      workbox: {
        // Cache app shell: JS, CSS, HTML
        globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'],
        // KHÔNG cache ảnh từ external URLs (Supabase, imgbb) - để luôn fresh
        globIgnores: ['**/node_modules/**/*'],
        // Runtime caching: cache ảnh từ Supabase với stale-while-revalidate
        runtimeCaching: [
          {
            // Cache ảnh từ Supabase storage (tự refresh khi thay đổi)
            urlPattern: /^https:\/\/ayanxbiavxwouaexrywf\.supabase\.co\/storage\/.*$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'supabase-images',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 ngày
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache ảnh từ imgbb
            urlPattern: /^https:\/\/i\.ibb\.co\/.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'imgbb-images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // KHÔNG cache Supabase API calls (database) - luôn fresh
            urlPattern: /^https:\/\/ayanxbiavxwouaexrywf\.supabase\.co\/rest\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60, // Chỉ cache 1 phút, ưu tiên network
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
        // Skip waiting - activate SW ngay khi deploy mới
        skipWaiting: true,
        clientsClaim: true,
      },
      // Web App Manifest (cho mobile - thêm vào home screen)
      manifest: {
        name: 'Authentic Luffy',
        short_name: 'AuthenticLuffy',
        description: 'Giày Authentic chính hãng - Giày Thời Trang, Giày Thể Thao',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'https://s1.imgbb.ws/file/storage-sv1/QmZre.th.jpg',
            sizes: '192x192',
            type: 'image/jpeg',
          },
        ],
      },
      // Dev mode: bật SW trong dev để test
      devOptions: {
        enabled: false,
      },
    }),
  ],
  build: {
    target: 'es2015',
    outDir: 'dist',
    cssMinify: true,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@supabase')) {
            return 'supabase';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
          if (id.includes('node_modules/react-router')) {
            return 'router';
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) {
            return 'react-vendor';
          }
        },
      },
    },
  },
})
