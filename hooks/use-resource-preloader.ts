/**
 * React Hook for Resource Preloader
 * 提供简洁的API来管理汉字资源的预加载
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { allHanziDataAtom, currentHanziAtom } from '@/lib/atoms/hanzi-atoms';
import { resourcePreloader, type PreloadProgress, type PreloadOptions } from '@/lib/resource-preloader';
import { HanziCharacter } from '@/lib/hanzi-data-loader';

interface UseResourcePreloaderOptions {
  enableSmartPreload?: boolean;
  enableBackgroundPreload?: boolean;
  onProgress?: (progress: PreloadProgress) => void;
  onComplete?: () => void;
  onError?: (error: Error, resource: string) => void;
}

interface PreloaderState {
  isPreloading: boolean;
  progress: PreloadProgress | null;
  stats: {
    loaded: number;
    failed: number;
  };
}

export function useResourcePreloader(options: UseResourcePreloaderOptions = {}) {
  const {
    enableSmartPreload = true,
    enableBackgroundPreload = true,
    onProgress,
    onComplete,
    onError
  } = options;

  const allHanzi = useAtomValue(allHanziDataAtom);
  const currentHanzi = useAtomValue(currentHanziAtom);
  
  const [state, setState] = useState<PreloaderState>({
    isPreloading: false,
    progress: null,
    stats: { loaded: 0, failed: 0 }
  });

  const backgroundPreloadStarted = useRef(false);
  const smartPreloadCache = useRef(new Set<string>());

  // 更新状态的辅助函数
  const updateState = useCallback((updates: Partial<PreloaderState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // 预加载单个汉字
  const preloadCharacter = useCallback(async (
    character: HanziCharacter,
    preloadOptions: Partial<PreloadOptions> = {}
  ) => {
    updateState({ isPreloading: true });
    
    try {
      await resourcePreloader.preloadCharacterResources(character, {
        ...preloadOptions,
        onProgress: (progress) => {
          updateState({ progress });
          onProgress?.(progress);
        },
        onComplete: () => {
          updateState({ 
            isPreloading: false, 
            stats: resourcePreloader.getStats() 
          });
          onComplete?.();
        },
        onError
      });
    } catch (error) {
      updateState({ isPreloading: false });
      onError?.(error as Error, character.id);
    }
  }, [onProgress, onComplete, onError, updateState]);

  // 批量预加载
  const preloadMultiple = useCallback(async (
    characters: HanziCharacter[],
    preloadOptions: Partial<PreloadOptions> = {}
  ) => {
    if (characters.length === 0) return;
    
    updateState({ isPreloading: true });
    
    try {
      await resourcePreloader.preloadMultipleCharacters(characters, {
        priority: 'medium',
        maxConcurrent: 2,
        ...preloadOptions,
        onProgress: (progress) => {
          updateState({ progress });
          onProgress?.(progress);
        },
        onComplete: () => {
          updateState({ 
            isPreloading: false, 
            stats: resourcePreloader.getStats() 
          });
          onComplete?.();
        },
        onError
      });
    } catch (error) {
      updateState({ isPreloading: false });
      onError?.(error as Error, 'batch-preload');
    }
  }, [onProgress, onComplete, onError, updateState]);

  // 智能预加载：基于当前汉字预测用户可能需要的资源
  const triggerSmartPreload = useCallback(async (character: HanziCharacter) => {
    if (!enableSmartPreload || !allHanzi.length) return;
    
    const cacheKey = `${character.id}-${character.category}-${character.learningStage}`;
    if (smartPreloadCache.current.has(cacheKey)) return;
    
    smartPreloadCache.current.add(cacheKey);
    
    try {
      await resourcePreloader.smartPreload(character, allHanzi, {
        priority: 'medium',
        maxConcurrent: 2,
        retryAttempts: 1,
        onProgress: (progress) => {
          // 智能预加载的进度更新比较轻量，不影响UI
          if (progress.percentage % 25 === 0) {
            updateState({ stats: resourcePreloader.getStats() });
          }
        },
        onError: (error, resource) => {
          console.warn(`智能预加载失败: ${resource}`, error);
        }
      });
    } catch (error) {
      console.warn('智能预加载出错:', error);
    }
  }, [enableSmartPreload, allHanzi, updateState]);

  // 后台预加载所有资源
  const startBackgroundPreload = useCallback(async () => {
    if (!enableBackgroundPreload || !allHanzi.length || backgroundPreloadStarted.current) {
      return;
    }
    
    backgroundPreloadStarted.current = true;
    
    // 延迟启动，确保不影响初始页面加载
    setTimeout(async () => {
      try {
        await resourcePreloader.backgroundPreloadAll(allHanzi, {
          priority: 'low',
          maxConcurrent: 1,
          retryAttempts: 0,
          onProgress: (progress) => {
            // 后台预加载只在重要节点更新状态
            if (progress.percentage % 10 === 0) {
              updateState({ stats: resourcePreloader.getStats() });
            }
          },
          onError: (error, resource) => {
            // 后台预加载失败不影响用户体验，只记录日志
            console.debug(`后台预加载失败: ${resource}`, error);
          }
        });
      } catch (error) {
        console.debug('后台预加载出错:', error);
      }
    }, 3000); // 3秒后开始后台预加载
  }, [enableBackgroundPreload, allHanzi, updateState]);

  // 当前汉字变化时触发智能预加载
  useEffect(() => {
    if (currentHanzi && enableSmartPreload) {
      triggerSmartPreload(currentHanzi);
    }
  }, [currentHanzi, triggerSmartPreload, enableSmartPreload]);

  // 汉字数据加载完成后启动后台预加载
  useEffect(() => {
    if (allHanzi.length > 0 && enableBackgroundPreload) {
      startBackgroundPreload();
    }
  }, [allHanzi.length, enableBackgroundPreload, startBackgroundPreload]);

  // 定期更新统计信息
  useEffect(() => {
    const interval = setInterval(() => {
      updateState({ stats: resourcePreloader.getStats() });
    }, 5000);

    return () => clearInterval(interval);
  }, [updateState]);

  // 清除缓存
  const clearCache = useCallback(() => {
    resourcePreloader.clearCache();
    smartPreloadCache.current.clear();
    backgroundPreloadStarted.current = false;
    updateState({ 
      stats: { loaded: 0, failed: 0 },
      progress: null 
    });
  }, [updateState]);

  // 手动触发预加载
  const manualPreload = useCallback(async (characters: HanziCharacter[]) => {
    await preloadMultiple(characters, {
      priority: 'high',
      maxConcurrent: 3,
      retryAttempts: 2
    });
  }, [preloadMultiple]);

  return {
    // 状态
    isPreloading: state.isPreloading,
    progress: state.progress,
    stats: state.stats,
    
    // 方法
    preloadCharacter,
    preloadMultiple,
    manualPreload,
    clearCache,
    
    // 工具方法
    getPreloadedCount: () => state.stats.loaded,
    getFailedCount: () => state.stats.failed,
    isResourcePreloaded: (url: string) => resourcePreloader.getStats().loaded > 0
  };
}

/**
 * 轻量级Hook，只提供预加载统计信息
 */
export function usePreloadStats() {
  const [stats, setStats] = useState({ loaded: 0, failed: 0, isPreloading: false });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(resourcePreloader.getStats());
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  return stats;
}

/**
 * 专门用于后台预加载的Hook
 */
export function useBackgroundPreloader() {
  const allHanzi = useAtomValue(allHanziDataAtom);
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const startBackgroundPreload = useCallback(async () => {
    if (isActive || !allHanzi.length) return;
    
    setIsActive(true);
    
    try {
      await resourcePreloader.backgroundPreloadAll(allHanzi, {
        priority: 'low',
        maxConcurrent: 1,
        retryAttempts: 0,
        onProgress: (prog) => setProgress(prog.percentage)
      });
    } finally {
      setIsActive(false);
    }
  }, [allHanzi, isActive]);
  
  return {
    isActive,
    progress,
    start: startBackgroundPreload
  };
}