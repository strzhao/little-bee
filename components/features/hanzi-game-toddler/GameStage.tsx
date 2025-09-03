'use client';

import { useEffect, useRef, useState } from 'react';
import { useAtom } from 'jotai';
import { useToddlerGameStore } from '@/lib/store/toddler-game-store';
import { updateCharacterProgressAtom } from '@/lib/atoms/hanzi-atoms';
import { HanziCharacter } from '@/lib/hanzi-data-loader';
import { CharacterDisplay } from './CharacterDisplay';
import { Celebration } from './Celebration';
import { motion } from 'framer-motion';
import ExplanationVoicePlayer, { ExplanationVoicePlayerRef } from '@/components/hanzi/ExplanationVoicePlayer';
import useVoiceFeedback from '@/components/hanzi/VoiceFeedback';

export function GameStage() {
  const {
    currentCharacter,
    currentChoices,
    selectAnswer,
    gameState,
    nextRound,
    lastResult,
    clearLastResult,
    score,
    hanziQueue,
    fullList
  } = useToddlerGameStore();

  const [, updateProgress] = useAtom(updateCharacterProgressAtom);
  const voicePlayerRef = useRef<ExplanationVoicePlayerRef | null>(null);
  const { speakSuccess, speakError } = useVoiceFeedback({ voicePlayerRef });
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [imageLoadStates, setImageLoadStates] = useState<Record<string, 'loading' | 'loaded' | 'error'>>({});

  useEffect(() => {
    // 进入时自动播放提示语音
    if (currentCharacter && voicePlayerRef.current) {
      voicePlayerRef.current.speak(`找找${currentCharacter.character}在哪里？`);
    }
  }, [currentCharacter]);

  useEffect(() => {
    if (lastResult === 'INCORRECT') {
      // 错误选择时温和提示
      voicePlayerRef.current?.speak('再看看哦');
      setShowHint(true);
      const timer = setTimeout(() => {
        setShowHint(false);
        clearLastResult();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [lastResult, clearLastResult]);

  useEffect(() => {
    // 每次新题目时重置图片加载状态
    if (currentCharacter) {
      setImageLoadStates({});
    }
  }, [currentCharacter]);

  const handleSelectAnswer = (selectedHanzi: HanziCharacter) => {
    setSelectedOption(selectedHanzi.id);
    const isCorrect = selectAnswer(selectedHanzi, (characterId: string) => {
      updateProgress({
        characterId,
        completed: true,
        starsEarned: 1,
        lastLearned: new Date().toISOString()
      });
      speakSuccess();
      
      // 正确选择后2秒自动进入下一题
      setTimeout(() => {
        setSelectedOption(null);
        nextRound();
      }, 2000);
    });
    
    return isCorrect;
  };

  if (!currentCharacter) {
    return <div>加载题目...</div>; // Should be handled by parent component state
  }

  if (gameState === 'CELEBRATING') {
    return <Celebration onComplete={nextRound} />;
  }

  // 只保留两个选项
  const twoChoices = currentChoices.slice(0, 2);

  return (
    <div className="h-full w-full overflow-hidden bg-gradient-to-b from-blue-50 to-green-50">
      {/* 移除顶部进度信息区，保持界面极简 */}

      {/* 主内容区 - 全屏沉浸式 */}
      <div className="h-full flex flex-col">
        {/* 汉字展示区 - 超大居中显示 */}
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div 
            className="w-full max-w-[300px] aspect-square flex items-center justify-center bg-white rounded-3xl shadow-lg border-4 border-blue-100"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <CharacterDisplay character={currentCharacter} />
          </motion.div>
        </div>

        {/* 二选一区域 - 实物图片选择 */}
        <div className="flex-none h-1/3 flex items-center justify-center px-6 pb-8">
          <div className="grid grid-cols-2 gap-6 w-full max-w-md">
            {twoChoices.map((choice, index) => (
              <motion.button
                key={choice.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  borderWidth: showHint && choice.id === currentCharacter.id ? '4px' : '2px',
                  borderColor: showHint && choice.id === currentCharacter.id ? '#3B82F6' : '#E5E7EB'
                }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`aspect-square w-full max-w-[150px] rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-200
                  ${selectedOption === choice.id 
                    ? choice.id === currentCharacter.id 
                      ? 'bg-green-100 border-4 border-green-400 shadow-lg' 
                      : 'bg-red-100 border-4 border-red-300 shadow-lg'
                    : 'bg-white border-2 border-gray-200 shadow-md hover:shadow-lg'
                  }`}
                onClick={() => handleSelectAnswer(choice)}
                disabled={selectedOption !== null}
              >
                {choice.assets?.realObjectImage ? (
                  <>
                    <img
                      src={choice.assets.realObjectImage}
                      alt={choice.meaning}
                      className="w-full h-full object-cover"
                      onLoad={() => setImageLoadStates(prev => ({ ...prev, [choice.id]: 'loaded' }))}
                      onError={() => setImageLoadStates(prev => ({ ...prev, [choice.id]: 'error' }))}
                      style={{ 
                        display: imageLoadStates[choice.id] === 'error' ? 'none' : 'block'
                      }}
                    />
                    {/* 加载中状态 */}
                    {imageLoadStates[choice.id] === 'loading' || !imageLoadStates[choice.id] ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="animate-pulse text-3xl">📷</div>
                      </div>
                    ) : null}
                  </>
                ) : null}
                {/* 文字备选方案 - 图片加载失败或无图片时显示 */}
                <div 
                  className="w-full h-full flex items-center justify-center text-4xl font-bold bg-gray-100"
                  style={{ 
                    display: choice.assets?.realObjectImage && imageLoadStates[choice.id] !== 'error' 
                      ? 'none' 
                      : 'flex'
                  }}
                >
                  {choice.character}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Hidden voice player for feedback */}
      <ExplanationVoicePlayer 
        ref={voicePlayerRef}
        text=""
        className="hidden"
      />
    </div>
  );
}
