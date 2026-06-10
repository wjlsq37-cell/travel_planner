import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      input: 'index.html'
    }
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    open: true
  },
  plugins: [
    VitePWA({
      registerType: 'prompt',
      // Prompt user before updating; keep clientsClaim so activated SW claims all clients
      workbox: {
        clientsClaim: true,
        // Precache all Vite output: HTML, JS, CSS, icons
        globPatterns: [
          '**/*.{html,js,css,json,png,svg,ico,woff2}'
        ],
        globIgnores: [
          '**/node_modules/**',
          '**/sw.js',
          '**/workbox-*.js'
        ],
        // Navigation fallback: offline → cached index.html
        navigateFallback: './index.html',
        navigateFallbackAllowlist: [/^(?!\/__\/).*/],
        // Runtime caching for external CDN if needed
        runtimeCaching: [
          {
            // Don't cache API calls (weather, AI, maps)
            urlPattern: /^https:\/\/.*(open-meteo\.com|api\.deepseek\.com|api\.xiaomimimo\.com|workers\.dev|map\.baidu\.com|openstreetmap\.org|router\.project-osrm)/,
            handler: 'NetworkOnly'
          }
        ],
        // Cache version
        cacheId: 'travel-planner-v4-5-0'
      },
      // PWA manifest
      manifest: {
        name: '万能版旅游计划书',
        short_name: '旅游计划书',
        description: '智能旅游规划助手 - 支持 AI 生成个性化旅行计划',
        start_url: './index.html',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f8fafc',
        theme_color: '#0ea5e9',
        icons: [
          {
            src: './icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: './icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: './icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        categories: ['travel', 'lifestyle'],
        lang: 'zh-CN',
        dir: 'ltr'
      }
    })
  ]
});
