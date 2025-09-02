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
  startGame: (hanziList: HanziCharacter[]) => void;
  selectAnswer: (selectedHanzi: HanziCharacter) => boolean;
  nextRound: () => void;
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

  startGame: (hanziList) => {
    const shuffledList = shuffle(hanziList);
    set({ 
      fullList: hanziList, // Keep the original full list for generating choices
      hanziQueue: shuffledList, 
      score: 0 
    });
    get().nextRound();
  },

  selectAnswer: (selectedHanzi) => {
    const { currentCharacter } = get();
    const isCorrect = currentCharacter?.id === selectedHanzi.id;

    if (isCorrect) {
      set((state) => ({
        gameState: 'CELEBRATING',
        score: state.score + 1,
      }));
    }
    return isCorrect;
  },

  nextRound: () => {
    const { hanziQueue, fullList } = get();
    const newQueue = [...hanziQueue];
    const nextCharacter = newQueue.shift();

    if (nextCharacter) {
      const wrongAnswers = shuffle(
        fullList.filter((h) => h.id !== nextCharacter.id)
      ).slice(0, 2);
      const choices = shuffle([nextCharacter, ...wrongAnswers]);

      set({
        hanziQueue: newQueue,
        currentCharacter: nextCharacter,
        currentChoices: choices,
        gameState: 'PLAYING',
      });
    } else {
      set({ gameState: 'LOADING' }); // Game over, reset to loading/initial state
    }
  },
}));