import { create } from 'zustand';
import type { AppState, Week } from './types';
import { todayStr, isYesterday } from './lib/date';

const STORAGE_KEY = 'ielts_island_data';

function load(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.weeks || !parsed.stats) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persist(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

// Flatten helper: get day by global index (1-based)
function dayCoords(weeks: Week[], globalDay: number): [number, number] | null {
  let count = 0;
  for (let w = 0; w < weeks.length; w++) {
    for (let d = 0; d < weeks[w].days.length; d++) {
      count++;
      if (count === globalDay) return [w, d];
    }
  }
  return null;
}

function totalDays(weeks: Week[]): number {
  return weeks.reduce((acc, w) => acc + w.days.length, 0);
}

interface Store {
  data: AppState | null;
  initialized: boolean;
  init: () => void;
  createPlan: (rawText: string, weeks: Week[]) => void;
  toggleQuest: (weekIdx: number, dayIdx: number, questIdx: number) => void;
  completeDay: (weekIdx: number, dayIdx: number, note: string) => void;
  resetPlan: () => void;
  totalDays: () => number;
}

export const useStore = create<Store>((set, get) => ({
  data: null,
  initialized: false,

  init: () => {
    const data = load();
    set({ data, initialized: true });
  },

  createPlan: (rawText, weeks) => {
    const data: AppState = {
      rawText,
      weeks,
      stats: {
        currentDay: 1,
        completedDays: 0,
        streak: 0,
        xp: 0,
        lastActiveDate: '',
      },
    };
    persist(data);
    set({ data });
  },

  toggleQuest: (weekIdx, dayIdx, questIdx) => {
    const data = get().data;
    if (!data) return;
    const next: AppState = structuredClone(data);
    const quest = next.weeks[weekIdx].days[dayIdx].quests[questIdx];
    if (quest.done) {
      quest.done = false;
      next.stats.xp = Math.max(0, next.stats.xp - quest.xp);
    } else {
      quest.done = true;
      next.stats.xp += quest.xp;
    }
    persist(next);
    set({ data: next });
  },

  completeDay: (weekIdx, dayIdx, note) => {
    const data = get().data;
    if (!data) return;
    const next: AppState = structuredClone(data);
    const day = next.weeks[weekIdx].days[dayIdx];
    if (day.completed) return;

    // mark remaining quests done and add their xp
    for (const q of day.quests) {
      if (!q.done) {
        q.done = true;
        next.stats.xp += q.xp;
      }
    }
    day.completed = true;
    day.note = note;
    next.stats.completedDays += 1;

    // streak logic
    const today = todayStr();
    const last = next.stats.lastActiveDate;
    if (last === today) {
      // already counted today — keep streak
      if (next.stats.streak === 0) next.stats.streak = 1;
    } else if (isYesterday(last)) {
      next.stats.streak += 1;
    } else {
      next.stats.streak = 1;
    }
    next.stats.lastActiveDate = today;

    // unlock next day (don't exceed total)
    const total = totalDays(next.weeks);
    if (next.stats.currentDay < total) {
      next.stats.currentDay += 1;
    } else {
      next.stats.currentDay = total;
    }

    persist(next);
    set({ data: next });
  },

  resetPlan: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    set({ data: null });
  },

  totalDays: () => {
    const data = get().data;
    return data ? totalDays(data.weeks) : 0;
  },
}));

export { dayCoords, totalDays };
