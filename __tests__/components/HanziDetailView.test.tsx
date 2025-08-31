import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'jotai'
import HanziDetailView from '@/components/hanzi/HanziDetailView'
import { render, mockHanziCharacter, mockHanziList } from '../utils/test-utils'
import { allHanziDataAtom, updateCharacterProgressAtom } from '@/lib/atoms/hanzi-atoms'
import * as hanziDataLoader from '@/lib/hanzi-data-loader'

// Mock hanzi data loader
jest.mock('@/lib/hanzi-data-loader', () => ({
  hanziDataLoader: {
    loadCharacterById: jest.fn()
  }
}))

// Mock VoicePlayer component
jest.mock('@/components/hanzi/VoicePlayer', () => ({
  __esModule: true,
  default: ({ audioSrc, onPlayComplete }: { audioSrc: string; onPlayComplete?: () => void }) => (
    <div data-testid="voice-player">
      <button 
        onClick={() => onPlayComplete?.()}
        data-testid="play-audio"
      >
        Play Audio: {audioSrc}
      </button>
    </div>
  )
}))

// Mock ExplanationVoicePlayer component
jest.mock('@/components/hanzi/ExplanationVoicePlayer', () => ({
  __esModule: true,
  default: React.forwardRef(({ audioSrc, onPlayComplete }: { audioSrc: string; onPlayComplete?: () => void }, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      play: () => onPlayComplete?.()
    }))
    
    return (
      <div data-testid="explanation-voice-player">
        <button 
          onClick={() => onPlayComplete?.()}
          data-testid="play-explanation"
        >
          Play Explanation: {audioSrc}
        </button>
      </div>
    )
  })
}))

// Mock CelebrationAnimation component
jest.mock('@/components/hanzi/CelebrationAnimation', () => ({
  __esModule: true,
  default: ({ isVisible, onComplete }: { isVisible: boolean; onComplete: () => void }) => (
    isVisible ? (
      <div data-testid="celebration-animation">
        <button onClick={onComplete} data-testid="complete-celebration">
          Complete Celebration
        </button>
      </div>
    ) : null
  )
}))

const mockHanziDataLoader = hanziDataLoader.hanziDataLoader as jest.Mocked<typeof hanziDataLoader.hanziDataLoader>

