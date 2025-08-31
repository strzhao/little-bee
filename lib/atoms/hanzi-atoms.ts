import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// 汉字数据相关原子
export interface HanziCharacter {
  id: string
  character: string
  pinyin: string
  theme: string
  category: string
  learningStage: string
  meaning: string
  emoji: string
  assets: {
    pronunciationAudio: string
    mainIllustration: string
    lottieAnimation: string
    realObjectImage: string
    realObjectCardColor: string
  }
  evolutionStages: Array<{
    scriptName: string
    timestamp: number
    narrationAudio: string
    explanation: string
    scriptText: string
    fontFamily: string
    cardColor: string
  }>
}

// 学习进度相关原子
export interface LearningProgress {
  characterId: string
  completed: boolean
  completedAt?: string
  lastLearned?: string
  starsEarned: number
}

// 全局汉字数据原子
export const allHanziDataAtom = atom<HanziCharacter[]>([])

// 当前选中汉字原子
export const currentHanziAtom = atom<HanziCharacter | null>(null)

// 学习进度原子（持久化存储）
export const learningProgressAtom = atomWithStorage<Record<string, LearningProgress>>(
  'hanzi-learning-progress',
  {}
)

// 加载状态原子
export const loadingStateAtom = atom<{
  isLoading: boolean
  error: string | null
}>({ isLoading: false, error: null })

// 派生原子：获取特定汉字的学习进度
export const getCharacterProgressAtom = atom(
  null,
  (get, set, characterId: string) => {
    const progress = get(learningProgressAtom)
    return progress[characterId] || {
      characterId,
      completed: false,
      starsEarned: 0
    }
  }
)

// 派生原子：更新汉字学习进度
export const updateCharacterProgressAtom = atom(
  null,
  (get, set, update: { characterId: string; completed: boolean; starsEarned: number; lastLearned?: string }) => {
    const currentProgress = get(learningProgressAtom)
    const newProgress = {
      ...currentProgress,
      [update.characterId]: {
        characterId: update.characterId,
        completed: update.completed,
        completedAt: update.completed ? new Date().toISOString() : undefined,
        lastLearned: update.lastLearned,
        starsEarned: update.starsEarned
      }
    }
    set(learningProgressAtom, newProgress)
  }
)

// 派生原子：获取分类进度统计
export const getCategoryProgressAtom = atom((get) => {
  const allHanzi = get(allHanziDataAtom)
  const progress = get(learningProgressAtom)
  
  const categoryStats: Record<string, { total: number; completed: number; percentage: number }> = {}
  
  allHanzi.forEach(hanzi => {
    if (!categoryStats[hanzi.category]) {
      categoryStats[hanzi.category] = { total: 0, completed: 0, percentage: 0 }
    }
    
    categoryStats[hanzi.category].total++
    
    if (progress[hanzi.id]?.completed) {
      categoryStats[hanzi.category].completed++
    }
  })
  
  // 计算百分比
  Object.keys(categoryStats).forEach(category => {
    const stats = categoryStats[category]
    stats.percentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
  })
  
  return categoryStats
})

// 派生原子：获取总体学习进度
export const getOverallProgressAtom = atom((get) => {
  const allHanzi = get(allHanziDataAtom)
  const progress = get(learningProgressAtom)
  
  const totalCharacters = allHanzi.length
  const completedCharacters = allHanzi.filter(hanzi => progress[hanzi.id]?.completed).length
  
  return {
    total: totalCharacters,
    completed: completedCharacters,
    percentage: totalCharacters > 0 ? Math.round((completedCharacters / totalCharacters) * 100) : 0
  }
})