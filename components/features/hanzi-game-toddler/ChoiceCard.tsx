'use client';

import { HanziCharacter } from '@/lib/hanzi-data-loader';
import { useState } from 'react';

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

  const animationClass = isWrong ? 'animate-shake' : '';
  const borderClass = wasClicked && isCorrect ? 'border-green-500 border-4' : 'border-gray-200';

  return (
    <div
      onClick={handleClick}
      className={`group cursor-pointer rounded-2xl border bg-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl ${borderClass} ${animationClass}`}
    >
      <img
        src={hanzi.assets.realObjectImage}
        alt={hanzi.meaning}
        className="aspect-square w-full rounded-2xl object-cover p-2"
      />
    </div>
  );
}
