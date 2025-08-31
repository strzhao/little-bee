import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SuccessStars from '@/components/hanzi/SuccessStars';
import { useLearningProgress } from '@/lib/hooks/use-hanzi-state';

// Mock dependencies
jest.mock('@/lib/hooks/use-hanzi-state');
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, whileTap, initial, animate, exit, transition, ...props }: any) => (
      <div onClick={onClick} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock Star component
jest.mock('@/components/hanzi/Star', () => {
  return function MockStar({ id, size, color }: { id?: string; size?: number; color?: string }) {
    return <div data-testid={id || 'star'} data-size={size} data-color={color}>★</div>;
  };
});

const mockUseLearningProgress = useLearningProgress as jest.MockedFunction<typeof useLearningProgress>;

describe('SuccessStars', () => {
  const mockProgress = {
    'char-1': {
      characterId: 'char-1',
      completed: true,
      starsEarned: 3,
      lastLearned: '2024-01-01T00:00:00.000Z',
    },
    'char-2': {
      characterId: 'char-2',
      completed: true,
      starsEarned: 2,
      lastLearned: '2024-01-02T00:00:00.000Z',
    },
    'char-3': {
      characterId: 'char-3',
      completed: false,
      starsEarned: 0,
      lastLearned: undefined,
    },
  };

  beforeEach(() => {
    mockUseLearningProgress.mockReturnValue({
      progress: mockProgress,
      categoryProgress: {},
      overallProgress: { total: 0, completed: 0, percentage: 0 },
      getCharacterProgress: jest.fn(),
      isCharacterCompleted: jest.fn(),
      getCharacterStars: jest.fn(),
      updateProgress: jest.fn(),
      completeCharacterLearning: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('基础渲染', () => {
    test('应该渲染星星计数器', () => {
      render(<SuccessStars />);
      
      expect(screen.getByTestId('success-star-icon')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument(); // 3 + 2 = 5 stars
    });

    test('应该显示正确的星星总数', () => {
      const customProgress = {
        'char-1': {
          characterId: 'char-1',
          completed: true,
          starsEarned: 10,
          lastLearned: new Date().toISOString(),
        },
      };
      
      mockUseLearningProgress.mockReturnValue({
        progress: customProgress,
        categoryProgress: {},
        overallProgress: { total: 0, completed: 0, percentage: 0 },
        getCharacterProgress: jest.fn(),
        isCharacterCompleted: jest.fn(),
        getCharacterStars: jest.fn(),
        updateProgress: jest.fn(),
        completeCharacterLearning: jest.fn(),
      });
      
      render(<SuccessStars />);
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    test('没有学习进度时应该显示0', () => {
      mockUseLearningProgress.mockReturnValue({
        progress: {},
        categoryProgress: {},
        overallProgress: { total: 0, completed: 0, percentage: 0 },
        getCharacterProgress: jest.fn(),
        isCharacterCompleted: jest.fn(),
        getCharacterStars: jest.fn(),
        updateProgress: jest.fn(),
        completeCharacterLearning: jest.fn(),
      });
      
      render(<SuccessStars />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('模态框功能', () => {
    test('点击星星计数器应该打开模态框', async () => {
      render(<SuccessStars />);
      
      const starCounter = screen.getByText('5').closest('div');
      fireEvent.click(starCounter!);
      
      await waitFor(() => {
        expect(screen.getByText('我收集的汉字')).toBeInTheDocument();
      });
    });

    test('应该显示已完成的字符', async () => {
      render(<SuccessStars />);
      
      const starCounter = screen.getByText('5').closest('div');
      fireEvent.click(starCounter!);
      
      await waitFor(() => {
        // 应该显示两个已完成的字符（char-1 和 char-2）
        expect(screen.getByText('char-1')).toBeInTheDocument();
        expect(screen.getByText('char-2')).toBeInTheDocument();
        // 不应该显示未完成的字符（char-3）
        expect(screen.queryByText('char-3')).not.toBeInTheDocument();
      });
    });

    test('应该显示每个字符的星星数', async () => {
      render(<SuccessStars />);
      
      const starCounter = screen.getByText('5').closest('div');
      fireEvent.click(starCounter!);
      
      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument(); // char-1的星星数
        expect(screen.getByText('2')).toBeInTheDocument(); // char-2的星星数
      });
    });

    test('没有已完成字符时应该显示空状态', async () => {
      mockUseLearningProgress.mockReturnValue({
        progress: {
          'char-1': {
            characterId: 'char-1',
            completed: false,
            starsEarned: 0,
            lastLearned: undefined,
          },
        },
        categoryProgress: {},
        overallProgress: { total: 0, completed: 0, percentage: 0 },
        getCharacterProgress: jest.fn(),
        isCharacterCompleted: jest.fn(),
        getCharacterStars: jest.fn(),
        updateProgress: jest.fn(),
        completeCharacterLearning: jest.fn(),
      });
      
      render(<SuccessStars />);
      
      const starCounter = screen.getByText('0').closest('div');
      fireEvent.click(starCounter!);
      
      await waitFor(() => {
        expect(screen.getByText('你还没有收集到任何汉字哦，')).toBeInTheDocument();
        expect(screen.getByText('快去挑战游戏吧！')).toBeInTheDocument();
      });
    });

    test('点击模态框背景应该关闭模态框', async () => {
      render(<SuccessStars />);
      
      const starCounter = screen.getByText('5').closest('div');
      fireEvent.click(starCounter!);
      
      await waitFor(() => {
        expect(screen.getByText('我收集的汉字')).toBeInTheDocument();
      });
      
      // 点击背景（模态框外部）
      const modalBackground = screen.getByText('我收集的汉字').closest('div')?.parentElement;
      fireEvent.click(modalBackground!);
      
      await waitFor(() => {
        expect(screen.queryByText('我收集的汉字')).not.toBeInTheDocument();
      });
    });
  });

  describe('字符导航', () => {
    test('点击字符应该调用onNavigateToDetail回调', async () => {
      const mockNavigate = jest.fn();
      render(<SuccessStars onNavigateToDetail={mockNavigate} />);
      
      const starCounter = screen.getByText('5').closest('div');
      fireEvent.click(starCounter!);
      
      await waitFor(() => {
        expect(screen.getByText('char-1')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('char-1'));
      
      expect(mockNavigate).toHaveBeenCalledWith('char-1');
    });

    test('点击字符后应该关闭模态框', async () => {
      const mockNavigate = jest.fn();
      render(<SuccessStars onNavigateToDetail={mockNavigate} />);
      
      const starCounter = screen.getByText('5').closest('div');
      fireEvent.click(starCounter!);
      
      await waitFor(() => {
        expect(screen.getByText('我收集的汉字')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('char-1'));
      
      await waitFor(() => {
        expect(screen.queryByText('我收集的汉字')).not.toBeInTheDocument();
      });
    });

    test('没有onNavigateToDetail回调时点击字符不应该报错', async () => {
      render(<SuccessStars />);
      
      const starCounter = screen.getByText('5').closest('div');
      fireEvent.click(starCounter!);
      
      await waitFor(() => {
        expect(screen.getByText('char-1')).toBeInTheDocument();
      });
      
      expect(() => {
        fireEvent.click(screen.getByText('char-1'));
      }).not.toThrow();
    });
  });

  describe('响应式布局', () => {
    test('应该使用响应式网格布局', async () => {
      render(<SuccessStars />);
      
      const starCounter = screen.getByText('5').closest('div');
      fireEvent.click(starCounter!);
      
      await waitFor(() => {
        const gridContainer = screen.getByText('char-1').closest('.grid');
        expect(gridContainer).toHaveClass('grid-cols-3', 'sm:grid-cols-4', 'md:grid-cols-5');
      });
    });
  });

  describe('样式和交互', () => {
    test('星星计数器应该有正确的样式类', () => {
      render(<SuccessStars />);
      
      const starCounter = screen.getByText('5').closest('div');
      expect(starCounter).toHaveClass(
        'fixed',
        'top-4',
        'right-6',
        'flex',
        'items-center',
        'gap-1',
        'bg-white/80',
        'backdrop-blur-sm',
        'px-3',
        'py-2',
        'rounded-full',
        'shadow-md',
        'cursor-pointer',
        'z-40'
      );
    });

    test('星星图标应该有正确的属性', () => {
      render(<SuccessStars />);
      
      const starIcon = screen.getByTestId('success-star-icon');
      expect(starIcon).toHaveAttribute('data-size', '24');
      expect(starIcon).toHaveAttribute('data-color', '#FFD700');
    });
  });
});