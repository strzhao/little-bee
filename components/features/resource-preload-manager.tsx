'use client';

import { useState, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { allHanziDataAtom } from '@/lib/atoms/hanzi-atoms';
import { useResourcePreloader, usePreloadStats } from '@/hooks/use-resource-preloader';
import { HanziCharacter } from '@/lib/hanzi-data-loader';

interface PreloadManagerProps {
  className?: string;
}

export function ResourcePreloadManager({ className }: PreloadManagerProps) {
  const allHanzi = useAtomValue(allHanziDataAtom);
  const stats = usePreloadStats();
  
  const [autoPreloadEnabled, setAutoPreloadEnabled] = useState(true);
  const [smartPreloadEnabled, setSmartPreloadEnabled] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isManualPreloading, setIsManualPreloading] = useState(false);
  
  const {
    isPreloading,
    progress,
    preloadMultiple,
    clearCache,
    manualPreload
  } = useResourcePreloader({
    enableSmartPreload: smartPreloadEnabled,
    enableBackgroundPreload: autoPreloadEnabled,
    onProgress: (prog) => {
      console.log(`预加载进度: ${prog.percentage}% (${prog.loaded}/${prog.total})`);
    },
    onComplete: () => {
      setIsManualPreloading(false);
      console.log('预加载完成');
    },
    onError: (error, resource) => {
      console.warn(`资源预加载失败: ${resource}`, error);
    }
  });

  // 获取所有分类
  const categories = Array.from(new Set(
    allHanzi.map(hanzi => hanzi.category).filter((category): category is string => typeof category === 'string')
  ));

  // 按分类统计汉字数量
  const categoryStats = categories.map(category => ({
    name: category,
    count: allHanzi.filter(hanzi => hanzi.category === category).length
  }));

  // 手动预加载选中分类的汉字
  const handleManualPreload = async () => {
    if (selectedCategories.length === 0) {
      alert('请先选择要预加载的分类');
      return;
    }
    
    setIsManualPreloading(true);
    const charactersToPreload = allHanzi.filter(hanzi => 
      hanzi.category && selectedCategories.includes(hanzi.category)
    );
    
    await manualPreload(charactersToPreload);
  };

  // 预加载所有汉字
  const handlePreloadAll = async () => {
    if (allHanzi.length === 0) return;
    
    setIsManualPreloading(true);
    await manualPreload(allHanzi);
  };

  // 切换分类选择
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // 计算总资源数量（估算）
  const estimatedTotalResources = allHanzi.length * 6; // 每个汉字约6个资源文件
  const preloadPercentage = estimatedTotalResources > 0 
    ? Math.round((stats.loaded / estimatedTotalResources) * 100)
    : 0;

  return (
    <Card className={`p-6 space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          🚀 资源预加载管理
          {(isPreloading || isManualPreloading) && (
            <Badge variant="secondary" className="animate-pulse">
              预加载中...
            </Badge>
          )}
        </h3>
        <div className="flex items-center gap-2">
          <Button 
            onClick={clearCache}
            variant="outline"
            size="sm"
            disabled={isPreloading || isManualPreloading}
          >
            清除缓存
          </Button>
        </div>
      </div>

      {/* 预加载统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.loaded}</div>
          <div className="text-sm text-green-700">已预加载</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          <div className="text-sm text-red-700">加载失败</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{allHanzi.length}</div>
          <div className="text-sm text-blue-700">总汉字数</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{preloadPercentage}%</div>
          <div className="text-sm text-purple-700">预加载进度</div>
        </div>
      </div>

      {/* 整体进度条 */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>整体预加载进度</span>
          <span>{stats.loaded} / {estimatedTotalResources} 资源</span>
        </div>
        <Progress value={preloadPercentage} className="h-2" />
      </div>

      {/* 当前预加载任务进度 */}
      {progress && (isPreloading || isManualPreloading) && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>当前任务进度</span>
            <span>{progress.loaded} / {progress.total} ({progress.percentage}%)</span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
          {progress.failed > 0 && (
            <p className="text-xs text-red-600">
              {progress.failed} 个资源加载失败
            </p>
          )}
        </div>
      )}

      {/* 预加载设置 */}
      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-medium text-sm text-gray-700">预加载设置</h4>
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <label className="text-sm font-medium">智能预加载</label>
            <p className="text-xs text-gray-500">
              根据当前学习的汉字自动预加载相关资源
            </p>
          </div>
          <Switch
            checked={smartPreloadEnabled}
            onCheckedChange={setSmartPreloadEnabled}
            disabled={isPreloading || isManualPreloading}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <label className="text-sm font-medium">后台自动预加载</label>
            <p className="text-xs text-gray-500">
              在后台低优先级预加载所有汉字资源
            </p>
          </div>
          <Switch
            checked={autoPreloadEnabled}
            onCheckedChange={setAutoPreloadEnabled}
            disabled={isPreloading || isManualPreloading}
          />
        </div>
      </div>

      {/* 分类选择预加载 */}
      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-medium text-sm text-gray-700">按分类预加载</h4>
        
        {categoryStats.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              {categoryStats.map(({ name, count }) => (
                <button
                  key={name}
                  onClick={() => toggleCategory(name)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selectedCategories.includes(name)
                      ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  disabled={isPreloading || isManualPreloading}
                >
                  <div className="font-medium text-sm">{name}</div>
                  <div className="text-xs text-gray-500">{count} 个汉字</div>
                </button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleManualPreload}
                disabled={selectedCategories.length === 0 || isPreloading || isManualPreloading}
                className="flex-1"
              >
                预加载选中分类 ({selectedCategories.length})
              </Button>
              <Button
                onClick={handlePreloadAll}
                disabled={isPreloading || isManualPreloading}
                variant="outline"
                className="flex-1"
              >
                预加载全部汉字
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            暂无汉字分类数据
          </p>
        )}
      </div>

      {/* 预加载说明 */}
      <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
        <p>💡 <strong>预加载说明：</strong></p>
        <ul className="space-y-1 ml-4">
          <li>• <strong>智能预加载</strong>：根据当前学习内容预测并预加载相关资源</li>
          <li>• <strong>后台预加载</strong>：在网络空闲时自动预加载所有资源</li>
          <li>• <strong>手动预加载</strong>：立即预加载指定分类的所有资源</li>
          <li>• <strong>网络优化</strong>：自动检测网络状况，慢网络时暂停后台预加载</li>
        </ul>
      </div>
    </Card>
  );
}