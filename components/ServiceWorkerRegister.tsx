'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    // 简化的 Service Worker 注册逻辑
    if ('serviceWorker' in navigator && !window.location.hostname.includes('localhost')) {
      navigator.serviceWorker.register('/sw.js')
        .then(function(registration) {
          console.log('✅ Service Worker 注册成功');
        })
        .catch(function(error) {
          console.error('❌ Service Worker 注册失败:', error);
        });
    } else {
      console.log('🚫 开发环境或不支持 Service Worker');
    }
  }, []);

  return null;
}