'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAtom } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import { useToddlerGameStore } from '@/lib/store/toddler-game-store';
import { updateCharacterProgressAtom } from '@/lib/atoms/hanzi-atoms';
import { HanziCharacter } from '@/lib/hanzi-data-loader';
import ExplanationVoicePlayer, { ExplanationVoicePlayerRef } from '@/components/hanzi/ExplanationVoicePlayer';
import { Sparkles } from 'lucide-react';

import { CharacterPresenter } from './CharacterPresenter';
import { ChoiceButton } from './ChoiceButton';
import { FullScreenCelebration } from './FullScreenCelebration';
import { ExplanationCard } from './ExplanationCard';

export type GamePhase = 'ENTERING' | 'WAITING_FOR_CHOICE' | 'FEEDBACK_INCORRECT' | 'FEEDBACK_CORRECT' | 'EXPLORING';

const CHARACTER_LAYOUT_ID = 'hanzi-character';

export function GameStage() {
  const store = useToddlerGameStore();
  const [, updateProgress] = useAtom(updateCharacterProgressAtom);
  const voicePlayerRef = useRef<ExplanationVoicePlayerRef | null>(null);
  const advanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [phase, setPhase] = useState<GamePhase>('ENTERING');
  const [selectedChoice, setSelectedChoice] = useState<HanziCharacter | null>(null);

  const advanceToNextRound = () => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
    }
    // Ensure we transition out of exploring phase before advancing
    if (phase === 'EXPLORING') {
      setPhase('FEEDBACK_CORRECT'); 
    }
    store.nextRound();
  };

  useEffect(() => {
    setPhase('ENTERING');
    setSelectedChoice(null);
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
    }
  }, [store.currentCharacter]);

  useEffect(() => {
    if (phase === 'ENTERING' && store.currentCharacter) {
      const introTimer = setTimeout(() => {
        voicePlayerRef.current?.speak(`宝宝，找找看，${store.currentCharacter!.character}在哪里呀？`);
        setPhase('WAITING_FOR_CHOICE');
      }, 800);
      return () => clearTimeout(introTimer);
    }

    if (phase === 'FEEDBACK_INCORRECT') {
      const resetTimer = setTimeout(() => {
        voicePlayerRef.current?.speak('哎呀，不是这个哦，我们再看看另一个好不好？');
        setSelectedChoice(null);
        setPhase('WAITING_FOR_CHOICE');
      }, 1000);
      return () => clearTimeout(resetTimer);
    }

    if (phase === 'FEEDBACK_CORRECT') {
      advanceTimerRef.current = setTimeout(() => {
        advanceToNextRound();
      }, 3500);
      return () => {
        if (advanceTimerRef.current) {
          clearTimeout(advanceTimerRef.current);
        }
      };
    }
  }, [phase, store.currentCharacter]);

  const explanationText = useMemo(() => {
    if (!store.currentCharacter || !store.explanations) return '';
    const meaning = store.currentCharacter.meaning.replace(/\s+/g, '');
    return (
      store.explanations.realObjectExplanations[meaning] ||
      store.explanations.fallbackTemplates.realObject
    ).replace('{character}', store.currentCharacter.character);
  }, [store.currentCharacter, store.explanations]);

  const handleStartExploring = () => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
    }
    setPhase('EXPLORING');
    const fullExplanation = `${store.currentCharacter?.pinyin}, ${store.currentCharacter?.character}。${explanationText}`;
    voicePlayerRef.current?.speak(fullExplanation, advanceToNextRound);
  };

  const handleSelectAnswer = (selected: HanziCharacter) => {
    if (phase !== 'WAITING_FOR_CHOICE') return;

    setSelectedChoice(selected);
    const isCorrect = selected.id === store.currentCharacter?.id;

    if (isCorrect) {
      setPhase('FEEDBACK_CORRECT');
      voicePlayerRef.current?.speak('叮咚！你找到啦！');
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

  if (!store.currentCharacter) {
    return <div className="h-screen w-screen flex items-center justify-center">加载中...</div>;
  }

  const twoChoices = store.currentChoices.slice(0, 2);

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-b from-blue-50 to-green-50 flex flex-col p-6">
      <div className="h-[70%] flex items-center justify-center p-4 relative">
        <AnimatePresence>
          {store.currentCharacter && phase !== 'EXPLORING' && (
            <CharacterPresenter
              key={store.currentCharacter.id}
              character={store.currentCharacter}
              phase={phase}
              layoutId={CHARACTER_LAYOUT_ID}
            />
          )}
        </AnimatePresence>

        {phase === 'FEEDBACK_CORRECT' && (
          <motion.button 
            className="absolute bottom-4 right-4 z-20 p-3 bg-white/80 rounded-full shadow-lg backdrop-blur-sm border border-gray-200"
            onClick={handleStartExploring}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1, transition: { delay: 0.8, type: 'spring' } }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Sparkles className="text-yellow-500" />
          </motion.button>
        )}
      </div>

      <div className="h-[30%] flex items-center justify-center">
        <motion.div
          className="grid grid-cols-2 gap-6 w-2/3"
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
        {phase === 'FEEDBACK_CORRECT' && <FullScreenCelebration onComplete={() => {}} />}
        {phase === 'EXPLORING' && (
          <>
            <div className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm" onClick={advanceToNextRound} />
            
            <div className="fixed inset-0 z-40 flex flex-col items-center justify-center pointer-events-none">
              <div className="h-[70%] w-full flex items-center justify-center">
                {store.currentCharacter && (
                  <CharacterPresenter
                    key={`${store.currentCharacter.id}-exploring`}
                    character={store.currentCharacter}
                    phase={phase}
                    layoutId={CHARACTER_LAYOUT_ID}
                    pinyin={store.currentCharacter.pinyin}
                  />
                )}
              </div>
              <div className="h-[30%] w-full" />
            </div>

            <ExplanationCard text={explanationText} />
          </>
        )}
      </AnimatePresence>

      <ExplanationVoicePlayer ref={voicePlayerRef} text="" className="hidden" />
    </div>
  );
}