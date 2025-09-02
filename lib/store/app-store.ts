import { create } from 'zustand';
import { AgeGroup } from '@/types';

interface AppState {
  ageGroup: AgeGroup;
  setAgeGroup: (ageGroup: AgeGroup) => void;
}

export const useAppStore = create<AppState>((set) => ({
  ageGroup: null,
  setAgeGroup: (ageGroup) => set({ ageGroup }),
}));
