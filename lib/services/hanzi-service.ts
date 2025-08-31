import { HanziCharacter } from '../atoms/hanzi-atoms'

// 统一的汉字数据服务
export class HanziService {
  private static instance: HanziService
  private cache = new Map<string, HanziCharacter>()
  private categoryCache = new Map<string, HanziCharacter[]>()
  private indexConfig: any = null
  private masterConfig: any = null

  static getInstance(): HanziService {
    if (!HanziService.instance) {
      HanziService.instance = new HanziService()
    }
    return HanziService.instance
  }

  // 智能ID匹配：支持多种ID格式
  private normalizeId(id: string): string[] {
    const possibleIds: string[] = []
    
    // 原始ID
    possibleIds.push(id)
    
    // URL解码
    try {
      const decoded = decodeURIComponent(id)
      if (decoded !== id) {
        possibleIds.push(decoded)
      }
    } catch (e) {
      // 忽略解码错误
    }
    
    // 提取汉字字符
    const characterMatch = id.match(/^([\u4e00-\u9fff])/)
    if (characterMatch) {
      const character = characterMatch[1]
      possibleIds.push(character)
      
      // 尝试不同的ID格式
      const pinyinMatch = id.match(/([\u4e00-\u9fff])_([a-zA-Züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+)/)
      if (pinyinMatch) {
        const [, char, pinyin] = pinyinMatch
        possibleIds.push(`${char}_${pinyin}`)
        possibleIds.push(`${char}_${pinyin}_1`)
        possibleIds.push(`${char}_${pinyin}_2`)
      }
    }
    
    return [...new Set(possibleIds)] // 去重
  }

  // 从缓存或数据源查找汉字
  private async findCharacterByIds(possibleIds: string[]): Promise<HanziCharacter | null> {
    // 先从缓存查找
    for (const id of possibleIds) {
      if (this.cache.has(id)) {
        return this.cache.get(id)!
      }
    }

    // 从所有类别文件中查找
    const categories = ['天空与气象', '水与地理', '植物世界', '动物王国', '基础汉字']
    
    for (const category of categories) {
      try {
        const categoryData = await this.loadCategoryData(category)
        
        for (const character of categoryData) {
          // 检查是否匹配任何可能的ID
          if (possibleIds.includes(character.id)) {
            // 缓存所有可能的ID映射
            possibleIds.forEach(id => {
              this.cache.set(id, character)
            })
            return character
          }
        }
      } catch (error) {
        console.warn(`Failed to load category ${category}:`, error)
      }
    }

    return null
  }

  // 加载类别数据
  private async loadCategoryData(category: string): Promise<HanziCharacter[]> {
    if (this.categoryCache.has(category)) {
      return this.categoryCache.get(category)!
    }

    try {
      const response = await fetch(`/data/configs/categories/${category}.json`)
      if (!response.ok) {
        throw new Error(`Failed to load ${category}: ${response.status}`)
      }
      
      const data = await response.json()
      this.categoryCache.set(category, data)
      
      // 同时缓存每个汉字
      data.forEach((character: HanziCharacter) => {
        this.cache.set(character.id, character)
      })
      
      return data
    } catch (error) {
      console.error(`Error loading category ${category}:`, error)
      return []
    }
  }

  // 公共API：根据ID获取汉字（智能匹配）
  async getCharacterById(id: string): Promise<HanziCharacter | null> {
    const possibleIds = this.normalizeId(id)
    console.log(`Searching for character with possible IDs:`, possibleIds)
    
    const character = await this.findCharacterByIds(possibleIds)
    
    if (character) {
      console.log(`Found character:`, character.character, character.id)
    } else {
      console.warn(`Character not found for any of these IDs:`, possibleIds)
    }
    
    return character
  }

  // 获取所有汉字数据
  async getAllCharacters(): Promise<HanziCharacter[]> {
    const allCharacters: HanziCharacter[] = []
    const categories = ['天空与气象', '水与地理', '植物世界', '动物王国']
    
    for (const category of categories) {
      try {
        const categoryData = await this.loadCategoryData(category)
        allCharacters.push(...categoryData)
      } catch (error) {
        console.error(`Failed to load category ${category}:`, error)
      }
    }
    
    return allCharacters
  }

  // 根据类别获取汉字
  async getCharactersByCategory(category: string): Promise<HanziCharacter[]> {
    return await this.loadCategoryData(category)
  }

  // 根据学习阶段获取汉字
  async getCharactersByLearningStage(stage: string): Promise<HanziCharacter[]> {
    const allCharacters = await this.getAllCharacters()
    return allCharacters.filter(char => char.learningStage === stage)
  }

  // 清除缓存
  clearCache(): void {
    this.cache.clear()
    this.categoryCache.clear()
    this.indexConfig = null
    this.masterConfig = null
  }

  // 验证数据完整性
  async validateDataIntegrity(): Promise<{
    isValid: boolean
    errors: string[]
    warnings: string[]
  }> {
    const errors: string[] = []
    const warnings: string[] = []
    
    try {
      const allCharacters = await this.getAllCharacters()
      
      // 检查重复ID
      const idSet = new Set<string>()
      const duplicateIds: string[] = []
      
      allCharacters.forEach(char => {
        if (idSet.has(char.id)) {
          duplicateIds.push(char.id)
        } else {
          idSet.add(char.id)
        }
      })
      
      if (duplicateIds.length > 0) {
        errors.push(`Duplicate IDs found: ${duplicateIds.join(', ')}`)
      }
      
      // 检查必需字段
      allCharacters.forEach(char => {
        if (!char.character || !char.pinyin || !char.id) {
          errors.push(`Missing required fields for character: ${char.id || 'unknown'}`)
        }
      })
      
      // 检查资源文件
      for (const char of allCharacters) {
        if (char.assets) {
          const assets = Object.values(char.assets)
          for (const asset of assets) {
            if (typeof asset === 'string' && asset.startsWith('/assets/')) {
              // 这里可以添加资源文件存在性检查
              // 暂时只做格式检查
              if (!asset.match(/\.(mp3|png|json)$/)) {
                warnings.push(`Unusual asset format: ${asset} for character ${char.character}`)
              }
            }
          }
        }
      }
      
    } catch (error) {
      errors.push(`Failed to validate data: ${error}`)
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }
}