// 自定义 Service Worker 用于预缓存关键资源

// 预缓存的关键资源列表
const PRECACHE_RESOURCES = [
  // 字体文件
  '/fonts/HanziJiaguwen.ttf',
  '/fonts/HanziJinwen.ttf', 
  '/fonts/HanziKaishu.ttf',
  '/fonts/HanziXiaozhuan.otf',
  
  // 核心数据文件
  '/data/hanzi-data.json',
  '/data/configs/index.json',
  '/data/configs/master-config.json',
  '/data/configs/personalized-explanations.json',
  
  // 核心图标
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/favicon.ico',
  
  // Lottie 动画
  '/assets/lottie/celebration-confetti.json',
  
  // 核心页面
  '/',
  '/offline',
];

const CACHE_NAME = 'little-bee-precache-v1';
const RUNTIME_CACHE = 'little-bee-runtime-v1';

// 安装事件 - 预缓存关键资源
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Precaching critical resources');
        return cache.addAll(PRECACHE_RESOURCES);
      })
      .then(() => {
        console.log('Service Worker: Precaching completed');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Precaching failed', error);
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 只处理同源请求
  if (url.origin !== location.origin) {
    return;
  }
  
  // 字体文件 - 缓存优先
  if (url.pathname.match(/\.(ttf|otf|woff|woff2)$/)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // 图片文件 - 缓存优先
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico)$/)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // JSON 数据文件 - 网络优先，失败时使用缓存
  if (url.pathname.match(/\.json$/)) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // 音频文件 - 缓存优先
  if (url.pathname.match(/\.(mp3|wav|ogg)$/)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // HTML 页面 - 网络优先
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }
});

// 缓存优先策略
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return new Response('Resource not available offline', { status: 503 });
  }
}

// 网络优先策略
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 如果是页面请求且缓存中没有，返回离线页面
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline');
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    return new Response('Resource not available offline', { status: 503 });
  }
}

// 消息处理
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    getCacheSize().then((size) => {
      event.ports[0].postMessage({ cacheSize: size });
    });
  }
});

// 获取缓存大小
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }
  
  return totalSize;
}