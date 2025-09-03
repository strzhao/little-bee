'use client';

import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { useToddlerGameStore } from '@/lib/store/toddler-game-store';
import { updateCharacterProgressAtom } from '@/lib/atoms/hanzi-atoms';
import { HanziCharacter } from '@/lib/hanzi-data-loader';
import { CharacterDisplay } from './CharacterDisplay';
import { ChoiceCard } from './ChoiceCard';
import { Celebration } from './Celebration';
import { motion } from 'framer-motion';

const ERROR_SOUND_PATH = '/assets/audio/error.mp3'; // Placeholder path

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

  useEffect(() => {
    if (lastResult === 'INCORRECT') {
      const audio = new Audio(ERROR_SOUND_PATH);
      audio.play().catch(err => console.error("Failed to play error sound:", err));
      // Reset the result so the sound doesn't play again on re-render
      clearLastResult();
    }
  }, [lastResult, clearLastResult]);

  const handleSelectAnswer = (selectedHanzi: HanziCharacter) => {
    const isCorrect = selectAnswer(selectedHanzi, (characterId: string) => {
      updateProgress({
        characterId,
        completed: true,
        starsEarned: 1,
        lastLearned: new Date().toISOString()
      });
    });
    return isCorrect;
  };

  if (!currentCharacter) {
    return <div>加载题目...</div>; // Should be handled by parent component state
  }

  if (gameState === 'CELEBRATING') {
    return <Celebration onComplete={nextRound} />;
  }

  const totalCharacters = fullList.length;
  const learnedCount = totalCharacters - hanziQueue.length;
  const progressPercentage = totalCharacters > 0 ? (learnedCount / totalCharacters) * 100 : 0;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-12 p-6">
      {/* Progress Header */}
      <motion.div 
        className="w-full max-w-2xl mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-medium text-gray-700">
            进度: {learnedCount}/{totalCharacters}
          </span>
          <span className="text-lg font-bold text-blue-600">
            🎯 {score} 分
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            className="bg-blue-500 h-3 rounded-full transition-all duration-500"
            initial={{ width: '0%' }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        
        {/* Stars Progress */}
        <div className="flex items-center gap-1 mt-2 justify-center">
          {Array.from({ length: 5 }, (_, index) => {
            const starProgress = (learnedCount / totalCharacters) * 5;
            const isFilled = index < Math.floor(starProgress);
            const isPartial = index === Math.floor(starProgress) && starProgress % 1 > 0;
            
            return (
              <div key={index} className="relative w-5 h-5">
                {/* Background Star */}
                <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                
                {/* Filled Star */}
                {(isFilled || isPartial) && (
                  <div className="absolute inset-0 overflow-hidden" style={{ width: isPartial ? '50%' : '100%' }}>
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      <CharacterDisplay character={currentCharacter} />
      
      <motion.div 
        className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {currentChoices.map((choice, index) => (
          <motion.div
            key={choice.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <ChoiceCard
              hanzi={choice}
              onSelect={() => handleSelectAnswer(choice)}
              isCorrect={choice.id === currentCharacter.id}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
