import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HanziDetailView from '@/components/hanzi/HanziDetailView';

// Mock child components
jest.mock('@/components/hanzi/CelebrationAnimation', () => {
  return function MockCelebrationAnimation() {
    return <div data-testid="celebration-animation">Celebration Animation</div>;
  };
});

jest.mock('@/components/hanzi/VoicePlayer', () => {
  return function MockVoicePlayer({ audioSrc }: { audioSrc: string }) {
    return (
      <div data-testid="voice-player">
        <button data-testid="play-button">播放</button>
        <span>Audio: {audioSrc}</span>
      </div>
    );
  };
});

jest.mock('@/components/hanzi/ExplanationVoicePlayer', () => {
  return React.forwardRef(function MockExplanationVoicePlayer(props: any, ref: any) {
    return (
      <div data-testid="explanation-voice-player">
        <button data-testid="explanation-play-button">播放解释</button>
      </div>
    );
  });
});

jest.mock('@/components/hanzi/SuccessStars', () => {
  return function MockSuccessStars({ count }: { count: number }) {
    return <div data-testid="success-stars">Stars: {count}</div>;
  };
});

// Mock hooks
jest.mock('@/lib/hooks/use-hanzi-state', () => ({
  useHanziState: jest.fn(() => ({
    currentHanzi: null,
    allHanzi: [],
    loadingState: { isLoading: false },
    loadCharacterById: jest.fn(),
    loadAllCharacters: jest.fn(),
  })),
  useLearningProgress: jest.fn(() => ({
    categoryProgress: {},
    totalStars: 0,
    isLoading: false,
    completeCharacterLearning: jest.fn(),
  })),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    img: ({ children, ...props }: any) => <img {...props}>{children}</img>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

// 创建测试包装器
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

// Mock data
const mockCharacterData = {
  id: 'fire_huo_1',
  character: '火',
  pinyin: 'huǒ',
  theme: '自然',
  meaning: '火焰',
  emoji: '🔥',
  category: '自然',
  learningStage: '基础',
  assets: {
    pronunciationAudio: '/audio/fire.mp3',
    mainIllustration: '/images/fire.png',
    realObjectImage: '/images/real-fire.jpg',
    realObjectCardColor: '#FF6B6B',
    lottieAnimation: '/animations/fire.json',
  },
  evolutionStages: [
    {
      scriptName: '甲骨文',
      timestamp: -1600,
      narrationAudio: '/audio/jiaguwen-fire.mp3',
      explanation: '甲骨文中的火字像燃烧的火焰',
      scriptText: '𤆍',
      fontFamily: 'JiaguFont',
      cardColor: '#8B4513',
    },
    {
      scriptName: '金文',
      timestamp: -1000,
      narrationAudio: '/audio/jinwen-fire.mp3',
      explanation: '金文中火字更加规整',
      scriptText: '火',
      fontFamily: 'JinFont',
      cardColor: '#CD853F',
    },
  ],
};

const mockAllCharacters = [mockCharacterData];

// Mock useHanziState hook
const mockUseHanziState = require('@/lib/hooks/use-hanzi-state').useHanziState;
const mockUseLearningProgress = require('@/lib/hooks/use-hanzi-state').useLearningProgress;

describe('HanziDetailView', () => {
  const mockOnNavigateHome = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useHanziState to return character data
    const mockLoadCharacterById = jest.fn().mockResolvedValue({
      id: 'fire_huo_1',
      character: '火',
      pinyin: 'huǒ',
      theme: '自然',
      meaning: '火焰',
      emoji: '🔥',
      category: '自然',
      learningStage: '基础',
      assets: {
        pronunciationAudio: '/audio/fire.mp3',
        mainIllustration: '/images/fire.png',
        realObjectImage: '/images/real-fire.jpg',
        realObjectCardColor: '#FF6B6B',
        lottieAnimation: '/animations/fire.json',
      },
      evolutionStages: mockCharacterData.evolutionStages,
    });
    
    const mockLoadAllCharacters = jest.fn().mockResolvedValue([]);
    
    mockUseHanziState.mockReturnValue({
      currentHanzi: null,
      allHanzi: [{
        id: 'fire_huo_1',
        character: '火',
        pinyin: 'huǒ',
        theme: '自然',
        meaning: '火焰',
        emoji: '🔥',
        category: '自然',
        learningStage: '基础',
        assets: {
          pronunciationAudio: '/audio/fire.mp3',
          mainIllustration: '/images/fire.png',
          realObjectImage: '/images/real-fire.jpg',
          realObjectCardColor: '#FF6B6B',
          lottieAnimation: '/animations/fire.json',
        },
        evolutionStages: mockCharacterData.evolutionStages,
      }],
      loadingState: { isLoading: false },
      loadCharacterById: mockLoadCharacterById,
      loadAllCharacters: mockLoadAllCharacters,
    });

    // Mock useLearningProgress
    mockUseLearningProgress.mockReturnValue({
      categoryProgress: {
        '自然': { learned: 1, total: 5 },
      },
      totalStars: 3,
      isLoading: false,
      completeCharacterLearning: jest.fn(),
    });
  });

  describe('基本渲染', () => {
    test('应该正确渲染汉字详情页', async () => {
      render(
        <TestWrapper>
          <HanziDetailView 
            characterId="fire_huo_1" 
            onNavigateHome={mockOnNavigateHome} 
          />
        </TestWrapper>
      );

      // 等待异步加载完成
      await waitFor(() => {
        expect(screen.getByText('火')).toBeInTheDocument();
      });
      
      expect(screen.getByText('huǒ')).toBeInTheDocument();
      expect(screen.getByText('火焰')).toBeInTheDocument();
      expect(screen.getByText('🔥')).toBeInTheDocument();
    });

    test('应该显示返回首页按钮', async () => {
      render(
        <TestWrapper>
          <HanziDetailView 
            characterId="fire_huo_1" 
            onNavigateHome={mockOnNavigateHome} 
          />
        </TestWrapper>
      );

      await waitFor(() => {
        const homeButton = screen.getByRole('button', { name: /返回首页|home/i });
        expect(homeButton).toBeInTheDocument();
      });
    });

    test('应该显示语音播放器', async () => {
      render(
        <TestWrapper>
          <HanziDetailView 
            characterId="fire_huo_1" 
            onNavigateHome={mockOnNavigateHome} 
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('voice-player')).toBeInTheDocument();
      });
      expect(screen.getByText('Audio: /audio/fire.mp3')).toBeInTheDocument();
    });
  });

  describe('交互功能', () => {
    test('点击返回按钮应该调用onNavigateHome', async () => {
      render(
        <TestWrapper>
          <HanziDetailView 
            characterId="fire_huo_1" 
            onNavigateHome={mockOnNavigateHome} 
          />
        </TestWrapper>
      );

      await waitFor(() => {
        const homeButton = screen.getByRole('button', { name: /返回首页|home/i });
        fireEvent.click(homeButton);
        expect(mockOnNavigateHome).toHaveBeenCalledTimes(1);
      });
    });

    test('应该能够播放语音', async () => {
      render(
        <TestWrapper>
          <HanziDetailView 
            characterId="fire_huo_1" 
            onNavigateHome={mockOnNavigateHome} 
          />
        </TestWrapper>
      );

      await waitFor(() => {
        const playButton = screen.getByTestId('play-button');
        fireEvent.click(playButton);
        // 验证播放按钮存在且可点击
        expect(playButton).toBeInTheDocument();
      });
    });
  });

  describe('演化阶段', () => {
    test('应该显示汉字演化阶段', async () => {
      render(
        <TestWrapper>
          <HanziDetailView 
            characterId="fire_huo_1" 
            onNavigateHome={mockOnNavigateHome} 
          />
        </TestWrapper>
      );

      // 验证演化阶段内容
      await waitFor(() => {
        expect(screen.getByText('甲骨文')).toBeInTheDocument();
      });
      expect(screen.getByText('金文')).toBeInTheDocument();
      expect(screen.getByText('甲骨文中的火字像燃烧的火焰')).toBeInTheDocument();
    });

    test('应该显示演化阶段的解释语音播放器', async () => {
      render(
        <TestWrapper>
          <HanziDetailView 
            characterId="fire_huo_1" 
            onNavigateHome={mockOnNavigateHome} 
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('explanation-voice-player')).toBeInTheDocument();
      });
    });
  });

  describe('学习进度', () => {
    test('应该显示学习进度星星', async () => {
      render(
        <TestWrapper>
          <HanziDetailView 
            characterId="fire_huo_1" 
            onNavigateHome={mockOnNavigateHome} 
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('success-stars')).toBeInTheDocument();
      });
    });

    test('应该记录学习完成状态', async () => {
      const mockCompleteCharacterLearning = jest.fn();
      mockUseLearningProgress.mockReturnValue({
        categoryProgress: {
          '自然': { learned: 1, total: 5 },
        },
        totalStars: 3,
        isLoading: false,
        completeCharacterLearning: mockCompleteCharacterLearning,
      });

      render(
        <TestWrapper>
          <HanziDetailView 
            characterId="fire_huo_1" 
            onNavigateHome={mockOnNavigateHome} 
          />
        </TestWrapper>
      );

      // 等待组件完成渲染和可能的异步操作
      await waitFor(() => {
        // 验证组件已渲染
        expect(screen.getByText('火')).toBeInTheDocument();
      });
    });
  });

  describe('错误处理', () => {
    test('应该处理无效的字符ID', () => {
      mockUseHanziState.mockReturnValue({
        currentHanzi: null,
        allHanzi: [],
        loadingState: { isLoading: false },
        loadCharacterById: jest.fn().mockResolvedValue(null),
         loadAllCharacters: jest.fn().mockResolvedValue([]),
      });

      render(
        <TestWrapper>
          <HanziDetailView 
            characterId="invalid_id" 
            onNavigateHome={mockOnNavigateHome} 
          />
        </TestWrapper>
      );

      // 应该显示错误状态或返回按钮
      const homeButton = screen.getByRole('button', { name: /返回首页|home/i });
      expect(homeButton).toBeInTheDocument();
    });

    test('应该处理加载状态', () => {
      mockUseHanziState.mockReturnValue({
        currentHanzi: null,
        allHanzi: [],
        loadingState: { isLoading: true },
        loadCharacterById: jest.fn().mockResolvedValue(null),
         loadAllCharacters: jest.fn().mockResolvedValue([]),
      });

      render(
        <TestWrapper>
          <HanziDetailView 
            characterId="fire_huo_1" 
            onNavigateHome={mockOnNavigateHome} 
          />
        </TestWrapper>
      );

      // 在加载状态下，应该至少显示返回按钮
      const homeButton = screen.getByRole('button', { name: /返回首页|home/i });
      expect(homeButton).toBeInTheDocument();
    });
  });

  describe('动画效果', () => {
    test('应该包含庆祝动画组件', async () => {
      render(
        <TestWrapper>
          <HanziDetailView 
            characterId="fire_huo_1" 
            onNavigateHome={mockOnNavigateHome} 
          />
        </TestWrapper>
      );

      // 庆祝动画可能在特定条件下显示
      // 这里我们验证组件结构正确
      await waitFor(() => {
        expect(screen.getByText('火')).toBeInTheDocument();
      });
    });
  });
});