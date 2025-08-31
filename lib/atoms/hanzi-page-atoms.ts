import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// 页面模式类型定义
export type HanziPageMode = 'home' | 'detail' | 'transition';

// 类别配置接口（从首页复用）
export interface CategoryConfig {
  name: string;
  emoji: string;
  count: number;
  bgColor: string;
  available: boolean;
  learnedCount: number;
}

// 过渡数据接口
export interface TransitionData {
  category: CategoryConfig | null;
  clickPosition: { x: number; y: number } | null;
  isReturning?: boolean;
}

// 页面状态接口
export interface HanziPageState {
  mode: HanziPageMode;
  selectedCharacterId: string | null;
  transitionData: TransitionData;
}

// 默认页面状态
const defaultPageState: HanziPageState = {
  mode: 'home',
  selectedCharacterId: null,
  transitionData: {
    category: null,
    clickPosition: null,
    isReturning: false
  }
};

// 页面状态原子（持久化到 sessionStorage）
export const hanziPageStateAtom = atomWithStorage<HanziPageState>(
  'hanzi-page-state',
  defaultPageState,
  {
    getItem: (key) => {
      if (typeof window === 'undefined') return null;
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    },
    setItem: (key, value) => {
      if (typeof window === 'undefined') return;
      sessionStorage.setItem(key, JSON.stringify(value));
    },
    removeItem: (key) => {
      if (typeof window === 'undefined') return;
      sessionStorage.removeItem(key);
    }
  }
);

// 页面模式原子（派生状态）
export const pageModeAtom = atom(
  (get) => {
    const state = get(hanziPageStateAtom);
    return state?.mode || defaultPageState.mode;
  },
  (get, set, newMode: HanziPageMode) => {
    const currentState = get(hanziPageStateAtom) || defaultPageState;
    console.log('🔄 [Atom] pageModeAtom 状态变化:', {
      from: currentState.mode,
      to: newMode,
      timestamp: new Date().toISOString(),
      stack: new Error().stack?.split('\n').slice(1, 4).join('\n')
    });
    set(hanziPageStateAtom, {
      ...currentState,
      mode: newMode
    });
  }
);

// 选中汉字ID原子（派生状态）
export const selectedCharacterIdAtom = atom(
  (get) => {
    const state = get(hanziPageStateAtom);
    return state?.selectedCharacterId || defaultPageState.selectedCharacterId;
  },
  (get, set, newId: string | null) => {
    const currentState = get(hanziPageStateAtom) || defaultPageState;
    console.log('🔄 [Atom] selectedCharacterIdAtom 状态变化:', {
      from: currentState.selectedCharacterId,
      to: newId,
      timestamp: new Date().toISOString(),
      stack: new Error().stack?.split('\n').slice(1, 4).join('\n')
    });
    set(hanziPageStateAtom, {
      ...currentState,
      selectedCharacterId: newId
    });
  }
);

// 过渡数据原子（派生状态）
export const transitionDataAtom = atom(
  (get) => {
    const state = get(hanziPageStateAtom);
    return state?.transitionData || defaultPageState.transitionData;
  },
  (get, set, newData: Partial<TransitionData>) => {
    const currentState = get(hanziPageStateAtom) || defaultPageState;
    set(hanziPageStateAtom, {
      ...currentState,
      transitionData: {
        ...currentState.transitionData,
        ...newData
      }
    });
  }
);

// 页面导航动作原子
export const navigateToDetailAtom = atom(
  null,
  (get, set, { characterId, category, clickPosition }: {
    characterId: string;
    category?: CategoryConfig;
    clickPosition?: { x: number; y: number };
  }) => {
    // 先设置过渡状态
    set(hanziPageStateAtom, {
      mode: 'transition',
      selectedCharacterId: characterId,
      transitionData: {
        category: category || null,
        clickPosition: clickPosition || null,
        isReturning: false
      }
    });
    
    // 延迟切换到详情页（等待过渡动画）
    setTimeout(() => {
      set(pageModeAtom, 'detail');
    }, 300);
  }
);

// 返回首页动作原子
export const navigateToHomeAtom = atom(
  null,
  (get, set) => {
    const currentState = get(hanziPageStateAtom) || defaultPageState;
    
    // 设置返回过渡状态
    set(hanziPageStateAtom, {
      ...currentState,
      mode: 'transition',
      transitionData: {
        ...currentState.transitionData,
        isReturning: true
      }
    });
    
    // 延迟切换到首页（等待过渡动画）
    setTimeout(() => {
      set(hanziPageStateAtom, {
        mode: 'home',
        selectedCharacterId: null,
        transitionData: {
          category: null,
          clickPosition: null,
          isReturning: false
        }
      });
    }, 500);
  }
);