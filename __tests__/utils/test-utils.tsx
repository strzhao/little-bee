import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { Provider } from 'jotai'
import { HanziCharacter } from '@/lib/atoms/hanzi-atoms'
import { CategoryConfig } from '@/lib/atoms/hanzi-page-atoms'

// 自定义渲染函数，包含Jotai Provider
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider>
      {children}
    </Provider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// 测试数据模拟
export const mockHanziCharacter: HanziCharacter = {
  id: '火_huo_1',
  character: '火',
  pinyin: 'huǒ',
  theme: '自然',
  category: '自然',
  learningStage: '基础',
  meaning: '火焰',
  emoji: '🔥',
  assets: {
    pronunciationAudio: '/audio/fire.mp3',
    mainIllustration: '/images/fire.png',
    lottieAnimation: '/animations/fire.json',
    realObjectImage: '/images/real-fire.jpg',
    realObjectCardColor: '#FF6B6B'
  },
  evolutionStages: [
    {
      scriptName: '甲骨文',
      timestamp: -1600,
      narrationAudio: '/audio/jiaguwen-fire.mp3',
      explanation: '甲骨文中的火字像燃烧的火焰',
      scriptText: '𤆍',
      fontFamily: 'JiaguFont',
      cardColor: '#8B4513'
    },
    {
      scriptName: '金文',
      timestamp: -1000,
      narrationAudio: '/audio/jinwen-fire.mp3',
      explanation: '金文中火字更加规整',
      scriptText: '火',
      fontFamily: 'JinFont',
      cardColor: '#CD853F'
    }
  ]
}

export const mockCategoryConfig: CategoryConfig = {
  name: '自然',
  emoji: '🌿',
  count: 10,
  bgColor: 'bg-green-100',
  available: true,
  learnedCount: 3
}

export const mockHanziList: HanziCharacter[] = [
  mockHanziCharacter,
  {
    ...mockHanziCharacter,
    id: 'test-hanzi-2',
    character: '水',
    pinyin: 'shuǐ',
    meaning: '水流',
    emoji: '💧'
  },
  {
    ...mockHanziCharacter,
    id: 'test-hanzi-3',
    character: '土',
    pinyin: 'tǔ',
    meaning: '土地',
    emoji: '🌍'
  }
]

// 模拟学习进度数据
export const mockLearningProgress = {
  '火_huo_1': {
    characterId: '火_huo_1',
    completed: true,
    completedAt: '2024-01-15T10:30:00Z',
    lastLearned: '2024-01-15T10:30:00Z',
    starsEarned: 3
  },
  '水_shui_1': {
    characterId: '水_shui_1',
    completed: false,
    lastLearned: '2024-01-14T15:20:00Z',
    starsEarned: 1
  }
}

// 工具函数：等待异步操作
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 工具函数：模拟用户点击位置
export const mockClickPosition = { x: 100, y: 200 }

// 工具函数：创建模拟的DOM事件
export const createMockEvent = (type: string, properties: any = {}) => {
  const event = new Event(type, { bubbles: true })
  Object.assign(event, properties)
  return event
}