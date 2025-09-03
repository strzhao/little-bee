
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { HanziCharacter } from '@/lib/hanzi-data-loader';
import { GamePhase } from './GameStage';
import { useLottieAnimationData } from '@/lib/hooks/use-lottie-animation';

interface CharacterPresenterProps {
  character: HanziCharacter;
  phase: GamePhase;
  layoutId: string;
}

export function CharacterPresenter({ character, phase, layoutId }: CharacterPresenterProps) {
  const isCelebrating = phase === 'FEEDBACK_CORRECT';
  const { animationData } = useLottieAnimationData(
    isCelebrating ? character.assets.lottieAnimation : undefined
  );

  return (
    <motion.div
      layoutId={layoutId}
      className="w-full max-w-[300px] aspect-square flex items-center justify-center"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      <AnimatePresence mode="wait">
        {isCelebrating && animationData ? (
          <motion.div
            key="lottie"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <Lottie
              animationData={animationData}
              loop={false}
              style={{ width: '100%', height: '100%' }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="character"
            className="text-9xl font-hanzi-kaishu text-gray-800"
          >
            {character.character}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
