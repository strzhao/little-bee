/**
 * 资源预加载器 - 智能后台预加载汉字相关的图片、音频和动画资源
 * 基于 Linus Torvalds 的设计哲学：简洁、高效、无特殊情况
 */

import { HanziCharacter } from './hanzi-data-loader';

interface PreloadProgress {
  total: number;
  loaded: number;
  failed: number;
  percentage: number;
}

interface PreloadOptions {
  priority: 'high' | 'medium' | 'low';
  maxConcurrent: number;
  retryAttempts: number;
  onProgress?: (progress: PreloadProgress) => void;
  onComplete?: () => void;
  onError?: (error: Error, resource: string) => void;
}

class ResourcePreloader {
  private loadedResources = new Set<string>();
  private failedResources = new Set<string>();
  private loadingQueue: Array<{ url: string; priority: number }> = [];
  private activeLoads = new Map<string, Promise<void>>();
  private isPreloading = false;

  /**
   * 预加载单个汉字的所有资源
   */
  async preloadCharacterResources(
    character: HanziCharacter, 
    options: Partial<PreloadOptions> = {}
  ): Promise<void> {
    const defaultOptions: PreloadOptions = {
      priority: 'medium',
      maxConcurrent: 3,
      retryAttempts: 2,
      ...options
    };

    const resources = this.extractResourceUrls(character);
    await this.preloadResources(resources, defaultOptions);
  }

  /**
   * 批量预加载多个汉字的资源
   */
  async preloadMultipleCharacters(
    characters: HanziCharacter[],
    options: Partial<PreloadOptions> = {}
  ): Promise<void> {
    const defaultOptions: PreloadOptions = {
      priority: 'low',
      maxConcurrent: 2,
      retryAttempts: 1,
      ...options
    };

    const allResources: string[] = [];
    characters.forEach(character => {
      allResources.push(...this.extractResourceUrls(character));
    });

    // 去重
    const uniqueResources = [...new Set(allResources)];
    await this.preloadResources(uniqueResources, defaultOptions);
  }

  /**
   * 智能预加载：根据用户当前学习的汉字，预测并预加载相关资源
   */
  async smartPreload(
    currentCharacter: HanziCharacter,
    allCharacters: HanziCharacter[],
    options: Partial<PreloadOptions> = {}
  ): Promise<void> {
    const defaultOptions: PreloadOptions = {
      priority: 'medium',
      maxConcurrent: 2,
      retryAttempts: 1,
      ...options
    };

    // 预加载策略：
    // 1. 同类别的汉字（高优先级）
    // 2. 同学习阶段的汉字（中优先级）
    // 3. 相似主题的汉字（低优先级）
    
    const relatedCharacters = this.findRelatedCharacters(currentCharacter, allCharacters);
    
    // 分批预加载，避免网络拥塞
    const highPriority = relatedCharacters.filter(c => c.category === currentCharacter.category);
    const mediumPriority = relatedCharacters.filter(c => 
      c.learningStage === currentCharacter.learningStage && c.category !== currentCharacter.category
    );
    const lowPriority = relatedCharacters.filter(c => 
      c.theme === currentCharacter.theme && 
      c.category !== currentCharacter.category && 
      c.learningStage !== currentCharacter.learningStage
    );

    // 按优先级顺序预加载
    if (highPriority.length > 0) {
      await this.preloadMultipleCharacters(highPriority.slice(0, 3), { ...defaultOptions, priority: 'high' });
    }
    
    if (mediumPriority.length > 0) {
      await this.preloadMultipleCharacters(mediumPriority.slice(0, 2), { ...defaultOptions, priority: 'medium' });
    }
    
    if (lowPriority.length > 0) {
      await this.preloadMultipleCharacters(lowPriority.slice(0, 1), { ...defaultOptions, priority: 'low' });
    }
  }

  /**
   * 后台预加载所有汉字资源（低优先级，不影响用户体验）
   */
  async backgroundPreloadAll(
    characters: HanziCharacter[],
    options: Partial<PreloadOptions> = {}
  ): Promise<void> {
    const defaultOptions: PreloadOptions = {
      priority: 'low',
      maxConcurrent: 1, // 非常低的并发，避免影响用户操作
      retryAttempts: 0, // 后台加载失败就算了，不重试
      ...options
    };

    // 分批处理，每批5个汉字
    const batchSize = 5;
    for (let i = 0; i < characters.length; i += batchSize) {
      const batch = characters.slice(i, i + batchSize);
      
      // 检查网络状态，如果是慢网络就暂停
      if (this.isSlowNetwork()) {
        console.log('检测到慢网络，暂停后台预加载');
        break;
      }
      
      await this.preloadMultipleCharacters(batch, defaultOptions);
      
      // 批次间暂停，避免占用太多带宽
      await this.delay(1000);
    }
  }

