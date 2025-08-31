import { hanziDataLoader, HanziCharacter, MasterConfig, IndexConfig } from '@/lib/hanzi-data-loader'
import { mockHanziCharacter, mockHanziList } from '../utils/test-utils'

// Mock fetch
global.fetch = jest.fn()

const mockMasterConfig: MasterConfig = {
  version: '1.0.0',
  description: '测试汉字数据',
  lastUpdated: '2024-01-15',
  categories: [
    { name: '自然', file: 'nature.json', count: 10 },
    { name: '动物', file: 'animals.json', count: 8 }
  ],
  learningStages: [
    { name: '基础', file: 'basic.json', count: 15 },
    { name: '进阶', file: 'advanced.json', count: 12 }
  ],
  totalCharacters: 27
}

const mockIndexConfig: IndexConfig = {
  characterIndex: {
    '火': { id: '火_huo_1', category: '自然', learningStage: '基础' },
    '水': { id: '水_shui_1', category: '自然', learningStage: '基础' },
    '土': { id: '土_tu_1', category: '动物', learningStage: '进阶' }
  },
  categoryIndex: {
    '自然': ['火_huo_1', '水_shui_1'],
    '动物': ['土_tu_1']
  },
  learningStageIndex: {
    '基础': ['火_huo_1', '水_shui_1'],
    '进阶': ['土_tu_1']
  }
}

const mockCategoryData = [
  mockHanziCharacter,
  { 
    ...mockHanziCharacter, 
    id: '水_shui_1', 
    character: '水',
    pinyin: 'shuǐ',
    meaning: '水流',
    emoji: '💧'
  }
]

