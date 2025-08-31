'use client'

import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import {
  allHanziDataAtom,
  currentHanziAtom,
  learningProgressAtom,
  loadingStateAtom,
  updateCharacterProgressAtom,
  getCategoryProgressAtom,
  getOverallProgressAtom,
  HanziCharacter,
  LearningProgress
} from '../atoms/hanzi-atoms'
import { HanziService } from '../services/hanzi-service'

// 主要的汉字状态管理hook
export function useHanziState() {
  const [allHanzi, setAllHanzi] = useAtom(allHanziDataAtom)
  const [currentHanzi, setCurrentHanzi] = useAtom(currentHanziAtom)
  const [loadingState, setLoadingState] = useAtom(loadingStateAtom)
  const updateProgress = useSetAtom(updateCharacterProgressAtom)
  
  const hanziService = HanziService.getInstance()

  // 加载所有汉字数据
  const loadAllCharacters = useCallback(async () => {
    if (allHanzi.length > 0) return // 已加载
    
    setLoadingState({ isLoading: true, error: null })
    
    try {
      const characters = await hanziService.getAllCharacters()
      setAllHanzi(characters)
      setLoadingState({ isLoading: false, error: null })
    } catch (error) {
      setLoadingState({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load characters' 
      })
    }
  }, [allHanzi.length, setAllHanzi, setLoadingState, hanziService])

  // 根据ID加载特定汉字
  const loadCharacterById = useCallback(async (id: string) => {
    setLoadingState({ isLoading: true, error: null })
    
    try {
      const character = await hanziService.getCharacterById(id)
      
      if (character) {
        setCurrentHanzi(character)
        setLoadingState({ isLoading: false, error: null })
        return character
      } else {
        setLoadingState({ 
          isLoading: false, 
          error: `Character not found: ${id}` 
        })
        return null
      }
    } catch (error) {
      setLoadingState({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load character' 
      })
      return null
    }
  }, [setCurrentHanzi, setLoadingState, hanziService])

  // 重置汉字学习进度
  const resetCharacterProgress = useCallback((characterId: string) => {
    updateProgress({
      characterId,
      completed: false,
      starsEarned: 0
    })
  }, [updateProgress])

  return {
    // 状态
    allHanzi,
    currentHanzi,
    loadingState,
    
    // 操作
    loadAllCharacters,
    loadCharacterById,
    resetCharacterProgress,
    setCurrentHanzi
  }
}

// 学习进度管理hook
export function useLearningProgress() {
  const progress = useAtomValue(learningProgressAtom)
  const categoryProgress = useAtomValue(getCategoryProgressAtom)
  const overallProgress = useAtomValue(getOverallProgressAtom)
  const updateProgress = useSetAtom(updateCharacterProgressAtom)

  // 获取特定汉字的进度
  const getCharacterProgress = useCallback((characterId: string): LearningProgress => {
    return progress[characterId] || {
      characterId,
      completed: false,
      starsEarned: 0
    }
  }, [progress])

  // 检查汉字是否已完成
  const isCharacterCompleted = useCallback((characterId: string): boolean => {
    return progress[characterId]?.completed || false
  }, [progress])

  // 获取汉字获得的星星数
  const getCharacterStars = useCallback((characterId: string): number => {
    return progress[characterId]?.starsEarned || 0
  }, [progress])

  // 完成汉字学习
  const completeCharacterLearning = useCallback((characterId: string, character: string, starsEarned: number = 3) => {
    updateProgress({
      characterId,
      completed: true,
      starsEarned,
      lastLearned: new Date().toISOString()
    })
  }, [updateProgress])

  return {
    // 状态
    progress,
    categoryProgress,
    overallProgress,
    
    // 查询方法
    getCharacterProgress,
    isCharacterCompleted,
    getCharacterStars,
    
    // 更新方法
    updateProgress,
    completeCharacterLearning
  }
}

// 数据加载hook
export function useHanziData() {
  const { loadAllCharacters, allHanzi, loadingState } = useHanziState()
  
  // 自动加载数据
  useEffect(() => {
    loadAllCharacters()
  }, [loadAllCharacters])
  
  return {
    allHanzi,
    loadingState,
    reload: loadAllCharacters
  }
}

// 类别数据hook
export function useCategoryData(category?: string) {
  const { allHanzi } = useHanziData()
  const categoryProgress = useAtomValue(getCategoryProgressAtom)
  
  const categoryCharacters = category 
    ? allHanzi.filter(char => char.category === category)
    : allHanzi
    
  const categoryStats = category 
    ? categoryProgress[category] 
    : null
  
  return {
    characters: categoryCharacters,
    stats: categoryStats,
    allCategories: [...new Set(allHanzi.map(char => char.category))]
  }
}