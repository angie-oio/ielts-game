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

export interface Stats {
  currentDay: number;
  completedDays: number;
  streak: number;
  xp: number;
  lastActiveDate: string;
}

export interface AppState {
  rawText: string;
  weeks: Week[];
  stats: Stats;
}
