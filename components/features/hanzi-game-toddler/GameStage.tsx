'use client';

import { useToddlerGameStore } from '@/lib/store/toddler-game-store';
import { CharacterDisplay } from './CharacterDisplay';
import { ChoiceCard } from './ChoiceCard';
import { Celebration } from './Celebration';

export function GameStage() {
  const {
    currentCharacter,
    currentChoices,
    selectAnswer,
    gameState,
    nextRound,
  } = useToddlerGameStore();

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
            onSelect={selectAnswer}
            isCorrect={choice.id === currentCharacter.id}
          />
        ))}
      </div>
    </div>
  );
}
