'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [cacheSize, setCacheSize] = useState<string>('');

  useEffect(() => {
    // 检查网络状态
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // 获取缓存大小
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        if (event.data.cacheSize) {
          const sizeInMB = (event.data.cacheSize / (1024 * 1024)).toFixed(2);
          setCacheSize(`${sizeInMB} MB`);
        }
      };
      
      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_CACHE_SIZE' },
        [messageChannel.port2]
      );
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (isOnline) {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        {/* 小蜜蜂图标 */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center text-4xl">
            🐝
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-800">
            小蜜蜂离线模式
          </h1>
          
          <div className="space-y-2 text-gray-600">
            <p>
              {isOnline 
                ? '网络已连接，但请求的页面不可用' 
                : '当前处于离线状态'
              }
            </p>
            
            <p className="text-sm">
              不用担心！小蜜蜂已经为您缓存了重要的学习资源：
            </p>
            
            <ul className="text-sm text-left space-y-1 bg-yellow-50 p-4 rounded-lg">
              <li>✅ 汉字字体库</li>
              <li>✅ 学习数据</li>
              <li>✅ 图片资源</li>
              <li>✅ 动画效果</li>
              {cacheSize && (
                <li className="text-xs text-gray-500 mt-2">
                  缓存大小: {cacheSize}
                </li>
              )}
            </ul>
          </div>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={handleGoHome}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            返回首页
          </Button>
          
          {isOnline && (
            <Button 
              onClick={handleRetry}
              variant="outline"
              className="w-full"
            >
              重新加载
            </Button>
          )}
        </div>
        
        <div className="text-xs text-gray-500 space-y-1">
          <p>网络状态: {isOnline ? '🟢 在线' : '🔴 离线'}</p>
          <p>PWA 版本: 已启用离线功能</p>
        </div>
      </Card>
    </div>
  );
}