  /**
   * 提取汉字的所有资源URL
   */
  private extractResourceUrls(character: HanziCharacter): string[] {
    const urls: string[] = [];
    
    // 图片资源
    if (character.assets.mainIllustration) {
      urls.push(character.assets.mainIllustration);
    }
    if (character.assets.realObjectImage) {
      urls.push(character.assets.realObjectImage);
    }
    
    // 音频资源
    if (character.assets.pronunciationAudio) {
      urls.push(character.assets.pronunciationAudio);
    }
    
    // 演化阶段的音频
    character.evolutionStages.forEach(stage => {
      if (stage.narrationAudio) {
        urls.push(stage.narrationAudio);
      }
    });
    
    // Lottie 动画
    if (character.assets.lottieAnimation) {
      urls.push(character.assets.lottieAnimation);
    }
    
    return urls.filter(url => url && !this.loadedResources.has(url));
  }

  /**
   * 预加载资源列表
   */
  private async preloadResources(urls: string[], options: PreloadOptions): Promise<void> {
    if (urls.length === 0) return;
    
    this.isPreloading = true;
    const progress: PreloadProgress = {
      total: urls.length,
      loaded: 0,
      failed: 0,
      percentage: 0
    };

    const semaphore = new Semaphore(options.maxConcurrent);
    const promises = urls.map(url => 
      semaphore.acquire().then(async (release) => {
        try {
          await this.preloadSingleResource(url, options.retryAttempts);
          progress.loaded++;
        } catch (error) {
          progress.failed++;
          this.failedResources.add(url);
          options.onError?.(error as Error, url);
        } finally {
          progress.percentage = Math.round(((progress.loaded + progress.failed) / progress.total) * 100);
          options.onProgress?.(progress);
          release();
        }
      })
    );

    await Promise.all(promises);
    this.isPreloading = false;
    options.onComplete?.();
  }

  /**
   * 预加载单个资源
   */
  private async preloadSingleResource(url: string, retryAttempts: number): Promise<void> {
    if (this.loadedResources.has(url)) return;
    
    if (this.activeLoads.has(url)) {
      await this.activeLoads.get(url);
      return;
    }

    const loadPromise = this.loadResource(url, retryAttempts);
    this.activeLoads.set(url, loadPromise);
    
    try {
      await loadPromise;
      this.loadedResources.add(url);
    } finally {
      this.activeLoads.delete(url);
    }
  }

  /**
   * 加载单个资源（支持重试）
   */
  private async loadResource(url: string, retryAttempts: number): Promise<void> {
    const isImage = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(url);
    const isAudio = /\.(mp3|wav|ogg|m4a)$/i.test(url);
    const isJson = /\.json$/i.test(url);

    for (let attempt = 0; attempt <= retryAttempts; attempt++) {
      try {
        if (isImage) {
          await this.preloadImage(url);
        } else if (isAudio) {
          await this.preloadAudio(url);
        } else if (isJson) {
          await this.preloadJson(url);
        } else {
          await this.preloadGeneric(url);
        }
        return; // 成功加载，退出重试循环
      } catch (error) {
        if (attempt === retryAttempts) {
          throw error; // 最后一次尝试失败，抛出错误
        }
        await this.delay(Math.pow(2, attempt) * 1000); // 指数退避
      }
    }
  }

  /**
   * 预加载图片
   */
  private preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  /**
   * 预加载音频
   */
  private preloadAudio(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => resolve();
      audio.onerror = () => reject(new Error(`Failed to load audio: ${url}`));
      audio.preload = 'auto';
      audio.src = url;
    });
  }

  /**
   * 预加载JSON文件
   */
  private async preloadJson(url: string): Promise<void> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${url}`);
    }
    await response.json();
  }

  /**
   * 预加载通用资源
   */
  private async preloadGeneric(url: string): Promise<void> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load resource: ${url}`);
    }
    await response.blob();
  }

  /**
   * 查找相关汉字
   */
  private findRelatedCharacters(current: HanziCharacter, all: HanziCharacter[]): HanziCharacter[] {
    return all.filter(char => 
      char.id !== current.id && (
        char.category === current.category ||
        char.learningStage === current.learningStage ||
        char.theme === current.theme
      )
    );
  }

  /**
   * 检测是否为慢网络
   */
  private isSlowNetwork(): boolean {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g';
    }
    return false;
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取预加载统计信息
   */
  getStats() {
    return {
      loaded: this.loadedResources.size,
      failed: this.failedResources.size,
      isPreloading: this.isPreloading
    };
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.loadedResources.clear();
    this.failedResources.clear();
    this.activeLoads.clear();
  }
}

/**
 * 信号量实现，控制并发数量
 */
class Semaphore {
  private permits: number;
  private waitQueue: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<() => void> {
    return new Promise((resolve) => {
      if (this.permits > 0) {
        this.permits--;
        resolve(() => this.release());
      } else {
        this.waitQueue.push(() => {
          this.permits--;
          resolve(() => this.release());
        });
      }
    });
  }

  private release(): void {
    this.permits++;
    if (this.waitQueue.length > 0) {
      const next = this.waitQueue.shift()!;
      next();
    }
  }
}

// 单例模式
export const resourcePreloader = new ResourcePreloader();
export { ResourcePreloader, type PreloadProgress, type PreloadOptions };