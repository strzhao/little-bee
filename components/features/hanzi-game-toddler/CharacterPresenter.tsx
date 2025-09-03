
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { HanziCharacter } from '@/lib/hanzi-data-loader';
import { GamePhase } from './GameStage';

interface CharacterPresenterProps {
  character: HanziCharacter;
  phase: GamePhase;
  layoutId: string;
  pinyin?: string;
}

export function CharacterPresenter({ character, phase, layoutId, pinyin }: CharacterPresenterProps) {
  return (
    <div className="relative w-full max-w-[300px] aspect-square">
      <AnimatePresence>
        {pinyin && (
          <motion.div
            key="pinyin"
            className="absolute -top-4 left-0 right-0 text-center text-2xl font-semibold text-gray-600"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {pinyin}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        layoutId={layoutId}
        className="w-full h-full flex items-center justify-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <motion.div
          key="character"
          className="text-9xl font-hanzi-kaishu text-gray-800"
        >
          {character.character}
        </motion.div>
      </motion.div>
    </div>
  );
}
