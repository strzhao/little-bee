'use client';

import { useEffect } from 'react';
import { useToddlerGameStore } from '@/lib/store/toddler-game-store';
import { getToddlerGameSequence } from '@/lib/services/hanzi-service';
import { GameStage } from './GameStage';

export function ToddlerGamePage() {
  const { gameState, startGame } = useToddlerGameStore();

  useEffect(() => {
    // Initialize the game when the component mounts
    async function initGame() {
      const gameData = await getToddlerGameSequence();
      if (gameData.characters.length > 0) {
        startGame(gameData);
      }
    }
    initGame();
  }, [startGame]);

  if (gameState === 'LOADING') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
        <h1 className="text-3xl font-bold animate-pulse">游戏加载中...</h1>
      </div>
    );
  }

  return <GameStage />;
}