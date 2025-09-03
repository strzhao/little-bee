'use client';

import { useCallback, useRef } from 'react';
import { ExplanationVoicePlayerRef } from './ExplanationVoicePlayer';

export interface VoiceFeedbackRef {
  speakSuccess: () => void;
  speakError: () => void;
  speakCustom: (text: string) => void;
}

interface VoiceFeedbackProps {
  voicePlayerRef: React.RefObject<ExplanationVoicePlayerRef | null>;
}

const useVoiceFeedback = ({ voicePlayerRef }: VoiceFeedbackProps) => {
  const getRandomFeedback = useCallback((type: 'success' | 'error') => {
    const successMessages = [
      "太棒了！你答对了！",
      "真聪明！完全正确！",
      "做得很好！继续加油！",
      "哇，你真厉害！",
      "答对了！你学得真快！",
      "非常棒！你记住了！",
      "太好了！你找到了正确答案！",
      "真不错！你很仔细！"
    ];
    
    const errorMessages = [
      "这个不对哦，再试试其他的吧！",
      "没关系，再仔细看看！",
      "不是这个呢，换一个试试！",
      "再想想，你一定能找到的！",
      "别着急，慢慢来！",
      "试试别的选项吧！",
      "没关系，学习需要耐心！",
      "再看看，哪个更像呢？"
    ];
    
    const messages = type === 'success' ? successMessages : errorMessages;
    return messages[Math.floor(Math.random() * messages.length)];
  }, []);

  const speakSuccess = useCallback(() => {
    if (voicePlayerRef.current) {
      const message = getRandomFeedback('success');
      voicePlayerRef.current.speak(message);
    }
  }, [voicePlayerRef, getRandomFeedback]);

  const speakError = useCallback(() => {
    if (voicePlayerRef.current) {
      const message = getRandomFeedback('error');
      voicePlayerRef.current.speak(message);
    }
  }, [voicePlayerRef, getRandomFeedback]);

  const speakCustom = useCallback((text: string) => {
    if (voicePlayerRef.current) {
      voicePlayerRef.current.speak(text);
    }
  }, [voicePlayerRef]);

  return {
    speakSuccess,
    speakError,
    speakCustom
  };
};

export default useVoiceFeedback;