'use client';

import { useEffect } from 'react';
import { useBackgroundPreloader } from '@/hooks/use-resource-preloader';

/**
 * 后台预加载提供者组件
 * 在应用启动时自动开始预加载汉字资源
 */
export function BackgroundPreloaderProvider({ children }: { children: React.ReactNode }) {
  const backgroundPreloader = useBackgroundPreloader();

  useEffect(() => {
    // 检查是否启用了后台预加载
    const isEnabled = localStorage.getItem('background-preload-enabled') === 'true';
    
    if (isEnabled && !backgroundPreloader.isActive) {
      // 延迟启动，避免影响初始页面加载
      const timer = setTimeout(() => {
        backgroundPreloader.start();
      }, 3000); // 3秒后开始预加载
      
      return () => clearTimeout(timer);
    }
  }, [backgroundPreloader]);

  return <>{children}</>;
}

/**
 * 智能预加载提供者组件
 * 根据用户当前学习的汉字智能预加载相关资源
 */
export function SmartPreloaderProvider({ children }: { children: React.ReactNode }) {
  // 这里可以添加智能预加载逻辑
  // 比如根据用户的学习进度、当前页面等信息来预加载相关资源
  
  return <>{children}</>;
}