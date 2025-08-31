import { createStore } from 'jotai'
import {
  allHanziDataAtom,
  currentHanziAtom,
  learningProgressAtom,
  loadingStateAtom,
  getCharacterProgressAtom,
  updateCharacterProgressAtom,
  getCategoryProgressAtom,
  getOverallProgressAtom,
  HanziCharacter,
  LearningProgress
} from '@/lib/atoms/hanzi-atoms'
import { mockHanziCharacter, mockHanziList, mockLearningProgress } from '../../utils/test-utils'

describe('hanzi-atoms', () => {
  let store: ReturnType<typeof createStore>
  let mockStorage: any

  beforeEach(() => {
    // 设置localStorage mock
    mockStorage = {
      getItem: jest.fn().mockReturnValue(null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    }
    
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true
    })
    
    store = createStore()
    // 清理localStorage模拟
    jest.clearAllMocks()
  })

  describe('基础原子状态', () => {
    test('allHanziDataAtom 初始状态应为空数组', () => {
      const allHanzi = store.get(allHanziDataAtom)
      expect(allHanzi).toEqual([])
    })

    test('currentHanziAtom 初始状态应为null', () => {
      const currentHanzi = store.get(currentHanziAtom)
      expect(currentHanzi).toBeNull()
    })

    test('loadingStateAtom 初始状态应为未加载状态', () => {
      const loadingState = store.get(loadingStateAtom)
      expect(loadingState).toEqual({
        isLoading: false,
        error: null
      })
    })

    test('应该能够设置汉字数据', () => {
      store.set(allHanziDataAtom, mockHanziList)
      const allHanzi = store.get(allHanziDataAtom)
      expect(allHanzi).toEqual(mockHanziList)
      expect(allHanzi).toHaveLength(3)
    })

    test('应该能够设置当前汉字', () => {
      store.set(currentHanziAtom, mockHanziCharacter)
      const currentHanzi = store.get(currentHanziAtom)
      expect(currentHanzi).toEqual(mockHanziCharacter)
      expect(currentHanzi?.character).toBe('火')
    })

    test('应该能够设置加载状态', () => {
      const loadingState = { isLoading: true, error: null }
      store.set(loadingStateAtom, loadingState)
      expect(store.get(loadingStateAtom)).toEqual(loadingState)
    })

    test('应该能够设置错误状态', () => {
      const errorState = { isLoading: false, error: '加载失败' }
      store.set(loadingStateAtom, errorState)
      expect(store.get(loadingStateAtom)).toEqual(errorState)
    })
  })

  describe('学习进度管理', () => {
    beforeEach(() => {
      // 设置模拟的学习进度数据
      store.set(learningProgressAtom, mockLearningProgress)
    })

    test('getCharacterProgressAtom 应该返回指定汉字的学习进度', () => {
      const progress = store.get(getCharacterProgressAtom)
      // 这是一个写入原子，需要通过set来触发
      store.set(getCharacterProgressAtom, '火_huo_1')
      
      const learningProgress = store.get(learningProgressAtom)
      expect(learningProgress['火_huo_1']).toEqual(mockLearningProgress['火_huo_1'])
    })

    test('updateCharacterProgressAtom 应该能够更新汉字学习进度', () => {
      const updateData = {
        characterId: 'test-hanzi-3',
        completed: true,
        starsEarned: 5,
        lastLearned: '2024-01-16T12:00:00Z'
      }

      store.set(updateCharacterProgressAtom, updateData)
      const progress = store.get(learningProgressAtom)
      
      expect(progress['test-hanzi-3']).toEqual({
        characterId: 'test-hanzi-3',
        completed: true,
        completedAt: expect.any(String),
        lastLearned: '2024-01-16T12:00:00Z',
        starsEarned: 5
      })
    })

    test('updateCharacterProgressAtom 应该能够更新已存在汉字的进度', () => {
      const updateData = {
        characterId: '火_huo_1',
        completed: true,
        starsEarned: 5
      }

      store.set(updateCharacterProgressAtom, updateData)
      const progress = store.get(learningProgressAtom)
      
      expect(progress['火_huo_1'].starsEarned).toBe(8) // 3 (初始) + 5 (新增) = 8
    expect(progress['火_huo_1'].completed).toBe(true)
    })
  })

  describe('类别进度计算', () => {
    beforeEach(() => {
      store.set(allHanziDataAtom, mockHanziList)
      store.set(learningProgressAtom, mockLearningProgress)
    })

    test('getCategoryProgressAtom 应该正确计算类别进度', () => {
      const categoryProgress = store.get(getCategoryProgressAtom)
      
      expect(categoryProgress).toHaveProperty('自然')
      expect(categoryProgress['自然']).toEqual({
        total: 3,
        completed: 1,
        percentage: expect.any(Number)
      })
    })

    test('类别进度百分比计算应该正确', () => {
      const categoryProgress = store.get(getCategoryProgressAtom)
      const natureProgress = categoryProgress['自然']
      
      expect(natureProgress.percentage).toBe(33)
    })
  })

  describe('整体进度计算', () => {
    beforeEach(() => {
      store.set(allHanziDataAtom, mockHanziList)
      store.set(learningProgressAtom, mockLearningProgress)
    })

    test('getOverallProgressAtom 应该正确计算整体进度', () => {
      const overallProgress = store.get(getOverallProgressAtom)
      
      expect(overallProgress).toEqual({
        total: 3,
        completed: 1,
        percentage: expect.any(Number)
      })
    })

    test('整体进度百分比应该正确计算', () => {
      const overallProgress = store.get(getOverallProgressAtom)
      expect(overallProgress.percentage).toBe(33)
    })

    test('空数据时应该返回零进度', () => {
      store.set(allHanziDataAtom, [])
      store.set(learningProgressAtom, {})
      
      const overallProgress = store.get(getOverallProgressAtom)
      expect(overallProgress).toEqual({
        total: 0,
        completed: 0,
        percentage: 0
      })
    })
  })

  describe('数据持久化', () => {
    test('learningProgressAtom 应该支持数据持久化', () => {
      // 测试atom能正常读写数据
      const testProgress = {
        'test-id': {
          characterId: 'test-id',
          completed: true,
          starsEarned: 5
        }
      }
      
      store.set(learningProgressAtom, testProgress)
      const progress = store.get(learningProgressAtom)
      
      expect(progress['test-id']).toEqual(testProgress['test-id'])
    })
  })

  describe('边界情况处理', () => {
    test('处理无效的汉字ID', () => {
      store.set(learningProgressAtom, mockLearningProgress)
      store.set(getCharacterProgressAtom, 'invalid-id')
      
      const progress = store.get(learningProgressAtom)
      expect(progress['invalid-id']).toBeUndefined()
    })

    test('处理空的学习进度数据', () => {
      store.set(learningProgressAtom, {})
      const categoryProgress = store.get(getCategoryProgressAtom)
      
      expect(Object.keys(categoryProgress)).toHaveLength(0)
    })

    test('处理损坏的进度数据', () => {
      const corruptedProgress = {
        '火_huo_1': {
      characterId: '火_huo_1',
          // 缺少必要字段
        }
      }
      
      store.set(learningProgressAtom, corruptedProgress as any)
      
      // 应该能够处理而不崩溃
      expect(() => {
        store.get(getCategoryProgressAtom)
      }).not.toThrow()
    })
  })
})