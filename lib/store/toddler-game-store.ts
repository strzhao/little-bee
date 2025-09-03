import { create } from 'zustand';
import { HanziCharacter } from '@/lib/hanzi-data-loader';
import { ToddlerGameData } from '@/lib/services/hanzi-service';

type GameState = 'LOADING' | 'PLAYING' | 'CELEBRATING';

interface ToddlerGameState {
  hanziQueue: HanziCharacter[];
  fullList: HanziCharacter[];
  currentCharacter: HanziCharacter | null;
  currentChoices: HanziCharacter[];
  explanations: Record<string, any> | null;
  gameState: GameState;
  score: number;
  lastResult: 'CORRECT' | 'INCORRECT' | null; // Track the last answer
  startGame: (gameData: ToddlerGameData) => void;
  // The `updateProgress` function is now passed as an argument
  selectAnswer: (
    selectedHanzi: HanziCharacter,
    updateProgress: (characterId: string) => void
  ) => boolean;
  nextRound: () => void;
  clearLastResult: () => void;
}

const shuffle = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

export const useToddlerGameStore = create<ToddlerGameState>((set, get) => ({
  hanziQueue: [],
  fullList: [],
  currentCharacter: null,
  currentChoices: [],
  explanations: null,
  gameState: 'LOADING',
  score: 0,
  lastResult: null,

  startGame: (gameData) => {
    const shuffledList = shuffle(gameData.characters);
    set({
      fullList: gameData.characters, // Keep the original full list for generating choices
      hanziQueue: shuffledList,
      explanations: gameData.explanations,
      score: 0,
      lastResult: null,
    });
    get().nextRound();
  },

  selectAnswer: (selectedHanzi, updateProgress) => {
    const { currentCharacter, score: currentScore } = get();
    const isCorrect = currentCharacter?.id === selectedHanzi.id;

    console.log('🎮 store.selectAnswer called:', {
      selectedHanziId: selectedHanzi.id,
      currentCharacterId: currentCharacter?.id,
      isCorrect,
      currentScore
    });

    if (isCorrect) {
      // Record progress when the answer is correct
      if (currentCharacter) {
        console.log('📞 Calling updateProgress for:', currentCharacter.id);
        updateProgress(currentCharacter.id);
      }

      console.log('🎯 Updating store state - score from', currentScore, 'to', currentScore + 1);
      set((state) => ({
        gameState: 'CELEBRATING',
        score: state.score + 1,
        lastResult: 'CORRECT',
      }));
      
      // 验证状态更新
      const newState = get();
      console.log('✅ Store state updated:', {
        newScore: newState.score,
        gameState: newState.gameState,
        lastResult: newState.lastResult
      });
    } else {
      // Set state for incorrect answer
      console.log('❌ Incorrect answer, setting lastResult to INCORRECT');
      set({ lastResult: 'INCORRECT' });
    }
    return isCorrect;
  },

  clearLastResult: () => {
    set({ lastResult: null });
  },

  nextRound: () => {
    const { hanziQueue, fullList } = get();
    const newQueue = [...hanziQueue];
    const nextCharacter = newQueue.shift();

    if (nextCharacter) {
      // 只选择一个干扰项，确保二选一
      const wrongAnswers = shuffle(
        fullList.filter((h) => h.id !== nextCharacter.id)
      ).slice(0, 1);
      const choices = shuffle([nextCharacter, ...wrongAnswers]);

      set({
        hanziQueue: newQueue,
        currentCharacter: nextCharacter,
        currentChoices: choices,
        gameState: 'PLAYING',
        lastResult: null, // 重置选择状态
      });
    } else {
      set({ gameState: 'LOADING' }); // Game over, reset to loading/initial state
    }
  },
}));