describe('HanziDetailView', () => {
  const mockOnNavigateToHome = jest.fn()
  const testHanziId = 'test-hanzi-1'
  const testHanzi = mockHanziCharacters[0]

  beforeEach(() => {
    jest.clearAllMocks()
    mockHanziDataLoader.loadCharacterById.mockResolvedValue(testHanzi)
  })

  describe('基本渲染', () => {
    test('应该正确渲染汉字详情', async () => {
      const { store } = renderWithJotai(
        <HanziDetailView characterId={testHanziId} onNavigateHome={mockOnNavigateToHome} />
      )
      
      // 设置汉字数据
      store.set(allHanziDataAtom, mockHanziCharacters)
      
      await waitFor(() => {
        expect(screen.getByText(testHanzi.character)).toBeInTheDocument()
        expect(screen.getByText(testHanzi.pinyin)).toBeInTheDocument()
        expect(screen.getByText(testHanzi.meaning)).toBeInTheDocument()
      })
    })

    test('应该显示返回按钮', async () => {
      const { store } = renderWithJotai(
        <HanziDetailView characterId={testHanziId} onNavigateHome={mockOnNavigateToHome} />
      )
      
      store.set(allHanziDataAtom, mockHanziCharacters)
      
      await waitFor(() => {
        expect(screen.getByTestId('back-button')).toBeInTheDocument()
      })
    })

    test('应该显示语音播放器', async () => {
      const { store } = renderWithJotai(
        <HanziDetailView characterId={testHanziId} onNavigateHome={mockOnNavigateToHome} />
      )
      
      store.set(allHanziDataAtom, mockHanziCharacters)
      
      await waitFor(() => {
        expect(screen.getByTestId('voice-player')).toBeInTheDocument()
      })
    })
  })

  describe('交互功能', () => {
    test('点击返回按钮应该调用onNavigateToHome', async () => {
      const { store } = renderWithJotai(
        <HanziDetailView characterId={testHanziId} onNavigateHome={mockOnNavigateToHome} />
      )
      
      store.set(allHanziDataAtom, mockHanziCharacters)
      
      await waitFor(() => {
        expect(screen.getByTestId('back-button')).toBeInTheDocument()
      })
      
      fireEvent.click(screen.getByTestId('back-button'))
      expect(mockOnNavigateToHome).toHaveBeenCalled()
    })

    test('播放音频应该正常工作', async () => {
      const { store } = renderWithJotai(
        <HanziDetailView characterId={testHanziId} onNavigateHome={mockOnNavigateToHome} />
      )
      
      store.set(allHanziDataAtom, mockHanziCharacters)
      
      await waitFor(() => {
        expect(screen.getByTestId('play-audio')).toBeInTheDocument()
      })
      
      fireEvent.click(screen.getByTestId('play-audio'))
      // 验证音频播放不会抛出错误
    })
  })

  describe('演化阶段', () => {
    test('应该显示演化阶段信息', async () => {
      const { store } = renderWithJotai(
        <HanziDetailView characterId={testHanziId} onNavigateHome={mockOnNavigateToHome} />
      )
      
      store.set(allHanziDataAtom, mockHanziCharacters)
      
      await waitFor(() => {
        // 验证演化阶段存在
        testHanzi.evolutionStages.forEach(stage => {
          expect(screen.getByText(stage.scriptName)).toBeInTheDocument()
        })
      })
    })

    test('应该能够播放演化阶段解释', async () => {
      const { store } = renderWithJotai(
        <HanziDetailView characterId={testHanziId} onNavigateHome={mockOnNavigateToHome} />
      )
      
      store.set(allHanziDataAtom, mockHanziCharacters)
      
      await waitFor(() => {
        expect(screen.getByTestId('explanation-voice-player')).toBeInTheDocument()
      })
      
      fireEvent.click(screen.getByTestId('play-explanation'))
      // 验证解释播放不会抛出错误
    })
  })

  describe('学习进度', () => {
    test('应该能够标记为已学习', async () => {
      const { store } = renderWithJotai(
        <HanziDetailView characterId={testHanziId} onNavigateHome={mockOnNavigateToHome} />
      )
      
      store.set(allHanziDataAtom, mockHanziCharacters)
      
      await waitFor(() => {
        const completeButton = screen.getByTestId('complete-learning')
        expect(completeButton).toBeInTheDocument()
      })
      
      fireEvent.click(screen.getByTestId('complete-learning'))
      
      // 验证庆祝动画显示
      await waitFor(() => {
        expect(screen.getByTestId('celebration-animation')).toBeInTheDocument()
      })
    })

    test('完成庆祝动画后应该更新学习进度', async () => {
      const { store } = renderWithJotai(
        <HanziDetailView characterId={testHanziId} onNavigateHome={mockOnNavigateToHome} />
      )
      
      store.set(allHanziDataAtom, mockHanziCharacters)
      
      await waitFor(() => {
        expect(screen.getByTestId('complete-learning')).toBeInTheDocument()
      })
      
      // 标记为已学习
      fireEvent.click(screen.getByTestId('complete-learning'))
      
      await waitFor(() => {
        expect(screen.getByTestId('celebration-animation')).toBeInTheDocument()
      })
      
      // 完成庆祝动画
      fireEvent.click(screen.getByTestId('complete-celebration'))
      
      // 验证学习进度更新（通过检查按钮状态变化）
      await waitFor(() => {
        expect(screen.queryByTestId('celebration-animation')).not.toBeInTheDocument()
      })
    })
  })

  describe('数据加载', () => {
    test('应该处理汉字不存在的情况', async () => {
      const { store } = renderWithJotai(
        <HanziDetailView characterId="non-existent" onNavigateHome={mockOnNavigateToHome} />
      )
      
      store.set(allHanziDataAtom, mockHanziCharacters)
      
      await waitFor(() => {
        expect(screen.getByText('汉字不存在')).toBeInTheDocument()
      })
    })

    test('应该处理空的汉字ID', async () => {
      const { store } = renderWithJotai(
        <HanziDetailView characterId="" onNavigateHome={mockOnNavigateToHome} />
      )
      
      store.set(allHanziDataAtom, mockHanziCharacters)
      
      await waitFor(() => {
        expect(screen.getByText('汉字不存在')).toBeInTheDocument()
      })
    })

    test('应该从数据加载器加载汉字数据', async () => {
      const { store } = renderWithJotai(
        <HanziDetailView characterId={testHanziId} onNavigateHome={mockOnNavigateToHome} />
      )
      
      // 不设置allHanziDataAtom，让组件从数据加载器加载
      
      await waitFor(() => {
        expect(mockHanziDataLoader.loadCharacterById).toHaveBeenCalledWith(testHanziId)
      })
    })
  })

  describe('边界情况', () => {
    test('应该处理缺少音频文件的情况', async () => {
      const hanziWithoutAudio = {
        ...testHanzi,
        assets: {
          ...testHanzi.assets,
          pronunciationAudio: ''
        }
      }
      
      const { store } = renderWithJotai(
        <HanziDetailView hanziId={testHanziId} onNavigateToHome={mockOnNavigateToHome} />
      )
      
      store.set(allHanziDataAtom, [hanziWithoutAudio])
      
      await waitFor(() => {
        expect(screen.getByText(hanziWithoutAudio.character)).toBeInTheDocument()
      })
      
      // 应该仍然显示语音播放器，但可能处于禁用状态
      expect(screen.getByTestId('voice-player')).toBeInTheDocument()
    })

    test('应该处理缺少演化阶段的情况', async () => {
      const hanziWithoutEvolution = {
        ...testHanzi,
        evolutionStages: []
      }
      
      const { store } = renderWithJotai(
        <HanziDetailView hanziId={testHanziId} onNavigateToHome={mockOnNavigateToHome} />
      )
      
      store.set(allHanziDataAtom, [hanziWithoutEvolution])
      
      await waitFor(() => {
        expect(screen.getByText(hanziWithoutEvolution.character)).toBeInTheDocument()
      })
      
      // 应该不显示演化阶段相关内容
      expect(screen.queryByTestId('explanation-voice-player')).not.toBeInTheDocument()
    })

    test('应该处理组件卸载', async () => {
      const { store, unmount } = renderWithJotai(
        <HanziDetailView characterId={testHanziId} onNavigateHome={mockOnNavigateToHome} />
      )
      
      store.set(allHanziDataAtom, mockHanziCharacters)
      
      // 卸载组件不应该抛出错误
      expect(() => {
        unmount()
      }).not.toThrow()
    })
  })

  describe('性能优化', () => {
    test('相同hanziId不应该重复加载数据', async () => {
      const { store, rerender } = renderWithJotai(
        <HanziDetailView characterId={testHanziId} onNavigateHome={mockOnNavigateToHome} />
      )
      
      store.set(allHanziDataAtom, mockHanziCharacters)
      
      await waitFor(() => {
        expect(screen.getByText(testHanzi.character)).toBeInTheDocument()
      })
      
      const initialCallCount = mockHanziDataLoader.loadCharacterById.mock.calls.length
      
      // 重新渲染相同的hanziId
      rerender(
        <HanziDetailView characterId={testHanziId} onNavigateHome={mockOnNavigateToHome} />
      )
      
      // 不应该重新加载数据
      expect(mockHanziDataLoader.loadCharacterById.mock.calls.length).toBe(initialCallCount)
    })

    test('不同hanziId应该加载新数据', async () => {
      const { store, rerender } = renderWithJotai(
        <HanziDetailView characterId={testHanziId} onNavigateHome={mockOnNavigateToHome} />
      )
      
      store.set(allHanziDataAtom, mockHanziCharacters)
      
      await waitFor(() => {
        expect(screen.getByText(testHanzi.character)).toBeInTheDocument()
      })
      
      // 更改hanziId
      rerender(
        <HanziDetailView characterId="test-hanzi-2" onNavigateHome={mockOnNavigateToHome} />
      )
      
      await waitFor(() => {
        expect(mockHanziDataLoader.loadCharacterById).toHaveBeenCalledWith('test-hanzi-2')
      })
    })
  })
})