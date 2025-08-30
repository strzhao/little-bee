/**
 * 汉字数据加载器
 * 支持按类别、学习阶段和单个汉字加载数据
 */

export interface HanziCharacter {
  id: string;
  character: string;
  pinyin: string;
  theme: string;
  category?: string;
  learningStage?: string;
  meaning: string;
  emoji?: string;
  assets: {
    pronunciationAudio: string;
    mainIllustration: string;
    lottieAnimation: string;
    realObjectImage: string;
    realObjectCardColor?: string;
  };
  evolutionStages: {
    scriptName: string;
    timestamp: number;
    narrationAudio: string;
    explanation: string;
    scriptText: string;
    fontFamily: string;
    cardColor: string;
  }[];
}

export interface MasterConfig {
  version: string;
  description: string;
  lastUpdated: string;
  categories: {
    name: string;
    file: string;
    count: number;
  }[];
  learningStages: {
    name: string;
    file: string;
    count: number;
  }[];
  totalCharacters: number;
}

export interface IndexConfig {
  characterIndex: Record<string, {
    id: string;
    category: string;
    learningStage: string;
  }>;
  categoryIndex: Record<string, string[]>;
  learningStageIndex: Record<string, string[]>;
}

class HanziDataLoader {
  private static instance: HanziDataLoader;
  private masterConfig: MasterConfig | null = null;
  private indexConfig: IndexConfig | null = null;
  private categoryCache: Map<string, HanziCharacter[]> = new Map();
  private learningStageCache: Map<string, HanziCharacter[]> = new Map();
  private characterCache: Map<string, HanziCharacter> = new Map();
  private baseUrl = '/data/configs';

  private constructor() {}

  public static getInstance(): HanziDataLoader {
    if (!HanziDataLoader.instance) {
      HanziDataLoader.instance = new HanziDataLoader();
    }
    return HanziDataLoader.instance;
  }

  /**
   * 初始化加载器，加载主配置和索引
   */
  public async initialize(): Promise<void> {
    try {
      // 加载主配置
      const masterResponse = await fetch(`${this.baseUrl}/master-config.json`);
      if (!masterResponse.ok) {
        throw new Error(`Failed to load master config: ${masterResponse.statusText}`);
      }
      this.masterConfig = await masterResponse.json();

      // 加载索引配置
      const indexResponse = await fetch(`${this.baseUrl}/index.json`);
      if (!indexResponse.ok) {
        throw new Error(`Failed to load index config: ${indexResponse.statusText}`);
      }
      this.indexConfig = await indexResponse.json();

      console.log('HanziDataLoader initialized successfully');
    } catch (error) {
      console.error('Failed to initialize HanziDataLoader:', error);
      throw error;
    }
  }

  /**
   * 获取主配置信息
   */
  public getMasterConfig(): MasterConfig | null {
    return this.masterConfig;
  }

  /**
   * 获取所有可用的类别
   */
  public getAvailableCategories(): string[] {
    return this.masterConfig?.categories.map(cat => cat.name) || [];
  }

  /**
   * 获取所有可用的学习阶段
   */
  public getAvailableLearningStages(): string[] {
    return this.masterConfig?.learningStages.map(stage => stage.name) || [];
  }

  /**
   * 按类别加载汉字数据
   */
  public async loadByCategory(categoryName: string): Promise<HanziCharacter[]> {
    if (this.categoryCache.has(categoryName)) {
      return this.categoryCache.get(categoryName)!;
    }

    if (!this.masterConfig) {
      throw new Error('HanziDataLoader not initialized');
    }

    const category = this.masterConfig.categories.find(cat => cat.name === categoryName);
    if (!category) {
      throw new Error(`Category '${categoryName}' not found`);
    }

    try {
      const response = await fetch(`${this.baseUrl}/${category.file}`);
      if (!response.ok) {
        throw new Error(`Failed to load category '${categoryName}': ${response.statusText}`);
      }
      
      const data: HanziCharacter[] = await response.json();
      this.categoryCache.set(categoryName, data);
      
      // 同时缓存单个汉字
      data.forEach(hanzi => {
        this.characterCache.set(hanzi.id, hanzi);
      });
      
      return data;
    } catch (error) {
      console.error(`Failed to load category '${categoryName}':`, error);
      throw error;
    }
  }

