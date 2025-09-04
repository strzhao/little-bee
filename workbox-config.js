const { GenerateSW } = require('workbox-webpack-plugin');

module.exports = {
  // 预缓存的静态资源
  globPatterns: [
    '**/*.{js,css,html,png,jpg,jpeg,svg,gif,webp,ico}',
    'fonts/**/*.{ttf,otf,woff,woff2}',
    'data/**/*.json',
    'assets/**/*.{json,png,jpg,jpeg,svg,gif,webp}',
  ],
  
  // 排除不需要缓存的文件
  globIgnores: [
    '**/node_modules/**/*',
    'sw.js',
    'workbox-*.js',
  ],
  
  // 运行时缓存策略
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      urlPattern: /\.(?:ttf|otf|woff|woff2)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'fonts',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    {
      urlPattern: /\.(?:json)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'json-data',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
    {
      urlPattern: /\.(?:mp3|wav|ogg)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'audio',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
  ],
  
  // Service Worker 配置
  swDest: 'public/sw.js',
  clientsClaim: true,
  skipWaiting: true,
};