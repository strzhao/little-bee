'use client';

import Lottie from 'lottie-react';
import animationData from '@/public/assets/lottie/celebration-confetti.json';
import { useEffect } from 'react';

interface FullScreenCelebrationProps {
  onComplete: () => void;
}

export function FullScreenCelebration({ onComplete }: FullScreenCelebrationProps) {
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