  /**
   * 按学习阶段加载汉字数据
   */
  public async loadByLearningStage(stageName: string): Promise<HanziCharacter[]> {
    if (this.learningStageCache.has(stageName)) {
      return this.learningStageCache.get(stageName)!;
    }

    if (!this.masterConfig) {
      throw new Error('HanziDataLoader not initialized');
    }

    const stage = this.masterConfig.learningStages.find(s => s.name === stageName);
    if (!stage) {
      throw new Error(`Learning stage '${stageName}' not found`);
    }

    try {
      const response = await fetch(`${this.baseUrl}/${stage.file}`);
      if (!response.ok) {
        throw new Error(`Failed to load learning stage '${stageName}': ${response.statusText}`);
      }
      
      const data: HanziCharacter[] = await response.json();
      this.learningStageCache.set(stageName, data);
      
      // 同时缓存单个汉字
      data.forEach(hanzi => {
        this.characterCache.set(hanzi.id, hanzi);
      });
      
      return data;
    } catch (error) {
      console.error(`Failed to load learning stage '${stageName}':`, error);
      throw error;
    }
  }

  /**
   * 根据汉字ID加载单个汉字数据
   */
  public async loadCharacterById(id: string): Promise<HanziCharacter | null> {
    if (this.characterCache.has(id)) {
      return this.characterCache.get(id)!;
    }

    if (!this.indexConfig) {
      throw new Error('HanziDataLoader not initialized');
    }

    // 从ID中提取汉字字符（去掉拼音和数字后缀）
    const character = id.split('_')[0];
    
    // 从索引中查找汉字所属的类别
    const characterInfo = this.indexConfig.characterIndex[character];
    if (!characterInfo) {
      return null;
    }

    // 加载对应类别的数据
    const categoryData = await this.loadByCategory(characterInfo.category);
    const result = categoryData.find(hanzi => hanzi.id === id) || null;
    
    // 缓存结果
    if (result) {
      this.characterCache.set(id, result);
    }
    
    return result;
  }

  /**
   * 根据汉字字符查找汉字数据
   */
  public async findCharacterByText(character: string): Promise<HanziCharacter | null> {
    if (!this.indexConfig) {
      throw new Error('HanziDataLoader not initialized');
    }

    const characterInfo = this.indexConfig.characterIndex[character];
    if (!characterInfo) {
      return null;
    }

    return this.loadCharacterById(characterInfo.id);
  }

  /**
   * 搜索汉字（支持按拼音、含义等搜索）
   */
  public async searchCharacters(query: string): Promise<HanziCharacter[]> {
    const results: HanziCharacter[] = [];
    const queryLower = query.toLowerCase();

    // 加载所有类别的数据进行搜索
    for (const category of this.getAvailableCategories()) {
      const categoryData = await this.loadByCategory(category);
      const matches = categoryData.filter(hanzi => 
        hanzi.character.includes(query) ||
        hanzi.pinyin.toLowerCase().includes(queryLower) ||
        hanzi.meaning.toLowerCase().includes(queryLower)
      );
      results.push(...matches);
    }

    return results;
  }

  /**
   * 获取统计信息
   */
  public getStatistics() {
    if (!this.masterConfig) {
      return null;
    }

    return {
      totalCharacters: this.masterConfig.totalCharacters,
      categoriesCount: this.masterConfig.categories.length,
      learningStagesCount: this.masterConfig.learningStages.length,
      categories: this.masterConfig.categories.map(cat => ({
        name: cat.name,
        count: cat.count
      })),
      learningStages: this.masterConfig.learningStages.map(stage => ({
        name: stage.name,
        count: stage.count
      }))
    };
  }

  /**
   * 清除缓存
   */
  public clearCache(): void {
    this.categoryCache.clear();
    this.learningStageCache.clear();
    this.characterCache.clear();
  }
}

// 导出单例实例
export const hanziDataLoader = HanziDataLoader.getInstance();

// 兼容性函数：保持与原有代码的兼容性
export async function loadHanziData(): Promise<HanziCharacter[]> {
  await hanziDataLoader.initialize();
  const categories = hanziDataLoader.getAvailableCategories();
  const allData: HanziCharacter[] = [];
  
  for (const category of categories) {
    const categoryData = await hanziDataLoader.loadByCategory(category);
    allData.push(...categoryData);
  }
  
  return allData;
}