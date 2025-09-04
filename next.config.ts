import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === 'development', // 开发环境禁用 PWA
  register: true,
  skipWaiting: false, // 禁用自动跳过等待，避免频繁替换
  // 自定义 Service Worker
  sw: 'sw.js',
  // 预缓存配置
  publicExcludes: ['!robots.txt', '!sitemap.xml'],
  // 运行时缓存策略
  runtimeCaching: [
    // Google Fonts 缓存
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
    // 本地字体文件缓存
    {
      urlPattern: /^\/fonts\/.+\.(ttf|otf|woff|woff2)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'local-fonts',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    // 图片资源缓存
    {
      urlPattern: /^\/(?:assets|icons)\/.+\.(png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-images',
        expiration: {
          maxEntries: 300,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    // 动态图片缓存
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
    // JSON 数据文件缓存
    {
      urlPattern: /^\/data\/.+\.json$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'hanzi-data',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
    // Lottie 动画文件缓存
    {
      urlPattern: /^\/assets\/lottie\/.+\.json$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'lottie-animations',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    // 音频文件缓存
    {
      urlPattern: /^\/assets\/hanzi\/audio\/.+\.(mp3|wav|ogg)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'audio-files',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    // API 请求缓存
    {
      urlPattern: /^\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
        networkTimeoutSeconds: 3,
      },
    },
  ],
})(nextConfig);
