import { getItemMeta } from './shopItems';

export const ROWS = 6;
export const COLS = 8;
export const OCCUPIED = '#OCC#'; // sentinel for secondary cells of multi-cell items

export type Grid = (string | null)[][];

export function emptyGrid(): Grid {
  return Array.from({ length: ROWS }, () => Array<string | null>(COLS).fill(null));
}

// Footprint cells for an anchor at (r,c) with size [w,h].
export function footprint(
  r: number,
  c: number,
  size: [number, number]
): [number, number][] {
  const [w, h] = size;
  const cells: [number, number][] = [];
  for (let dr = 0; dr < h; dr++) {
    for (let dc = 0; dc < w; dc++) {
      cells.push([r + dr, c + dc]);
    }
  }
  return cells;
}

function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < ROWS && c >= 0 && c < COLS;
}

// Find the anchor (top-left) coords of whatever item covers (r,c). null if empty.
export function findAnchor(grid: Grid, r: number, c: number): [number, number] | null {
  const v = grid[r]?.[c];
  if (!v) return null;
  if (v !== OCCUPIED) return [r, c];
  // scan upward/leftward for the anchor whose footprint covers (r,c)
  for (let ar = r; ar >= 0; ar--) {
    for (let ac = c; ac >= 0; ac--) {
      const cell = grid[ar][ac];
      if (cell && cell !== OCCUPIED) {
        const meta = getItemMeta(cell);
        if (!meta) continue;
        const covers = footprint(ar, ac, meta.size).some(
          ([fr, fc]) => fr === r && fc === c
        );
        if (covers) return [ar, ac];
      }
    }
  }
  return null;
}

// Can an item of given size be placed with anchor at (r,c)?
// ignore: optional anchor coords of an item to treat as empty (for moving in place).
export function canPlace(
  grid: Grid,
  r: number,
  c: number,
  size: [number, number],
  ignore?: [number, number]
): boolean {
  let ignoreCells: Set<string> | null = null;
  if (ignore) {
    const meta = grid[ignore[0]]?.[ignore[1]];
    if (meta && meta !== OCCUPIED) {
      const m = getItemMeta(meta);
      if (m) {
        ignoreCells = new Set(
          footprint(ignore[0], ignore[1], m.size).map(([fr, fc]) => `${fr},${fc}`)
        );
      }
    }
  }
  for (const [fr, fc] of footprint(r, c, size)) {
    if (!inBounds(fr, fc)) return false;
    const occupied = grid[fr][fc] !== null;
    if (occupied && !(ignoreCells && ignoreCells.has(`${fr},${fc}`))) {
      return false;
    }
  }
  return true;
}

export function placedCount(grid: Grid): number {
  let n = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell && cell !== OCCUPIED) n++;
    }
  }
  return n;
}
