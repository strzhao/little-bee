'use client';

import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { useToddlerGameStore } from '@/lib/store/toddler-game-store';
import { updateCharacterProgressAtom } from '@/lib/atoms/hanzi-atoms';
import { HanziCharacter } from '@/lib/hanzi-data-loader';
import { CharacterDisplay } from './CharacterDisplay';
import { ChoiceCard } from './ChoiceCard';
import { Celebration } from './Celebration';

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

  return (
    <div className="flex h-full flex-col items-center justify-center gap-16 p-8">
      <CharacterDisplay character={currentCharacter} />
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8">
        {currentChoices.map((choice) => (
          <ChoiceCard
            key={choice.id}
            hanzi={choice}
            onSelect={() => handleSelectAnswer(choice)} // Use the new handler
            isCorrect={choice.id === currentCharacter.id}
          />
        ))}
      </div>
    </div>
  );
}
