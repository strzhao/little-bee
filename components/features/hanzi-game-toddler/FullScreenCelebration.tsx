'use client';

import Lottie from 'lottie-react';
import animationData from '@/public/assets/lottie/celebration-confetti.json';
import { useEffect } from 'react';

interface FullScreenCelebrationProps {
  onComplete: () => void;
}

// Consider making this path configurable if different celebrations need different sounds
const SUCCESS_SOUND_PATH = '/assets/audio/success.mp3'; 

export function FullScreenCelebration({ onComplete }: FullScreenCelebrationProps) {
  useEffect(() => {
    const audio = new Audio(SUCCESS_SOUND_PATH);
    audio.play().catch(err => console.error("Failed to play success sound:", err));
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      <Lottie
        animationData={animationData}
        loop={false}
        onComplete={onComplete}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
