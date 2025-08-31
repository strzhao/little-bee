import { createStore } from 'jotai'
import {
  hanziPageStateAtom,
  pageModeAtom,
  selectedCharacterIdAtom,
  transitionDataAtom,
  navigateToDetailAtom,
  navigateToHomeAtom,
  HanziPageMode,
  HanziPageState,
  CategoryConfig,
  TransitionData
} from '@/lib/atoms/hanzi-page-atoms'
import { mockCategoryConfig, mockClickPosition } from '../../utils/test-utils'

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}

// Mock window object
Object.defineProperty(global, 'window', {
  value: {
    sessionStorage: mockSessionStorage
  },
  writable: true
})

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true
})

describe('hanzi-page-atoms', () => {
  let store: ReturnType<typeof createStore>

  beforeEach(() => {
    store = createStore()
    // 清理所有mock调用记录
    jest.clearAllMocks()
    jest.clearAllTimers()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('基础页面状态', () => {
    test('hanziPageStateAtom 初始状态应该正确', () => {
      const pageState = store.get(hanziPageStateAtom)
      expect(pageState).toEqual({
        mode: 'home',
        selectedCharacterId: null,
        transitionData: {
          category: null,
          clickPosition: null,
          isReturning: false
        }
      })
    })

    test('应该能够设置完整的页面状态', () => {
      const newState: HanziPageState = {
        mode: 'detail',
        selectedCharacterId: '火_huo_1',
        transitionData: {
          category: mockCategoryConfig,
          clickPosition: mockClickPosition,
          isReturning: false
        }
      }

      store.set(hanziPageStateAtom, newState)
      const pageState = store.get(hanziPageStateAtom)
      expect(pageState).toEqual(newState)
    })
  })

  describe('页面模式管理', () => {
    test('pageModeAtom 应该返回当前页面模式', () => {
      const mode = store.get(pageModeAtom)
      expect(mode).toBe('home')
    })

    test('应该能够设置页面模式', () => {
      store.set(pageModeAtom, 'detail')
      const mode = store.get(pageModeAtom)
      expect(mode).toBe('detail')
    })

    test('设置页面模式应该更新整体状态', () => {
      store.set(pageModeAtom, 'transition')
      const pageState = store.get(hanziPageStateAtom)
      expect(pageState.mode).toBe('transition')
    })

    test('应该支持所有有效的页面模式', () => {
      const validModes: HanziPageMode[] = ['home', 'detail', 'transition']
      
      validModes.forEach(mode => {
        store.set(pageModeAtom, mode)
        expect(store.get(pageModeAtom)).toBe(mode)
      })
    })
  })

  describe('选中汉字ID管理', () => {
    test('selectedCharacterIdAtom 初始值应为null', () => {
      const selectedId = store.get(selectedCharacterIdAtom)
      expect(selectedId).toBeNull()
    })

    test('应该能够设置选中的汉字ID', () => {
      store.set(selectedCharacterIdAtom, '火_huo_1')
    const selectedId = store.get(selectedCharacterIdAtom)
    expect(selectedId).toBe('火_huo_1')
    })

    test('应该能够清除选中的汉字ID', () => {
      store.set(selectedCharacterIdAtom, '火_huo_1')
      store.set(selectedCharacterIdAtom, null)
      const selectedId = store.get(selectedCharacterIdAtom)
      expect(selectedId).toBeNull()
    })

    test('设置汉字ID应该更新整体状态', () => {
      store.set(selectedCharacterIdAtom, 'test-hanzi-2')
      const pageState = store.get(hanziPageStateAtom)
      expect(pageState.selectedCharacterId).toBe('test-hanzi-2')
    })
  })

  describe('过渡数据管理', () => {
    test('transitionDataAtom 初始状态应该正确', () => {
      const transitionData = store.get(transitionDataAtom)
      expect(transitionData).toEqual({
        category: null,
        clickPosition: null,
        isReturning: false
      })
    })

    test('应该能够设置类别信息', () => {
      store.set(transitionDataAtom, { category: mockCategoryConfig })
      const transitionData = store.get(transitionDataAtom)
      expect(transitionData.category).toEqual(mockCategoryConfig)
    })

    test('应该能够设置点击位置', () => {
      store.set(transitionDataAtom, { clickPosition: mockClickPosition })
      const transitionData = store.get(transitionDataAtom)
      expect(transitionData.clickPosition).toEqual(mockClickPosition)
    })

    test('应该能够设置返回状态', () => {
      store.set(transitionDataAtom, { isReturning: true })
      const transitionData = store.get(transitionDataAtom)
      expect(transitionData.isReturning).toBe(true)
    })

    test('应该能够部分更新过渡数据', () => {
      // 先设置初始数据
      store.set(transitionDataAtom, {
        category: mockCategoryConfig,
        clickPosition: mockClickPosition
      })

      // 部分更新
      store.set(transitionDataAtom, { isReturning: true })
      
      const transitionData = store.get(transitionDataAtom)
      expect(transitionData).toEqual({
        category: mockCategoryConfig,
        clickPosition: mockClickPosition,
        isReturning: true
      })
    })
  })

  describe('导航到详情页', () => {
    test('navigateToDetailAtom 应该设置正确的状态', () => {
      const navigationData = {
        characterId: '火_huo_1',
        category: mockCategoryConfig,
        clickPosition: mockClickPosition
      }

      store.set(navigateToDetailAtom, navigationData)

      // 立即检查状态变化
      const pageState = store.get(hanziPageStateAtom)
      expect(pageState.mode).toBe('transition')
      expect(pageState.selectedCharacterId).toBe('火_huo_1')
      expect(pageState.transitionData.category).toEqual(mockCategoryConfig)
      expect(pageState.transitionData.clickPosition).toEqual(mockClickPosition)
    })

    test('navigateToDetailAtom 应该在延迟后切换到详情模式', () => {
      const navigationData = {
        characterId: '火_huo_1'
      }

      store.set(navigateToDetailAtom, navigationData)

      // 快进时间
      jest.advanceTimersByTime(500)

      const pageState = store.get(hanziPageStateAtom)
      expect(pageState.mode).toBe('detail')
    })

    test('navigateToDetailAtom 应该处理可选参数', () => {
      const navigationData = {
        characterId: '火_huo_1'
        // 没有category和clickPosition
      }

      store.set(navigateToDetailAtom, navigationData)

      const pageState = store.get(hanziPageStateAtom)
      expect(pageState.selectedCharacterId).toBe('火_huo_1')
      expect(pageState.transitionData.category).toBeNull()
      expect(pageState.transitionData.clickPosition).toBeNull()
    })
  })

  describe('导航到首页', () => {
    beforeEach(() => {
      // 设置初始状态为详情页
      store.set(hanziPageStateAtom, {
        mode: 'detail',
        selectedCharacterId: 'test-hanzi-1',
        transitionData: {
          category: mockCategoryConfig,
          clickPosition: mockClickPosition,
          isReturning: false
        }
      })
    })

    test('navigateToHomeAtom 应该设置返回状态', () => {
      store.set(navigateToHomeAtom)

      const pageState = store.get(hanziPageStateAtom)
      expect(pageState.mode).toBe('transition')
      expect(pageState.transitionData.isReturning).toBe(true)
    })

    test('navigateToHomeAtom 应该在延迟后重置到首页状态', () => {
      store.set(navigateToHomeAtom)

      // 快进时间
      jest.advanceTimersByTime(500)

      const pageState = store.get(hanziPageStateAtom)
      expect(pageState.mode).toBe('home')
      expect(pageState.selectedCharacterId).toBeNull()
      expect(pageState.transitionData).toEqual({
        category: null,
        clickPosition: null,
        isReturning: false
      })
    })
  })

  describe('数据持久化', () => {
    test('应该正确设置和获取页面状态', () => {
      const testState: HanziPageState = {
        mode: 'detail',
        selectedCharacterId: 'test-hanzi-1',
        transitionData: {
          category: mockCategoryConfig,
          clickPosition: mockClickPosition,
          isReturning: false
        }
      }

      store.set(hanziPageStateAtom, testState)
      const retrievedState = store.get(hanziPageStateAtom)
      
      expect(retrievedState).toEqual(testState)
    })

    test('应该正确处理默认状态', () => {
      const defaultState = store.get(hanziPageStateAtom)
      
      expect(defaultState.mode).toBe('home')
      expect(defaultState.selectedCharacterId).toBeNull()
      expect(defaultState.transitionData.category).toBeNull()
      expect(defaultState.transitionData.clickPosition).toBeNull()
      expect(defaultState.transitionData.isReturning).toBe(false)
    })

    test('应该处理损坏的sessionStorage数据', () => {
      mockSessionStorage.getItem.mockReturnValue('invalid-json')
      
      // 应该不会崩溃，而是使用默认状态
      expect(() => {
        const newStore = createStore()
        newStore.get(hanziPageStateAtom)
      }).not.toThrow()
    })
  })

  describe('边界情况处理', () => {
    test('应该处理空的汉字ID', () => {
      store.set(navigateToDetailAtom, { characterId: '' })
      
      const pageState = store.get(hanziPageStateAtom)
      expect(pageState.selectedCharacterId).toBe('')
    })

    test('应该处理无效的点击位置', () => {
      const invalidPosition = { x: -1, y: -1 }
      store.set(transitionDataAtom, { clickPosition: invalidPosition })
      
      const transitionData = store.get(transitionDataAtom)
      expect(transitionData.clickPosition).toEqual(invalidPosition)
    })

    test('应该处理快速连续的导航操作', () => {
      // 快速导航到详情页
      store.set(navigateToDetailAtom, { characterId: 'hanzi-1' })
      store.set(navigateToDetailAtom, { characterId: 'hanzi-2' })
      
      const pageState = store.get(hanziPageStateAtom)
      expect(pageState.selectedCharacterId).toBe('hanzi-2')
    })
  })
})