'use client';

import { useEffect, useRef, useState } from 'react';
import { useAtom } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import { useToddlerGameStore } from '@/lib/store/toddler-game-store';
import { updateCharacterProgressAtom } from '@/lib/atoms/hanzi-atoms';
import { HanziCharacter } from '@/lib/hanzi-data-loader';
import useVoiceFeedback from '@/components/hanzi/VoiceFeedback';
import ExplanationVoicePlayer, { ExplanationVoicePlayerRef } from '@/components/hanzi/ExplanationVoicePlayer';

import { CharacterPresenter } from './CharacterPresenter';
import { ChoiceButton } from './ChoiceButton';
import { FullScreenCelebration } from './FullScreenCelebration';

export type GamePhase = 'ENTERING' | 'WAITING_FOR_CHOICE' | 'FEEDBACK_INCORRECT' | 'FEEDBACK_CORRECT';

const CHARACTER_LAYOUT_ID = 'hanzi-character';

export function GameStage() {
  const store = useToddlerGameStore();
  const [, updateProgress] = useAtom(updateCharacterProgressAtom);
  const voicePlayerRef = useRef<ExplanationVoicePlayerRef | null>(null);
  const { speakCustom: speak } = useVoiceFeedback({ voicePlayerRef });

  const [phase, setPhase] = useState<GamePhase>('ENTERING');
  const [selectedChoice, setSelectedChoice] = useState<HanziCharacter | null>(null);

  useEffect(() => {
    // Reset phase for new characters
    setPhase('ENTERING');
    setSelectedChoice(null);
  }, [store.currentCharacter]);

  useEffect(() => {
    if (phase === 'ENTERING' && store.currentCharacter) {
      const introTimer = setTimeout(() => {
        speak(`宝宝，找找看，${store.currentCharacter!.character}在哪里呀？`);
        setPhase('WAITING_FOR_CHOICE');
      }, 800); // Wait for entry animation
      return () => clearTimeout(introTimer);
    }

    if (phase === 'FEEDBACK_INCORRECT') {
      speak('哎呀，不是这个哦，我们再看看另一个好不好？');
      const resetTimer = setTimeout(() => {
        setSelectedChoice(null);
        setPhase('WAITING_FOR_CHOICE');
      }, 2000);
      return () => clearTimeout(resetTimer);
    }

  }, [phase, store.currentCharacter, speak]);

  const handleSelectAnswer = (selected: HanziCharacter) => {
    if (phase !== 'WAITING_FOR_CHOICE') return;

    setSelectedChoice(selected);
    const isCorrect = selected.id === store.currentCharacter?.id;

    if (isCorrect) {
      setPhase('FEEDBACK_CORRECT');
      speak('叮咚！你找到啦！');
      updateProgress({
        characterId: store.currentCharacter!.id,
        completed: true,
        starsEarned: 1,
        lastLearned: new Date().toISOString(),
      });
    } else {
      setPhase('FEEDBACK_INCORRECT');
    }
  };

  const handleCelebrationComplete = () => {
    store.nextRound();
    // The useEffect listening to currentCharacter will reset the phase
  };

  if (!store.currentCharacter) {
    return <div className="h-full w-full flex items-center justify-center">加载中...</div>;
  }

  const twoChoices = store.currentChoices.slice(0, 2);

  return (
    <div className="h-full w-full overflow-hidden bg-gradient-to-b from-blue-50 to-green-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 relative">
        <AnimatePresence>
          {store.currentCharacter && (
            <CharacterPresenter
              key={store.currentCharacter.id}
              character={store.currentCharacter}
              phase={phase}
              layoutId={CHARACTER_LAYOUT_ID}
            />
          )}
        </AnimatePresence>
      </div>

      <div className="flex-none h-1/3 flex items-center justify-center px-6 pb-8">
        <motion.div
          className="grid grid-cols-2 gap-6 w-full max-w-md"
          variants={{ enter: { transition: { staggerChildren: 0.1 } } }}
          initial="initial"
          animate="enter"
        >
          {twoChoices.map((choice) => (
            <ChoiceButton
              key={choice.id}
              choice={choice}
              phase={phase}
              isSelected={selectedChoice?.id === choice.id}
              isCorrectChoice={choice.id === store.currentCharacter?.id}
              onClick={() => handleSelectAnswer(choice)}
              layoutId={CHARACTER_LAYOUT_ID}
            />
          ))}
        </motion.div>
      </div>

      <AnimatePresence>
        {phase === 'FEEDBACK_CORRECT' && (
          <FullScreenCelebration onComplete={handleCelebrationComplete} />
        )}
      </AnimatePresence>

      <ExplanationVoicePlayer ref={voicePlayerRef} text="" className="hidden" />
    </div>
  );
}