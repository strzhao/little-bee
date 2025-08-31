/**
 * 学习进度管理系统
 * 负责管理用户的汉字学习进度，包括本地存储和状态同步
 */

export interface LearnedCharacter {
  id: string;
  character: string;
  count: number;
  lastLearned: string; // ISO timestamp
}

export interface CategoryProgress {
  categoryName: string;
  totalCount: number;
  learnedCount: number;
  learnedCharacters: string[]; // character IDs
}

export class LearningProgressManager {
  private static instance: LearningProgressManager;
  private readonly STORAGE_KEYS = {
    TOTAL_STARS: 'hanzi-challenge-success',
    LEARNED_CHARACTERS: 'hanzi-successful-characters',
    CATEGORY_PROGRESS: 'hanzi-category-progress'
  };

  private constructor() {}

  public static getInstance(): LearningProgressManager {
    if (!LearningProgressManager.instance) {
      LearningProgressManager.instance = new LearningProgressManager();
    }
    return LearningProgressManager.instance;
  }

  /**
   * 获取总星星数
   */
  public getTotalStars(): number {
    if (typeof window === 'undefined') return 0;
    return parseInt(localStorage.getItem(this.STORAGE_KEYS.TOTAL_STARS) || '0', 10);
  }

  /**
   * 获取已学习的汉字列表
   */
  public getLearnedCharacters(): LearnedCharacter[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.LEARNED_CHARACTERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to parse learned characters:', error);
      return [];
    }
  }

  /**
   * 检查汉字是否已学习
   */
  public isCharacterLearned(characterId: string): boolean {
    const learnedCharacters = this.getLearnedCharacters();
    return learnedCharacters.some(char => char.id === characterId);
  }

  /**
   * 获取汉字学习次数
   */
  public getCharacterLearnCount(characterId: string): number {
    const learnedCharacters = this.getLearnedCharacters();
    const character = learnedCharacters.find(char => char.id === characterId);
    return character ? character.count : 0;
  }

  /**
   * 计算类别进度
   */
  public calculateCategoryProgress(categoryName: string, categoryCharacters: { id: string; character: string }[]): CategoryProgress {
    const learnedCharacters = this.getLearnedCharacters();
    const learnedIds = new Set(learnedCharacters.map(char => char.id));
    
    const learnedInCategory = categoryCharacters.filter(char => learnedIds.has(char.id));
    
    return {
      categoryName,
      totalCount: categoryCharacters.length,
      learnedCount: learnedInCategory.length,
      learnedCharacters: learnedInCategory.map(char => char.id)
    };
  }

  /**
   * 获取所有类别的进度
   */
  public async calculateAllCategoryProgress(masterConfig: any): Promise<Record<string, CategoryProgress>> {
    const progress: Record<string, CategoryProgress> = {};
    
    // 为每个类别计算进度
    for (const category of masterConfig.categories) {
      try {
        // 加载类别数据
        const response = await fetch(`/data/configs/${category.file}`);
        if (response.ok) {
          const categoryData = await response.json();
          progress[category.name] = this.calculateCategoryProgress(category.name, categoryData);
        } else {
          // 如果无法加载类别数据，使用默认值
          progress[category.name] = {
            categoryName: category.name,
            totalCount: category.count,
            learnedCount: 0,
            learnedCharacters: []
          };
        }
      } catch (error) {
        console.error(`Failed to calculate progress for category ${category.name}:`, error);
        progress[category.name] = {
          categoryName: category.name,
          totalCount: category.count,
          learnedCount: 0,
          learnedCharacters: []
        };
      }
    }
    
    return progress;
  }

  /**
   * 监听学习进度变化
   */
  public onProgressChange(callback: () => void): () => void {
    if (typeof window === 'undefined') {
      return () => {};
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === this.STORAGE_KEYS.TOTAL_STARS || 
          event.key === this.STORAGE_KEYS.LEARNED_CHARACTERS) {
        callback();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // 返回清理函数
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }

  /**
   * 获取学习统计信息
   */
  public getStatistics(): {
    totalStars: number;
    totalLearnedCharacters: number;
    averageLearnCount: number;
    lastLearned?: string;
  } {
    const learnedCharacters = this.getLearnedCharacters();
    const totalStars = this.getTotalStars();
    const totalLearnedCharacters = learnedCharacters.length;
    
    const totalLearnCount = learnedCharacters.reduce((sum, char) => sum + char.count, 0);
    const averageLearnCount = totalLearnedCharacters > 0 ? totalLearnCount / totalLearnedCharacters : 0;
    
    // 找到最近学习的汉字
    const lastLearned = learnedCharacters.length > 0 
      ? learnedCharacters.reduce((latest, char) => 
          new Date(char.lastLearned || 0) > new Date(latest.lastLearned || 0) ? char : latest
        ).lastLearned
      : undefined;
    
    return {
      totalStars,
      totalLearnedCharacters,
      averageLearnCount,
      lastLearned
    };
  }
}

// 导出单例实例
export const learningProgressManager = LearningProgressManager.getInstance();