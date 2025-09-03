import { create } from 'zustand';
import { HanziCharacter } from '@/lib/hanzi-data-loader';

type GameState = 'LOADING' | 'PLAYING' | 'CELEBRATING';

interface ToddlerGameState {
  hanziQueue: HanziCharacter[];
  fullList: HanziCharacter[];
  currentCharacter: HanziCharacter | null;
  currentChoices: HanziCharacter[];
  gameState: GameState;
  score: number;
  lastResult: 'CORRECT' | 'INCORRECT' | null; // Track the last answer
  startGame: (hanziList: HanziCharacter[]) => void;
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
  gameState: 'LOADING',
  score: 0,
  lastResult: null,

  startGame: (hanziList) => {
    const shuffledList = shuffle(hanziList);
    set({
      fullList: hanziList, // Keep the original full list for generating choices
      hanziQueue: shuffledList,
      score: 0,
      lastResult: null,
    });
    get().nextRound();
  },

  selectAnswer: (selectedHanzi, updateProgress) => {
    const { currentCharacter } = get();
    const isCorrect = currentCharacter?.id === selectedHanzi.id;

    if (isCorrect) {
      // Record progress when the answer is correct
      if (currentCharacter) {
        updateProgress(currentCharacter.id);
      }

      set((state) => ({
        gameState: 'CELEBRATING',
        score: state.score + 1,
        lastResult: 'CORRECT',
      }));
    } else {
      // Set state for incorrect answer
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