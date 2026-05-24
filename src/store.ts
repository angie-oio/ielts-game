import { create } from 'zustand';
import type { AppState, Week, IslandState } from './types';
import { todayStr, isYesterday } from './lib/date';
import { SHOP_MAP } from './lib/shopItems';
import {
  emptyGrid,
  footprint,
  canPlace,
  findAnchor,
  OCCUPIED,
  type Grid,
} from './lib/island';
import { getItemMeta } from './lib/shopItems';

const STORAGE_KEY = 'ielts_island';
const LEGACY_KEY = 'ielts_island_data';

function initialIsland(): IslandState {
  const grid = emptyGrid();
  grid[2][3] = 'tent'; // center-ish
  grid[5][0] = 'preset_tree'; // bottom-left
  return { grid, inventory: [], purchased: [] };
}

// Backfill missing fields on plans saved by an earlier version.
function migrate(parsed: AppState): AppState {
  const next = { ...parsed };
  if (next.stats.xpBalance === undefined) {
    next.stats.xpBalance = next.stats.xp ?? 0;
  }
  if (!next.island) {
    next.island = initialIsland();
  }
  if (next.onboarded === undefined) {
    next.onboarded = next.stats.completedDays > 0;
  }
  return next;
}

function load(): AppState | null {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.weeks || !parsed.stats) return null;
    return migrate(parsed);
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
  buyItem: (id: string) => boolean;
  placeItem: (id: string, r: number, c: number) => boolean;
  moveItem: (fromR: number, fromC: number, toR: number, toC: number) => boolean;
  pickUpItem: (r: number, c: number) => void;
  markOnboarded: () => void;
  resetPlan: () => void;
  totalDays: () => number;
}

export const useStore = create<Store>((set, get) => ({
  data: null,
  initialized: false,

  init: () => {
    const data = load();
    if (data) persist(data); // normalize storage key + migrations
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
        xpBalance: 0,
        lastActiveDate: '',
      },
      island: initialIsland(),
      onboarded: false,
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
      next.stats.xpBalance = Math.max(0, next.stats.xpBalance - quest.xp);
    } else {
      quest.done = true;
      next.stats.xp += quest.xp;
      next.stats.xpBalance += quest.xp;
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

    for (const q of day.quests) {
      if (!q.done) {
        q.done = true;
        next.stats.xp += q.xp;
        next.stats.xpBalance += q.xp;
      }
    }
    day.completed = true;
    day.note = note;
    next.stats.completedDays += 1;

    const today = todayStr();
    const last = next.stats.lastActiveDate;
    if (last === today) {
      if (next.stats.streak === 0) next.stats.streak = 1;
    } else if (isYesterday(last)) {
      next.stats.streak += 1;
    } else {
      next.stats.streak = 1;
    }
    next.stats.lastActiveDate = today;

    const total = totalDays(next.weeks);
    if (next.stats.currentDay < total) {
      next.stats.currentDay += 1;
    } else {
      next.stats.currentDay = total;
    }

    persist(next);
    set({ data: next });
  },

  buyItem: (id) => {
    const data = get().data;
    if (!data) return false;
    const item = SHOP_MAP[id];
    if (!item) return false;
    if (data.island.purchased.includes(id)) return false;
    if (data.stats.xpBalance < item.price) return false;
    const next: AppState = structuredClone(data);
    next.stats.xpBalance -= item.price;
    next.island.purchased.push(id);
    next.island.inventory.push(id);
    persist(next);
    set({ data: next });
    return true;
  },

  placeItem: (id, r, c) => {
    const data = get().data;
    if (!data) return false;
    const meta = getItemMeta(id);
    if (!meta) return false;
    const idx = data.island.inventory.indexOf(id);
    if (idx === -1) return false;
    const grid = data.island.grid as Grid;
    if (!canPlace(grid, r, c, meta.size)) return false;

    const next: AppState = structuredClone(data);
    const ng = next.island.grid as Grid;
    for (const [fr, fc] of footprint(r, c, meta.size)) {
      ng[fr][fc] = fr === r && fc === c ? id : OCCUPIED;
    }
    next.island.inventory.splice(idx, 1);
    persist(next);
    set({ data: next });
    return true;
  },

  moveItem: (fromR, fromC, toR, toC) => {
    const data = get().data;
    if (!data) return false;
    const grid = data.island.grid as Grid;
    const anchor = findAnchor(grid, fromR, fromC);
    if (!anchor) return false;
    const [ar, ac] = anchor;
    const id = grid[ar][ac]!;
    const meta = getItemMeta(id);
    if (!meta) return false;
    if (!canPlace(grid, toR, toC, meta.size, [ar, ac])) return false;

    const next: AppState = structuredClone(data);
    const ng = next.island.grid as Grid;
    // clear old footprint
    for (const [fr, fc] of footprint(ar, ac, meta.size)) ng[fr][fc] = null;
    // write new footprint
    for (const [fr, fc] of footprint(toR, toC, meta.size)) {
      ng[fr][fc] = fr === toR && fc === toC ? id : OCCUPIED;
    }
    persist(next);
    set({ data: next });
    return true;
  },

  pickUpItem: (r, c) => {
    const data = get().data;
    if (!data) return;
    const grid = data.island.grid as Grid;
    const anchor = findAnchor(grid, r, c);
    if (!anchor) return;
    const [ar, ac] = anchor;
    const id = grid[ar][ac]!;
    const meta = getItemMeta(id);
    if (!meta) return;

    const next: AppState = structuredClone(data);
    const ng = next.island.grid as Grid;
    for (const [fr, fc] of footprint(ar, ac, meta.size)) ng[fr][fc] = null;
    // preset items return nowhere (still purchasable items go back to inventory)
    if (SHOP_MAP[id]) next.island.inventory.push(id);
    persist(next);
    set({ data: next });
  },

  markOnboarded: () => {
    const data = get().data;
    if (!data) return;
    const next: AppState = { ...data, onboarded: true };
    persist(next);
    set({ data: next });
  },

  resetPlan: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_KEY);
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

export { totalDays };
