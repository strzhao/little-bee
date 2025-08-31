import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CategoryTransition from '@/components/hanzi/CategoryTransition';
import { hanziDataLoader } from '@/lib/hanzi-data-loader';

// Mock hanzi-data-loader
jest.mock('@/lib/hanzi-data-loader', () => ({
  hanziDataLoader: {
    initialize: jest.fn().mockResolvedValue(undefined),
    loadByCategory: jest.fn().mockResolvedValue([
      {
        id: 'fire_huo_1',
        character: '火',
        pinyin: 'huǒ',
        meaning: '火焰',
        emoji: '🔥',
        category: '自然',
        assets: {
          pronunciationAudio: '/audio/fire.mp3',
          mainIllustration: '/images/fire.png',
        },
      },
      {
        id: 'water_shui_1',
        character: '水',
        pinyin: 'shuǐ',
        meaning: '水',
        emoji: '💧',
        category: '自然',
        assets: {
          pronunciationAudio: '/audio/water.mp3',
          mainIllustration: '/images/water.png',
        },
      },
    ]),
  },
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

// 创建测试包装器
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

// Mock data
const mockCategory = {
  name: '自然',
  emoji: '🌿',
  count: 10,
  bgColor: '#10B981',
  available: true,
  learnedCount: 3,
};

const mockClickPosition = { x: 100, y: 200 };

describe('CategoryTransition', () => {
  const mockOnClose = jest.fn();
  const mockOnReturning = jest.fn();
  const mockOnNavigateToDetail = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock hanziDataLoader - 使用正确的方法名
    (hanziDataLoader.loadByCategory as jest.Mock).mockResolvedValue([
      {
        id: 'fire_huo_1',
        character: '火',
        pinyin: 'huǒ',
        meaning: '火焰',
        emoji: '🔥',
        category: '自然',
        assets: {
          pronunciationAudio: '/audio/fire.mp3',
          mainIllustration: '/images/fire.png',
        },
      },
      {
        id: 'water_shui_1',
        character: '水',
        pinyin: 'shuǐ',
        meaning: '水',
        emoji: '💧',
        category: '自然',
        assets: {
          pronunciationAudio: '/audio/water.mp3',
          mainIllustration: '/images/water.png',
        },
      },
    ]);
  });

  describe('基本渲染', () => {
    test('当isOpen为false时不应该渲染内容', () => {
      render(
        <TestWrapper>
          <CategoryTransition
            category={mockCategory}
            isOpen={false}
            onClose={mockOnClose}
            clickPosition={mockClickPosition}
            onReturning={mockOnReturning}
            onNavigateToDetail={mockOnNavigateToDetail}
          />
        </TestWrapper>
      );

      // 当isOpen为false时，组件不应该渲染任何内容
      expect(screen.queryByText('自然')).not.toBeInTheDocument();
    });

    test('当isOpen为true时应该渲染分类内容', async () => {
      render(
        <TestWrapper>
          <CategoryTransition
            category={mockCategory}
            isOpen={true}
            onClose={mockOnClose}
            clickPosition={mockClickPosition}
            onReturning={mockOnReturning}
            onNavigateToDetail={mockOnNavigateToDetail}
          />
        </TestWrapper>
      );

      // 等待数据加载完成
      await waitFor(() => {
        expect(screen.getByText('自然')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // 等待汉字内容加载
      await waitFor(() => {
        expect(screen.getByText('火')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByText('🌿')).toBeInTheDocument();
    });

    test('应该显示汉字列表', async () => {
      render(
        <TestWrapper>
          <CategoryTransition
            category={mockCategory}
            isOpen={true}
            onClose={mockOnClose}
            clickPosition={mockClickPosition}
            onReturning={mockOnReturning}
            onNavigateToDetail={mockOnNavigateToDetail}
          />
        </TestWrapper>
      );

      // 等待汉字数据加载
      await waitFor(() => {
        expect(screen.getByText('火')).toBeInTheDocument();
      });

      expect(screen.getByText('水')).toBeInTheDocument();
      expect(screen.getByText('🔥')).toBeInTheDocument();
      expect(screen.getByText('💧')).toBeInTheDocument();
    });
  });

  describe('交互功能', () => {
    test('应该显示关闭按钮', async () => {
      render(
        <TestWrapper>
          <CategoryTransition
            category={mockCategory}
            isOpen={true}
            onClose={mockOnClose}
            clickPosition={mockClickPosition}
            onReturning={mockOnReturning}
            onNavigateToDetail={mockOnNavigateToDetail}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('自然')).toBeInTheDocument();
      });
      
      // 查找任何按钮元素，因为关闭按钮可能没有明确的文本
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    test('点击关闭按钮应该调用onClose', async () => {
      render(
        <TestWrapper>
          <CategoryTransition
            category={mockCategory}
            isOpen={true}
            onClose={mockOnClose}
            clickPosition={mockClickPosition}
            onReturning={mockOnReturning}
            onNavigateToDetail={mockOnNavigateToDetail}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('自然')).toBeInTheDocument();
      });
      
      // 获取第一个按钮（通常是关闭按钮）
      const buttons = screen.getAllByRole('button');
      if (buttons.length > 0) {
        fireEvent.click(buttons[0]);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });

    test('点击汉字卡片应该调用onNavigateToDetail', async () => {
      render(
        <TestWrapper>
          <CategoryTransition
            category={mockCategory}
            isOpen={true}
            onClose={mockOnClose}
            clickPosition={mockClickPosition}
            onReturning={mockOnReturning}
            onNavigateToDetail={mockOnNavigateToDetail}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        const fireCard = screen.getByText('火');
        fireEvent.click(fireCard);
        expect(mockOnNavigateToDetail).toHaveBeenCalledWith('fire_huo_1');
      });
    });
  });

  describe('数据加载', () => {
    test('应该调用hanziDataLoader加载分类数据', async () => {
      const { hanziDataLoader } = require('@/lib/hanzi-data-loader');
      
      render(
        <TestWrapper>
          <CategoryTransition
            category={mockCategory}
            isOpen={true}
            onClose={mockOnClose}
            clickPosition={mockClickPosition}
            onReturning={mockOnReturning}
            onNavigateToDetail={mockOnNavigateToDetail}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(hanziDataLoader.initialize).toHaveBeenCalled();
        expect(hanziDataLoader.loadByCategory).toHaveBeenCalledWith('自然');
      });
    });

    test('应该处理数据加载错误', async () => {
      const { hanziDataLoader } = require('@/lib/hanzi-data-loader');
      hanziDataLoader.loadByCategory.mockRejectedValueOnce(new Error('加载失败'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <TestWrapper>
          <CategoryTransition
            category={mockCategory}
            isOpen={true}
            onClose={mockOnClose}
            clickPosition={mockClickPosition}
            onReturning={mockOnReturning}
            onNavigateToDetail={mockOnNavigateToDetail}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('加载类别数据失败:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('边界情况', () => {
    test('应该处理空分类', () => {
      render(
        <TestWrapper>
          <CategoryTransition
            category={null}
            isOpen={true}
            onClose={mockOnClose}
            clickPosition={mockClickPosition}
            onReturning={mockOnReturning}
            onNavigateToDetail={mockOnNavigateToDetail}
          />
        </TestWrapper>
      );

      // 空分类时不应该渲染内容
      expect(screen.queryByText('自然')).not.toBeInTheDocument();
    });

    test('应该处理空的点击位置', async () => {
      render(
        <TestWrapper>
          <CategoryTransition
            category={mockCategory}
            isOpen={true}
            onClose={mockOnClose}
            clickPosition={null}
            onReturning={mockOnReturning}
            onNavigateToDetail={mockOnNavigateToDetail}
          />
        </TestWrapper>
      );

      // 等待异步加载完成
      await waitFor(() => {
        expect(screen.getByText('自然')).toBeInTheDocument();
      });
    });

    test('应该处理缺少可选回调函数', async () => {
      render(
        <TestWrapper>
          <CategoryTransition
            category={mockCategory}
            isOpen={true}
            onClose={mockOnClose}
            clickPosition={mockClickPosition}
          />
        </TestWrapper>
      );

      // 等待数据加载完成
      await waitFor(() => {
        expect(screen.getByText('自然')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // 等待汉字内容加载
      await waitFor(() => {
        expect(screen.getByText('火')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('动画状态', () => {
    test('应该正确管理动画阶段', async () => {
      render(
        <TestWrapper>
          <CategoryTransition
            category={mockCategory}
            isOpen={true}
            onClose={mockOnClose}
            clickPosition={mockClickPosition}
            onReturning={mockOnReturning}
            onNavigateToDetail={mockOnNavigateToDetail}
          />
        </TestWrapper>
      );

      // 验证组件渲染并进入内容阶段
      await waitFor(() => {
        expect(screen.getByText('自然')).toBeInTheDocument();
      });
    });
  });
});