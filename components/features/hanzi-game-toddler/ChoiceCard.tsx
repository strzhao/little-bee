'use client';

import { HanziCharacter } from '@/lib/hanzi-data-loader';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChoiceCardProps {
  hanzi: HanziCharacter;
  isCorrect: boolean;
  onSelect: (selectedHanzi: HanziCharacter) => boolean;
}

export function ChoiceCard({ hanzi, isCorrect, onSelect }: ChoiceCardProps) {
  const [wasClicked, setWasClicked] = useState(false);
  const [isWrong, setIsWrong] = useState(false);

  const handleClick = () => {
    if (wasClicked) return; // Prevent multiple clicks

    const correct = onSelect(hanzi);
    setWasClicked(true);

    if (!correct) {
      setIsWrong(true);
      // Reset the shake animation after it plays
      setTimeout(() => {
        setIsWrong(false);
        setWasClicked(false); // Allow user to try again
      }, 500);
    }
    // If correct, the parent component will switch to 'CELEBRATING' state
  };

  return (
    <motion.div
      onClick={handleClick}
      className="group cursor-pointer rounded-2xl border-2 bg-white shadow-md transition-all duration-300 hover:shadow-xl"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        borderColor: wasClicked 
          ? (isCorrect ? 'rgb(34 197 94)' : 'rgb(239 68 68)') 
          : 'rgb(229 231 235)',
        backgroundColor: wasClicked && isCorrect ? 'rgb(240 253 244)' : 'white'
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <AnimatePresence>
        {isWrong && (
          <motion.div
            initial={{ scale: 1 }}
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, -5, 0, 5, 0]
            }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 rounded-2xl bg-red-100/50"
          />
        )}
      </AnimatePresence>
      
      <img
        src={hanzi.assets.realObjectImage}
        alt={hanzi.meaning}
        className="aspect-square w-full rounded-2xl object-cover p-2"
      />
      
      <AnimatePresence>
        {wasClicked && isCorrect && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-2 -right-2"
          >
            <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              ✓
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