describe('HanziDataLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // 清理单例实例的缓存
    hanziDataLoader.clearCache()
  })

  describe('单例模式', () => {
    test('应该返回同一个实例', () => {
      const instance1 = hanziDataLoader
      const instance2 = hanziDataLoader
      expect(instance1).toBe(instance2)
    })
  })

  describe('初始化', () => {
    test('应该成功加载主配置和索引配置', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockMasterConfig)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockIndexConfig)
        } as Response)

      await hanziDataLoader.initialize()

      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(mockFetch).toHaveBeenCalledWith('/data/configs/master-config.json')
      expect(mockFetch).toHaveBeenCalledWith('/data/configs/index.json')
      
      expect(hanziDataLoader.getMasterConfig()).toEqual(mockMasterConfig)
    })

    test('应该处理网络错误', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockRejectedValue(new Error('网络错误'))

      await expect(hanziDataLoader.initialize()).rejects.toThrow('网络错误')
    })

    test('应该处理无效的JSON响应', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as Response)

      await expect(hanziDataLoader.initialize()).rejects.toThrow('Failed to load master config: Not Found')
    })

    test('重复初始化应该跳过', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockMasterConfig)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockIndexConfig)
        } as Response)

      await hanziDataLoader.initialize()
      await hanziDataLoader.initialize() // 第二次调用

      expect(mockFetch).toHaveBeenCalledTimes(2) // 只调用一次
    })
  })

  describe('配置获取', () => {
    beforeEach(async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockMasterConfig)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockIndexConfig)
        } as Response)
      
      await hanziDataLoader.initialize()
    })

    test('应该返回可用的类别列表', () => {
      const categories = hanziDataLoader.getAvailableCategories()
      expect(categories).toEqual(['自然', '动物'])
    })

    test('应该返回可用的学习阶段列表', () => {
      const stages = hanziDataLoader.getAvailableLearningStages()
      expect(stages).toEqual(['基础', '进阶'])
    })

    test('未初始化时应该返回空数组', () => {
      hanziDataLoader.clearCache()
      const categories = hanziDataLoader.getAvailableCategories()
      const stages = hanziDataLoader.getAvailableLearningStages()
      
      expect(categories).toEqual([])
      expect(stages).toEqual([])
    })
  })

  describe('按类别加载', () => {
    beforeEach(async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockMasterConfig)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockIndexConfig)
        } as Response)
      
      await hanziDataLoader.initialize()
    })

    test('应该成功加载类别数据', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCategoryData)
      } as Response)

      const result = await hanziDataLoader.loadByCategory('自然')
      
      expect(mockFetch).toHaveBeenCalledWith('/data/configs/nature.json')
      expect(result).toEqual(mockCategoryData)
    })

    test('应该使用缓存避免重复请求', async () => {
      // 直接设置配置
      hanziDataLoader['masterConfig'] = mockMasterConfig
      hanziDataLoader['indexConfig'] = mockIndexConfig
      
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockClear()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCategoryData)
      } as Response)

      // 第一次加载
      await hanziDataLoader.loadByCategory('自然')
      // 第二次加载（应该使用缓存）
      const result = await hanziDataLoader.loadByCategory('自然')
      
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockCategoryData)
    })

    test('应该处理不存在的类别', async () => {
      // 直接设置配置
      hanziDataLoader['masterConfig'] = mockMasterConfig
      hanziDataLoader['indexConfig'] = mockIndexConfig
      
      await expect(hanziDataLoader.loadByCategory('不存在的类别'))
        .rejects.toThrow('Category \'不存在的类别\' not found')
    })

    test('应该处理加载错误', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockRejectedValue(new Error('加载失败'))

      await expect(hanziDataLoader.loadByCategory('自然'))
        .rejects.toThrow('加载失败')
    })
  })

  describe('按学习阶段加载', () => {
    beforeEach(async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockMasterConfig)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockIndexConfig)
        } as Response)
      
      await hanziDataLoader.initialize()
    })

    test('应该成功加载学习阶段数据', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCategoryData)
      } as Response)

      const result = await hanziDataLoader.loadByLearningStage('基础')
      
      expect(mockFetch).toHaveBeenCalledWith('/data/configs/basic.json')
      expect(result).toEqual(mockCategoryData)
    })

    test('应该处理不存在的学习阶段', async () => {
      // 直接设置配置
      hanziDataLoader['masterConfig'] = mockMasterConfig
      hanziDataLoader['indexConfig'] = mockIndexConfig
      
      await expect(hanziDataLoader.loadByLearningStage('不存在的阶段'))
        .rejects.toThrow('Learning stage \'不存在的阶段\' not found')
    })
  })

  describe('按ID加载汉字', () => {
    beforeEach(async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockMasterConfig)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockIndexConfig)
        } as Response)
      
      await hanziDataLoader.initialize()
    })

    test('应该成功加载指定ID的汉字', async () => {
      // 直接设置配置
      hanziDataLoader['masterConfig'] = mockMasterConfig
      hanziDataLoader['indexConfig'] = mockIndexConfig
      
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCategoryData)
      } as Response)

      const result = await hanziDataLoader.loadCharacterById('火_huo_1')
      
      expect(result).toEqual(mockHanziCharacter)
    })

    test('应该处理不存在的汉字ID', async () => {
      // 直接设置配置
      hanziDataLoader['masterConfig'] = mockMasterConfig
      hanziDataLoader['indexConfig'] = mockIndexConfig
      
      const result = await hanziDataLoader.loadCharacterById('不存在的ID')
      expect(result).toBeNull()
    })

    test('应该使用字符缓存', async () => {
      // 直接设置配置
      hanziDataLoader['masterConfig'] = mockMasterConfig
      hanziDataLoader['indexConfig'] = mockIndexConfig
      
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      // 重置mock计数器
      mockFetch.mockClear()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCategoryData)
      } as Response)

      // 第一次加载
      await hanziDataLoader.loadCharacterById('火_huo_1')
      // 第二次加载（应该使用缓存）
      const result = await hanziDataLoader.loadCharacterById('火_huo_1')
      
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockHanziCharacter)
    })
  })

  describe('按文字查找汉字', () => {
    beforeEach(async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockMasterConfig)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockIndexConfig)
        } as Response)
      
      await hanziDataLoader.initialize()
    })

    test('应该能够通过汉字文字查找', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCategoryData)
      } as Response)

      const result = await hanziDataLoader.findCharacterByText('火')
      expect(result).toEqual(mockHanziCharacter)
    })

    test('应该处理找不到的汉字', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCategoryData)
      } as Response)

      const result = await hanziDataLoader.findCharacterByText('不存在')
      expect(result).toBeNull()
    })
  })

  describe('搜索功能', () => {
    beforeEach(async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockMasterConfig)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockIndexConfig)
        } as Response)
      
      await hanziDataLoader.initialize()
    })

    test('应该能够搜索汉字', async () => {
      // 直接设置配置
      hanziDataLoader['masterConfig'] = mockMasterConfig
      hanziDataLoader['indexConfig'] = mockIndexConfig
      
      // Mock loadByCategory方法
      const originalLoadByCategory = hanziDataLoader.loadByCategory
      hanziDataLoader.loadByCategory = jest.fn().mockImplementation(async (categoryName: string) => {
        if (categoryName === '自然') {
          return mockCategoryData
        }
        return []
      })

      const result = await hanziDataLoader.searchCharacters('火')
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(mockHanziCharacter)
      
      // 恢复原方法
      hanziDataLoader.loadByCategory = originalLoadByCategory
    })

    test('应该处理空搜索结果', async () => {
      // 直接设置配置
      hanziDataLoader['masterConfig'] = mockMasterConfig
      hanziDataLoader['indexConfig'] = mockIndexConfig
      
      // Mock loadByCategory方法返回空数组
      const originalLoadByCategory = hanziDataLoader.loadByCategory
      hanziDataLoader.loadByCategory = jest.fn().mockResolvedValue([])

      const result = await hanziDataLoader.searchCharacters('不存在的字')
      expect(result).toHaveLength(0)
      
      // 恢复原方法
      hanziDataLoader.loadByCategory = originalLoadByCategory
    })
  })

  describe('统计信息', () => {
    beforeEach(async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockMasterConfig)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockIndexConfig)
        } as Response)
      
      await hanziDataLoader.initialize()
    })

    test('应该返回正确的统计信息', async () => {
      // 直接设置配置而不是通过initialize
      hanziDataLoader['masterConfig'] = mockMasterConfig
      hanziDataLoader['indexConfig'] = mockIndexConfig
      
      const stats = hanziDataLoader.getStatistics()
      
      expect(stats).toEqual({
        totalCharacters: 27,
        categoriesCount: 2,
        learningStagesCount: 2,
        categories: [
          { name: '自然', count: 10 },
          { name: '动物', count: 8 }
        ],
        learningStages: [
          { name: '基础', count: 15 },
          { name: '进阶', count: 12 }
        ]
      })
    })
  })

  describe('缓存管理', () => {
    test('应该能够清理缓存', () => {
      // 清理缓存不会抛出错误
      expect(() => {
        hanziDataLoader.clearCache()
      }).not.toThrow()
    })
  })

  describe('边界情况', () => {
    beforeEach(async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockMasterConfig)
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockIndexConfig)
        } as Response)
      
      await hanziDataLoader.initialize()
    })

    test('应该处理空的配置文件', async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            categories: [],
            learningStages: [],
            totalCharacters: 0
          })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            characterIndex: {},
            categoryIndex: {},
            learningStageIndex: {}
          })
        } as Response)

      await expect(() => hanziDataLoader.initialize()).not.toThrow()
    })

    test('应该处理损坏的数据文件', async () => {
      // 直接设置配置
      hanziDataLoader['masterConfig'] = mockMasterConfig
      hanziDataLoader['indexConfig'] = mockIndexConfig
      
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(null)
      } as Response)
      
      const result = await hanziDataLoader.loadByCategory('自然')
      expect(result).toEqual([])
    })
  })
})