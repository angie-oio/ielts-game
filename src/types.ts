export interface Quest {
  name: string;
  detail: string;
  xp: number;
  done: boolean;
}

export interface Day {
  title: string;
  subtitle: string;
  quests: Quest[];
  completed: boolean;
  note: string;
}

export interface Week {
  label: string;
  days: Day[];
}

export type ShopCategory = 'nature' | 'infrastructure' | 'building' | 'special';

export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  category: ShopCategory;
  price: number;
  size: [number, number]; // [width(cols), height(rows)]
  description: string;
  unlockCondition?: {
    type: 'streak' | 'completedDays' | 'totalDays';
    value: number;
  };
}

export interface Stats {
  currentDay: number;
  completedDays: number;
  streak: number;
  xp: number; // lifetime earned, only increases
  xpBalance: number; // spendable balance
  lastActiveDate: string;
}

export interface IslandState {
  grid: (string | null)[][]; // [row][col], ROWS x COLS
  inventory: string[]; // purchased, not yet placed
  purchased: string[]; // all purchased item ids
}

export interface AppState {
  rawText: string;
  weeks: Week[];
  stats: Stats;
  island: IslandState;
  onboarded?: boolean; // whether the first-completion shop hint was shown
}
