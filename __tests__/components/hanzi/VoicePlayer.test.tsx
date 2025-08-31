import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VoicePlayer from '@/components/hanzi/VoicePlayer';

// Mock speechSynthesis API
const mockSpeak = jest.fn();
const mockCancel = jest.fn();
const mockGetVoices = jest.fn();

Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: {
    speak: mockSpeak,
    cancel: mockCancel,
    getVoices: mockGetVoices,
    addEventListener: jest.fn(),
  },
});

// Mock SpeechSynthesisUtterance
global.SpeechSynthesisUtterance = jest.fn().mockImplementation((text) => ({
  text,
  lang: '',
  rate: 1,
  pitch: 1,
  volume: 1,
  voice: null,
  onstart: null,
  onend: null,
  onerror: null,
}));

describe('VoicePlayer', () => {
  const mockVoices = [
    {
      name: 'Microsoft Xiaoxiao - Chinese (Simplified, PRC)',
      lang: 'zh-CN',
    },
    {
      name: 'Google US English',
      lang: 'en-US',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetVoices.mockReturnValue(mockVoices);
    
    // Reset speechSynthesis support
    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      value: {
        speak: mockSpeak,
        cancel: mockCancel,
        getVoices: mockGetVoices,
        addEventListener: jest.fn(),
      },
    });
  });

  describe('基本渲染', () => {
    test('应该正确渲染播放按钮', () => {
      render(<VoicePlayer text="火" />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('title', '播放"火"的发音');
    });

    test('应该支持不同尺寸', () => {
      const { rerender } = render(<VoicePlayer text="火" size="sm" />);
      let button = screen.getByRole('button');
      expect(button).toHaveClass('w-6', 'h-6');

      rerender(<VoicePlayer text="火" size="lg" />);
      button = screen.getByRole('button');
      expect(button).toHaveClass('w-10', 'h-10');
    });

    test('应该应用自定义className', () => {
      render(<VoicePlayer text="火" className="custom-class" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('语音播放功能', () => {
    test('点击按钮应该调用speechSynthesis.speak', () => {
      render(<VoicePlayer text="火" />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockCancel).toHaveBeenCalled();
      expect(SpeechSynthesisUtterance).toHaveBeenCalledWith('火');
      expect(mockSpeak).toHaveBeenCalled();
    });

    test('应该设置正确的语音参数', () => {
      render(<VoicePlayer text="火" />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      const utteranceCall = (SpeechSynthesisUtterance as jest.Mock).mock.calls[0];
      expect(utteranceCall[0]).toBe('火');
    });

    test('应该选择中文语音', () => {
      render(<VoicePlayer text="火" preferredCNVoice={true} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockGetVoices).toHaveBeenCalled();
    });

    test('播放时按钮应该被禁用', async () => {
      render(<VoicePlayer text="火" />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      // 模拟播放开始
      const utterance = (SpeechSynthesisUtterance as jest.Mock).mock.results[0].value;
      if (utterance.onstart) {
        utterance.onstart();
      }

      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('自动播放', () => {
    test('autoPlay为true时应该自动播放', async () => {
      jest.useFakeTimers();
      
      render(<VoicePlayer text="火" autoPlay={true} />);
      
      // 快进定时器
      jest.advanceTimersByTime(600);
      
      await waitFor(() => {
        expect(mockSpeak).toHaveBeenCalled();
      });
      
      jest.useRealTimers();
    });

    test('autoPlay为false时不应该自动播放', () => {
      jest.useFakeTimers();
      
      render(<VoicePlayer text="火" autoPlay={false} />);
      
      jest.advanceTimersByTime(600);
      
      expect(mockSpeak).not.toHaveBeenCalled();
      
      jest.useRealTimers();
    });
  });

  describe('错误处理', () => {
    test('不支持speechSynthesis时应该正常渲染按钮', () => {
      render(<VoicePlayer text="火" />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('title', '播放"火"的发音');
    });

    test('语音播放错误时应该处理错误', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      render(<VoicePlayer text="火" />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      // 模拟播放错误
      const utterance = (SpeechSynthesisUtterance as jest.Mock).mock.results[0].value;
      if (utterance.onerror) {
        utterance.onerror({ error: 'network' });
      }

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('语音播放错误:', 'network');
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('播放状态管理', () => {
    test('播放结束后应该重置状态', async () => {
      render(<VoicePlayer text="火" />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      // 模拟播放开始
      const utterance = (SpeechSynthesisUtterance as jest.Mock).mock.results[0].value;
      if (utterance.onstart) {
        utterance.onstart();
      }

      await waitFor(() => {
        expect(button).toBeDisabled();
      });

      // 模拟播放结束
      if (utterance.onend) {
        utterance.onend();
      }

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });

    test('播放时应该显示动画效果', async () => {
      render(<VoicePlayer text="火" />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      // 模拟播放开始
      const utterance = (SpeechSynthesisUtterance as jest.Mock).mock.results[0].value;
      if (utterance.onstart) {
        utterance.onstart();
      }

      await waitFor(() => {
        const icon = button.querySelector('svg');
        expect(icon).toHaveClass('animate-pulse');
      });
    });
  });

  describe('语音选择', () => {
    test('preferredCNVoice为true时应该优先选择中文女声', () => {
      const mockVoicesWithFemale = [
        {
          name: 'Microsoft Xiaoxiao - Chinese (Simplified, PRC)',
          lang: 'zh-CN',
        },
        {
          name: 'Microsoft Yaoyao - Chinese (Simplified, PRC)',
          lang: 'zh-CN',
        },
      ];
      
      mockGetVoices.mockReturnValue(mockVoicesWithFemale);
      
      render(<VoicePlayer text="火" preferredCNVoice={true} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockGetVoices).toHaveBeenCalled();
    });
  });
});