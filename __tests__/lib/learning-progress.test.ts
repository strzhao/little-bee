import { LearningProgressManager } from '@/lib/learning-progress'

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}

// Mock both window.localStorage and global localStorage
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

// Mock global localStorage for direct access
Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true
})

// 测试单例模式
describe('LearningProgressManager Singleton', () => {
  test('应该返回同一个实例', () => {
    const instance1 = LearningProgressManager.getInstance()
    const instance2 = LearningProgressManager.getInstance()
    
    expect(instance1).toBe(instance2)
  })
})

describe('LearningProgressManager', () => {
  let progressManager: LearningProgressManager
  
  const mockCharacters = [
    { id: 'char-1', category: 'animals' },
    { id: 'char-2', category: 'animals' },
    { id: 'char-3', category: 'nature' }
  ]

  describe('初始化', () => {
    beforeEach(() => {
      // Reset singleton instance
      LearningProgressManager.resetInstance()
      
      // Reset localStorage mock to default behavior
      mockLocalStorage.getItem.mockImplementation(() => null)
      mockLocalStorage.setItem.mockClear()
      mockLocalStorage.removeItem.mockClear()
      mockLocalStorage.clear.mockClear()
      
      progressManager = LearningProgressManager.getInstance()
    })

    test('应该正确初始化', () => {
      expect(progressManager).toBeInstanceOf(LearningProgressManager)
    })

    test('应该从localStorage加载现有进度', () => {
      const existingProgress = [
        { id: 'char-1', character: '猫', count: 3, lastLearned: '2024-01-01' },
        { id: 'char-2', character: '狗', count: 1, lastLearned: '2024-01-02' }
      ]
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'hanzi-successful-characters') {
          return JSON.stringify(existingProgress)
        }
        if (key === 'hanzi-challenge-success') {
          return '4'
        }
        return null
      })
      
      // Reset and create new instance to test loading
      LearningProgressManager.resetInstance()
      const newManager = LearningProgressManager.getInstance()
      const learnCount = newManager.getCharacterLearnCount('char-1')
      
      expect(learnCount).toBe(3)
    })

    test('应该处理损坏的localStorage数据', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json')
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      // Reset and create new instance to test error handling
      LearningProgressManager.resetInstance()
      const newManager = LearningProgressManager.getInstance()
      const learnCount = newManager.getCharacterLearnCount('char-1')
      
      expect(learnCount).toBe(0)
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })
  })

  describe('基本功能', () => {
    beforeEach(() => {
      LearningProgressManager.resetInstance()
      mockLocalStorage.getItem.mockImplementation(() => null)
      mockLocalStorage.setItem.mockClear()
      mockLocalStorage.removeItem.mockClear()
      mockLocalStorage.clear.mockClear()
      progressManager = LearningProgressManager.getInstance()
    })

    test('应该正确获取总星数', () => {
      const totalStars = progressManager.getTotalStars()
      expect(totalStars).toBe(0)
    })
  })

  describe('进度管理', () => {
    beforeEach(() => {
      LearningProgressManager.resetInstance()
      mockLocalStorage.getItem.mockImplementation(() => null)
      mockLocalStorage.setItem.mockClear()
      mockLocalStorage.removeItem.mockClear()
      mockLocalStorage.clear.mockClear()
      progressManager = LearningProgressManager.getInstance()
    })

    test('应该正确获取字符学习次数', () => {
      const learnCount = progressManager.getCharacterLearnCount('char-1')
      expect(learnCount).toBe(0)
    })

    test('应该正确判断字符是否已学习', () => {
      const isLearned = progressManager.isCharacterLearned('char-1')
      expect(isLearned).toBe(false)
    })

    test('应该正确获取已学习字符列表', () => {
      const learnedChars = progressManager.getLearnedCharacters()
      expect(learnedChars).toEqual([])
    })

    test('应该正确计算总星数', () => {
      const totalStars = progressManager.getTotalStars()
      expect(totalStars).toBe(0)
    })
  })

  describe('统计功能', () => {
    beforeEach(() => {
      // 模拟一些学习进度数据
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'hanzi-successful-characters') {
          return JSON.stringify([
            { id: 'char-1', character: '猫', count: 3, lastLearned: '2024-01-01' },
            { id: 'char-2', character: '狗', count: 2, lastLearned: '2024-01-02' },
            { id: 'char-3', character: '树', count: 1, lastLearned: '2024-01-03' }
          ])
        }
        if (key === 'hanzi-challenge-success') {
          return '6'
        }
        return null
      })
      LearningProgressManager.resetInstance()
      progressManager = LearningProgressManager.getInstance()
    })

    test('应该正确计算总星数', () => {
      const totalStars = progressManager.getTotalStars()
      expect(totalStars).toBe(6) // from localStorage 'hanzi-challenge-success'
    })

    test('应该正确获取已学习字符', () => {
      const learnedChars = progressManager.getLearnedCharacters()
      expect(learnedChars).toHaveLength(3)
      expect(learnedChars[0]).toHaveProperty('id', 'char-1')
      expect(learnedChars[0]).toHaveProperty('count', 3)
    })

    test('应该正确判断字符学习状态', () => {
      expect(progressManager.isCharacterLearned('char-1')).toBe(true)
      expect(progressManager.isCharacterLearned('char-4')).toBe(false)
    })

    test('应该正确获取字符学习次数', () => {
      expect(progressManager.getCharacterLearnCount('char-1')).toBe(3)
      expect(progressManager.getCharacterLearnCount('char-2')).toBe(2)
      expect(progressManager.getCharacterLearnCount('char-4')).toBe(0)
    })

    test('应该正确计算分类进度', () => {
       const categoryCharacters = [
         { id: 'char-1', character: '猫' },
         { id: 'char-2', character: '狗' }
       ]
       
       const categoryProgress = progressManager.calculateCategoryProgress('animals', categoryCharacters)
       
       expect(categoryProgress).toEqual({
         categoryName: 'animals',
         totalCount: 2,
         learnedCount: expect.any(Number),
         learnedCharacters: expect.any(Array)
       })
     })

     test('应该正确计算所有分类进度', async () => {
       const mockMasterConfig = {
         categories: [
           { name: 'animals', file: 'animals.json', count: 2 },
           { name: 'nature', file: 'nature.json', count: 1 }
         ]
       }
       
       // Mock fetch
       global.fetch = jest.fn()
         .mockResolvedValueOnce({
           ok: true,
           json: () => Promise.resolve([
             { id: 'char-1', character: '猫' },
             { id: 'char-2', character: '狗' }
           ])
         })
         .mockResolvedValueOnce({
           ok: true,
           json: () => Promise.resolve([
             { id: 'char-3', character: '树' }
           ])
         })
       
       const allCategoryProgress = await progressManager.calculateAllCategoryProgress(mockMasterConfig)
       
       expect(allCategoryProgress).toHaveProperty('animals')
       expect(allCategoryProgress).toHaveProperty('nature')
       expect(allCategoryProgress.animals.totalCount).toBe(2)
       expect(allCategoryProgress.nature.totalCount).toBe(1)
     })
  })

  describe('数据持久化', () => {
    beforeEach(() => {
      LearningProgressManager.resetInstance()
      mockLocalStorage.getItem.mockImplementation(() => null)
      mockLocalStorage.setItem.mockClear()
      mockLocalStorage.removeItem.mockClear()
      mockLocalStorage.clear.mockClear()
      progressManager = LearningProgressManager.getInstance()
    })

    test('应该正确处理localStorage访问', () => {
      // Test that localStorage methods are called
      progressManager.getTotalStars()
      progressManager.getLearnedCharacters()
      
      expect(mockLocalStorage.getItem).toHaveBeenCalled()
    })

    test('应该处理localStorage读取错误', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error')
      })
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      const newManager = LearningProgressManager.getInstance()
      expect(newManager.getTotalStars()).toBe(0)
      
      consoleSpy.mockRestore()
    })
  })

  describe('边界情况', () => {
    beforeEach(() => {
      LearningProgressManager.resetInstance()
      mockLocalStorage.getItem.mockImplementation(() => null)
      mockLocalStorage.setItem.mockClear()
      mockLocalStorage.removeItem.mockClear()
      mockLocalStorage.clear.mockClear()
      progressManager = LearningProgressManager.getInstance()
    })

    test('应该处理无效的字符ID', () => {
      const learnCount = progressManager.getCharacterLearnCount('')
      expect(learnCount).toBe(0)
      
      const isLearned = progressManager.isCharacterLearned('')
      expect(isLearned).toBe(false)
    })

    test('应该处理不存在的字符', () => {
      const learnCount = progressManager.getCharacterLearnCount('non-existent')
      expect(learnCount).toBe(0)
      
      const isLearned = progressManager.isCharacterLearned('non-existent')
      expect(isLearned).toBe(false)
    })

    test('应该处理空的字符列表', async () => {
      const emptyMasterConfig = { categories: [] }
      const allCategoryProgress = await progressManager.calculateAllCategoryProgress(emptyMasterConfig)
      expect(allCategoryProgress).toEqual({})
    })

    test('应该处理空的分类数据', () => {
       const categoryProgress = progressManager.calculateCategoryProgress('empty-category', [])
       expect(categoryProgress).toEqual({
         categoryName: 'empty-category',
         totalCount: 0,
         learnedCount: 0,
         learnedCharacters: []
       })
     })
  })

  describe('集成测试', () => {
    beforeEach(() => {
      LearningProgressManager.resetInstance()
      mockLocalStorage.getItem.mockImplementation(() => null)
      mockLocalStorage.setItem.mockClear()
      mockLocalStorage.removeItem.mockClear()
      mockLocalStorage.clear.mockClear()
      progressManager = LearningProgressManager.getInstance()
    })

    test('应该正确处理基本学习流程', () => {
      // 初始状态
      expect(progressManager.getTotalStars()).toBe(0)
      expect(progressManager.getLearnedCharacters()).toEqual([])
      
      // 验证基本方法调用
      expect(progressManager.isCharacterLearned('char-1')).toBe(false)
      expect(progressManager.getCharacterLearnCount('char-1')).toBe(0)
    })

    test('应该正确计算分类进度结构', () => {
        const animalCharacters = [
          { id: 'char-1', character: '猫' },
          { id: 'char-2', character: '狗' }
        ]
        
        const animalProgress = progressManager.calculateCategoryProgress('animals', animalCharacters)
        
        expect(animalProgress.categoryName).toBe('animals')
        expect(animalProgress.totalCount).toBe(2)
        expect(animalProgress.learnedCount).toBe(0) // No learned characters in empty state
        expect(animalProgress.learnedCharacters).toEqual([])
     })
  })
})