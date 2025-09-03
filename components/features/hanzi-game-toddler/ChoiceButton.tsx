
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { HanziCharacter } from '@/lib/hanzi-data-loader';
import { GamePhase } from './GameStage';

interface ChoiceButtonProps {
  choice: HanziCharacter;
  phase: GamePhase;
  isSelected: boolean;
  isCorrectChoice: boolean;
  onClick: () => void;
  layoutId: string;
}

export function ChoiceButton({
  choice,
  phase,
  isSelected,
  isCorrectChoice,
  onClick,
  layoutId,
}: ChoiceButtonProps) {
  const [imageLoadState, setImageLoadState] = useState<'loading' | 'loaded' | 'error'>('loading');

  const isWiggling = phase === 'FEEDBACK_INCORRECT' && isSelected;
  const showHint = phase === 'FEEDBACK_INCORRECT' && isCorrectChoice;
  const isDisappearing = phase === 'FEEDBACK_CORRECT' && !isCorrectChoice;
  const isFlying = phase === 'FEEDBACK_CORRECT' && isCorrectChoice;

  const variants = {
    initial: { opacity: 0, y: 50 },
    enter: { opacity: 1, y: 0 },
    wiggle: {
      x: [0, -8, 8, -4, 4, 0],
      transition: { duration: 0.5 },
    },
    pulse: {
      scale: [1, 1.05, 1],
      transition: { duration: 0.7, repeat: Infinity, repeatType: 'mirror' as const },
    },
    disappear: { opacity: 0, scale: 0.8, transition: { duration: 0.3 } },
    selected: { scale: 0.95 },
  };

  let animate: string | string[] = 'enter';
  if (isWiggling) animate = 'wiggle';
  if (showHint) animate = 'pulse';
  if (isDisappearing) animate = 'disappear';
  if (phase === 'WAITING_FOR_CHOICE' && isSelected) animate = 'selected';


  return (
    <motion.button
      layoutId={isFlying ? layoutId : undefined}
      variants={variants}
      initial="initial"
      animate={animate}
      className="aspect-[2/1] w-full rounded-2xl flex items-center justify-center overflow-hidden shadow-lg transition-all duration-200 border-4 border-transparent"
      onClick={onClick}
      disabled={phase !== 'WAITING_FOR_CHOICE'}
    >
      {choice.assets?.realObjectImage && imageLoadState !== 'error' ? (
        <img
          src={choice.assets.realObjectImage}
          alt={choice.meaning}
          className="w-full h-full object-cover"
          onLoad={() => setImageLoadState('loaded')}
          onError={() => setImageLoadState('error')}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-5xl font-bold bg-gray-100">
          {choice.character}
        </div>
      )}
      {imageLoadState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-pulse text-4xl">📷</div>
        </div>
      )}
    </motion.button>
  );
}
