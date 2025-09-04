'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && !window.location.hostname.includes('localhost')) {
      registerServiceWorker();
    } else {
      console.log('🚫 开发环境或不支持 Service Worker');
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      console.log('🔄 开始注册 Service Worker...');
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('✅ Service Worker 注册成功:', registration.scope);
      
      // 处理不同的 Service Worker 状态
      if (registration.installing) {
        console.log('📦 Service Worker 正在安装...');
        trackServiceWorker(registration.installing, 'installing');
      } else if (registration.waiting) {
        console.log('⏳ Service Worker 等待激活...');
        trackServiceWorker(registration.waiting, 'waiting');
        // 立即激活等待中的 Service Worker
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      } else if (registration.active) {
        console.log('🟢 Service Worker 已激活');
        trackServiceWorker(registration.active, 'active');
      }
      
      // 监听注册更新
      registration.addEventListener('updatefound', () => {
        console.log('🔄 发现 Service Worker 更新');
        const newWorker = registration.installing;
        if (newWorker) {
          trackServiceWorker(newWorker, 'updating');
        }
      });
      
      // 监听控制器变化
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 Service Worker 控制器已更新');
        // 可选：重新加载页面以使用新的 Service Worker
        // window.location.reload();
      });
      
    } catch (error) {
      console.error('❌ Service Worker 注册失败:', error);
    }
  };
  
  const trackServiceWorker = (worker: ServiceWorker, context: string) => {
    console.log(`📊 [${context}] Service Worker 状态:`, worker.state);
    
    worker.addEventListener('statechange', () => {
      console.log(`📊 [${context}] 状态变化:`, worker.state);
      
      if (worker.state === 'installed') {
        console.log('✅ Service Worker 安装完成');
        if (navigator.serviceWorker.controller) {
          console.log('🔄 新版本可用，等待激活');
        } else {
          console.log('🎉 首次安装完成');
        }
      } else if (worker.state === 'activated') {
        console.log('🎉 Service Worker 已激活并可用');
      } else if (worker.state === 'redundant') {
        console.warn('⚠️ Service Worker 变为冗余状态');
      }
    });
  };

  return null;
}