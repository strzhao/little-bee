'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface CacheInfo {
  name: string;
  size: number;
  entries: number;
}

export function PWACacheManager() {
  const [caches, setCaches] = useState<CacheInfo[]>([]);
  const [totalSize, setTotalSize] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    loadCacheInfo();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadCacheInfo = async () => {
    if (!('caches' in window)) {
      setIsLoading(false);
      return;
    }

    try {
      const cacheNames = await window.caches.keys();
      const cacheInfos: CacheInfo[] = [];
      let total = 0;

      for (const cacheName of cacheNames) {
        const cache = await window.caches.open(cacheName);
        const requests = await cache.keys();
        let cacheSize = 0;

        for (const request of requests) {
          try {
            const response = await cache.match(request);
            if (response) {
              const blob = await response.blob();
              cacheSize += blob.size;
            }
          } catch (error) {
            console.warn('Failed to get cache entry size:', error);
          }
        }

        cacheInfos.push({
          name: cacheName,
          size: cacheSize,
          entries: requests.length,
        });
        total += cacheSize;
      }

      setCaches(cacheInfos);
      setTotalSize(total);
    } catch (error) {
      console.error('Failed to load cache info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = async (cacheName: string) => {
    try {
      await window.caches.delete(cacheName);
      await loadCacheInfo();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const clearAllCaches = async () => {
    try {
      const cacheNames = await window.caches.keys();
      await Promise.all(cacheNames.map(name => window.caches.delete(name)));
      await loadCacheInfo();
    } catch (error) {
      console.error('Failed to clear all caches:', error);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStorageUsagePercentage = () => {
    // 假设移动设备存储限制为50MB
    const maxStorage = 50 * 1024 * 1024; // 50MB
    return Math.min((totalSize / maxStorage) * 100, 100);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">加载缓存信息中...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          🐝 小蜜蜂缓存管理
          <span className={`text-xs px-2 py-1 rounded-full ${
            isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isOnline ? '在线' : '离线'}
          </span>
        </h3>
        <Button 
          onClick={loadCacheInfo}
          variant="outline"
          size="sm"
        >
          刷新
        </Button>
      </div>

      {/* 存储使用情况 */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>存储使用情况</span>
          <span>{formatSize(totalSize)}</span>
        </div>
        <Progress value={getStorageUsagePercentage()} className="h-2" />
        <p className="text-xs text-gray-500">
          已使用 {getStorageUsagePercentage().toFixed(1)}% 的推荐存储空间
        </p>
      </div>

      {/* 缓存列表 */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-gray-700">缓存详情</h4>
        {caches.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            暂无缓存数据
          </p>
        ) : (
          caches.map((cache) => (
            <div key={cache.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-sm">{cache.name}</p>
                <p className="text-xs text-gray-500">
                  {cache.entries} 个文件 • {formatSize(cache.size)}
                </p>
              </div>
              <Button
                onClick={() => clearCache(cache.name)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                清除
              </Button>
            </div>
          ))
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2 pt-4 border-t">
        <Button
          onClick={clearAllCaches}
          variant="outline"
          className="flex-1 text-red-600 hover:text-red-700"
          disabled={caches.length === 0}
        >
          清除所有缓存
        </Button>
        <Button
          onClick={() => window.location.reload()}
          className="flex-1 bg-yellow-500 hover:bg-yellow-600"
        >
          重新加载应用
        </Button>
      </div>

      {/* 缓存说明 */}
      <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
        <p>💡 <strong>缓存说明：</strong></p>
        <ul className="space-y-1 ml-4">
          <li>• <strong>local-fonts</strong>: 汉字字体文件（甲骨文、金文等）</li>
          <li>• <strong>static-images</strong>: 应用图标和静态图片</li>
          <li>• <strong>hanzi-data</strong>: 汉字学习数据</li>
          <li>• <strong>lottie-animations</strong>: 动画效果文件</li>
          <li>• <strong>audio-files</strong>: 语音朗读文件</li>
        </ul>
      </div>
    </Card>
  );
}