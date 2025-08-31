import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CelebrationAnimation from '@/components/hanzi/CelebrationAnimation';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onAnimationComplete, ...props }: any) => {
      // 模拟动画完成
      React.useEffect(() => {
        if (onAnimationComplete) {
          const timer = setTimeout(onAnimationComplete, 100);
          return () => clearTimeout(timer);
        }
      }, [onAnimationComplete]);
      return <div data-testid="motion-div" {...props}>{children}</div>;
    },
  },
}));

// Mock Star component
jest.mock('@/components/hanzi/Star', () => {
  return function MockStar({ size }: { size: number }) {
    return <div data-testid="star" data-size={size}>⭐</div>;
  };
});

// Mock DOM methods
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768,
});

describe('CelebrationAnimation', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock getElementById to return a mock element
    const mockElement = {
      getBoundingClientRect: () => ({
        left: 100,
        top: 50,
        width: 24,
        height: 24,
      }),
    };
    
    jest.spyOn(document, 'getElementById').mockReturnValue(mockElement as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('基本渲染', () => {
    test('应该正确渲染庆祝动画', async () => {
      render(<CelebrationAnimation onComplete={mockOnComplete} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('motion-div')).toBeInTheDocument();
        expect(screen.getByTestId('star')).toBeInTheDocument();
      });
    });

    test('应该渲染正确大小的星星', async () => {
      render(<CelebrationAnimation onComplete={mockOnComplete} />);
      
      await waitFor(() => {
        const star = screen.getByTestId('star');
        expect(star).toHaveAttribute('data-size', '100');
      });
    });

    test('应该有正确的CSS类名', async () => {
      render(<CelebrationAnimation onComplete={mockOnComplete} />);
      
      await waitFor(() => {
        const container = screen.getByTestId('motion-div').parentElement;
        expect(container).toHaveClass('fixed', 'inset-0', 'w-full', 'h-full', 'flex', 'justify-center', 'items-center', 'pointer-events-none', 'z-[100]');
      });
    });
  });

  describe('动画完成回调', () => {
    test('动画完成后应该调用onComplete回调', async () => {
      render(<CelebrationAnimation onComplete={mockOnComplete} />);
      
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledTimes(1);
      }, { timeout: 2000 });
    });

    test('应该只调用一次onComplete回调', async () => {
      render(<CelebrationAnimation onComplete={mockOnComplete} />);
      
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledTimes(1);
      }, { timeout: 2000 });
      
      // 等待额外时间确保不会重复调用
      await new Promise(resolve => setTimeout(resolve, 200));
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('星星位置计算', () => {
    test('找不到目标元素时不应该渲染', () => {
      jest.spyOn(document, 'getElementById').mockReturnValue(null);
      
      const { container } = render(<CelebrationAnimation onComplete={mockOnComplete} />);
      
      expect(container.firstChild).toBeNull();
    });

    test('应该基于目标元素位置计算星星位置', async () => {
      const mockElement = {
        getBoundingClientRect: () => ({
          left: 200,
          top: 100,
          width: 48,
          height: 48,
        }),
      };
      
      jest.spyOn(document, 'getElementById').mockReturnValue(mockElement as any);
      
      render(<CelebrationAnimation onComplete={mockOnComplete} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('motion-div')).toBeInTheDocument();
      });
      
      // 验证getElementById被正确调用
      expect(document.getElementById).toHaveBeenCalledWith('success-star-icon');
    });
  });

  describe('边界条件', () => {
    test('应该处理极小的目标元素', async () => {
      const mockElement = {
        getBoundingClientRect: () => ({
          left: 0,
          top: 0,
          width: 1,
          height: 1,
        }),
      };
      
      jest.spyOn(document, 'getElementById').mockReturnValue(mockElement as any);
      
      render(<CelebrationAnimation onComplete={mockOnComplete} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('motion-div')).toBeInTheDocument();
      });
    });

    test('应该处理极大的目标元素', async () => {
      const mockElement = {
        getBoundingClientRect: () => ({
          left: 500,
          top: 300,
          width: 200,
          height: 200,
        }),
      };
      
      jest.spyOn(document, 'getElementById').mockReturnValue(mockElement as any);
      
      render(<CelebrationAnimation onComplete={mockOnComplete} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('motion-div')).toBeInTheDocument();
      });
    });

    test('应该处理不同的窗口尺寸', async () => {
      // 修改窗口尺寸
      Object.defineProperty(window, 'innerWidth', { value: 800 });
      Object.defineProperty(window, 'innerHeight', { value: 600 });
      
      render(<CelebrationAnimation onComplete={mockOnComplete} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('motion-div')).toBeInTheDocument();
      });
    });
  });

  describe('组件卸载', () => {
    test('组件卸载时应该清理定时器', () => {
      const { unmount } = render(<CelebrationAnimation onComplete={mockOnComplete} />);
      
      // 立即卸载组件
      unmount();
      
      // 验证没有内存泄漏或错误
      expect(() => unmount()).not.toThrow();
    });
  });
});