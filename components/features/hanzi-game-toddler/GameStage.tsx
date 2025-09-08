'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAtom } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import { useToddlerGameStore } from '@/lib/store/toddler-game-store';
import { updateCharacterProgressAtom, getOverallProgressAtom, learningProgressAtom } from '@/lib/atoms/hanzi-atoms';
import { HanziCharacter } from '@/lib/hanzi-data-loader';
import { useHanziState } from '@/lib/hooks/use-hanzi-state';
import ExplanationVoicePlayer, { ExplanationVoicePlayerRef } from '@/components/hanzi/ExplanationVoicePlayer';
import { Sparkles, Star, Settings } from 'lucide-react';

import { CharacterPresenter } from './CharacterPresenter';
import { ChoiceButton } from './ChoiceButton';
import { FullScreenCelebration } from './FullScreenCelebration';
import { ExplanationCard } from './ExplanationCard';
import { CharacterEvolutionDisplay } from './CharacterEvolutionDisplay';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';

export type GamePhase = 'ENTERING' | 'WAITING_FOR_CHOICE' | 'FEEDBACK_INCORRECT' | 'FEEDBACK_CORRECT' | 'EXPLORING';

const CHARACTER_LAYOUT_ID = 'hanzi-character';

export function GameStage() {
  const store = useToddlerGameStore();
  const { loadAllCharacters } = useHanziState();
  const [, updateProgress] = useAtom(updateCharacterProgressAtom);
  const [overallProgress] = useAtom(getOverallProgressAtom);
  const [learningProgress] = useAtom(learningProgressAtom);
  const voicePlayerRef = useRef<ExplanationVoicePlayerRef | null>(null);
  const advanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const [phase, setPhase] = useState<GamePhase>('ENTERING');
  const [selectedChoice, setSelectedChoice] = useState<HanziCharacter | null>(null);

  // 初始化汉字数据
  useEffect(() => {
    loadAllCharacters();
  }, [loadAllCharacters]);

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

    const characterData = store.currentCharacter;
    const meaningKey = characterData.meaning.split(',')[0].trim();

    const template =
      store.explanations.characterExplanations[meaningKey] ||
      store.explanations.realObjectExplanations[meaningKey] ||
      store.explanations.fallbackTemplates.realObject;

    console.log({ meaningKey, template, explanations: store.explanations });

    return template
      .replace(/"{character}"/g, characterData.character)
      .replace(/{meaning}/g, characterData.meaning);
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

    console.log('🎯 handleSelectAnswer called:', {
      selectedId: selected.id,
      currentCharacterId: store.currentCharacter?.id,
      phase
    });

    setSelectedChoice(selected);
    const isCorrect = selected.id === store.currentCharacter?.id;

    console.log('✅ Answer check:', { isCorrect, selectedCharacter: selected.character });

    if (isCorrect) {
      setPhase('FEEDBACK_CORRECT');
      voicePlayerRef.current?.speak('叮咚！你找到啦！');
      
      console.log('🌟 Before calling store.selectAnswer - store.score:', store.score);
      console.log('📊 Before progress update - learningProgress:', learningProgress);
      
      // 调用store的selectAnswer方法来更新分数
      store.selectAnswer(selected, (characterId: string) => {
        console.log('💫 updateProgress callback called for characterId:', characterId);
        updateProgress({
          characterId,
          completed: true,
          starsEarned: 1,
          lastLearned: new Date().toISOString(),
        });
        console.log('✨ updateProgress called with starsEarned: 1');
      });
      
      console.log('🌟 After calling store.selectAnswer - store.score:', store.score);
    } else {
      setPhase('FEEDBACK_INCORRECT');
      // 也要调用store的selectAnswer来记录错误答案
      store.selectAnswer(selected, () => {});
    }
  };

  if (!store.currentCharacter) {
    return <div className="h-screen w-screen flex items-center justify-center">加载中...</div>;
  }

  const twoChoices = store.currentChoices.slice(0, 2);
  const progressValue = overallProgress.percentage;
  
  // 计算总星星数
  const totalStars = Object.values(learningProgress).reduce((sum, progress) => sum + progress.starsEarned, 0);
  
  // 调试日志
  console.log('📈 Progress Debug:', {
    overallProgress,
    progressValue,
    totalStars,
    learningProgressCount: Object.keys(learningProgress).length,
    storeScore: store.score,
    fullListLength: store.fullList.length,
    overallProgressDetails: {
      total: overallProgress.total,
      completed: overallProgress.completed,
      percentage: overallProgress.percentage
    },
    learningProgressKeys: Object.keys(learningProgress)
  });

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-b from-blue-50 to-green-50 flex flex-col p-6">
      {/* Progress and Score Display */}
      <div className="flex-none h-8 flex items-center justify-between px-2">
        <Progress value={progressValue} className="w-full h-2" />
        <div className="flex items-center ml-4 gap-2">
          <motion.div 
            key={totalStars} // Key to trigger re-render animation
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="flex items-center text-yellow-600 font-bold"
          >
            <Star size={20} fill="currentColor" className="mr-1" />
            <span>{totalStars}</span>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative">
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

      <div className="flex-none h-[30%] flex items-center justify-center">
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
              <div className="h-[50%] w-full flex items-center justify-center">
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
              
              <div className="h-[20%] w-full flex items-center justify-center">
                {store.currentCharacter && store.currentCharacter.evolutionStages && (
                  <CharacterEvolutionDisplay evolutionStages={store.currentCharacter.evolutionStages} />
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