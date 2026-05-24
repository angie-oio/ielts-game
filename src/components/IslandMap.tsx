import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { ROWS, COLS, OCCUPIED, findAnchor, placedCount, type Grid } from '../lib/island';
import { getItemMeta, PRESET_IDS } from '../lib/shopItems';

export default function IslandMap({
  showToast,
}: {
  showToast: (t: string) => void;
}) {
  const data = useStore((s) => s.data)!;
  const placeItem = useStore((s) => s.placeItem);
  const moveItem = useStore((s) => s.moveItem);
  const pickUpItem = useStore((s) => s.pickUpItem);

  const grid = data.island.grid as Grid;
  const inventory = data.island.inventory;
  const level = Math.floor(data.stats.completedDays / 5) + 1;

  const [edit, setEdit] = useState(false);
  const [selectedInv, setSelectedInv] = useState<number | null>(null);
  const [moving, setMoving] = useState<[number, number] | null>(null);
  const [menuFor, setMenuFor] = useState<[number, number] | null>(null);
  const [justPlaced, setJustPlaced] = useState<string>('');

  const reset = () => {
    setSelectedInv(null);
    setMoving(null);
    setMenuFor(null);
  };

  const handleCell = (r: number, c: number) => {
    if (!edit) return;
    const anchor = findAnchor(grid, r, c);

    if (anchor) {
      const id = grid[anchor[0]][anchor[1]]!;
      // tapping an occupied cell while trying to place/move = blocked
      if (selectedInv !== null || moving) {
        showToast('这里已经有东西啦，换个空格吧');
        return;
      }
      if (PRESET_IDS.has(id)) {
        showToast('这是初始装饰，没法移动哦');
        return;
      }
      setMenuFor(anchor);
      return;
    }

    // empty cell
    if (selectedInv !== null) {
      const id = inventory[selectedInv];
      const ok = placeItem(id, r, c);
      if (ok) {
        setJustPlaced(`${r},${c}`);
        reset();
      } else {
        showToast('空间不够，请先清理相邻格子');
      }
      return;
    }
    if (moving) {
      const ok = moveItem(moving[0], moving[1], r, c);
      if (ok) {
        setJustPlaced(`${r},${c}`);
        reset();
      } else {
        showToast('空间不够，请先清理相邻格子');
      }
    }
  };

  // collect anchors to render
  const anchors: { id: string; r: number; c: number; w: number; h: number }[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const v = grid[r][c];
      if (v && v !== OCCUPIED) {
        const meta = getItemMeta(v);
        if (meta) anchors.push({ id: v, r, c, w: meta.size[0], h: meta.size[1] });
      }
    }
  }

  return (
    <div className="px-4 pt-4">
      {/* sea -> sand -> grass layered frame */}
      <div className="relative overflow-hidden rounded-card shadow-soft">
        <div className="sea-bg p-3">
          <div className="rounded-[12px] bg-[#F5DEB3] p-2">
            <div
              className="relative grid w-full rounded-[8px] bg-[#7CC87A]"
              style={{
                gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                aspectRatio: `${COLS} / ${ROWS}`,
              }}
            >
              {/* background cells / tap targets */}
              {Array.from({ length: ROWS * COLS }).map((_, i) => {
                const r = Math.floor(i / COLS);
                const c = i % COLS;
                return (
                  <button
                    key={`bg-${i}`}
                    onClick={() => handleCell(r, c)}
                    disabled={!edit}
                    style={{ gridColumn: c + 1, gridRow: r + 1 }}
                    className={`m-[1px] rounded-[4px] ${
                      edit ? 'border border-dashed border-white/50' : ''
                    } ${
                      edit && (selectedInv !== null || moving)
                        ? 'active:bg-white/30'
                        : ''
                    }`}
                  />
                );
              })}

              {/* items */}
              {anchors.map(({ id, r, c, w, h }) => {
                const meta = getItemMeta(id)!;
                const key = `${r},${c}`;
                const big = Math.max(w, h) > 1;
                return (
                  <motion.button
                    key={`it-${key}-${id}`}
                    initial={
                      justPlaced === key
                        ? { scale: 0 }
                        : false
                    }
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                    onClick={() => handleCell(r, c)}
                    disabled={!edit}
                    style={{
                      gridColumn: `${c + 1} / span ${w}`,
                      gridRow: `${r + 1} / span ${h}`,
                    }}
                    className={`z-10 m-[1px] flex items-center justify-center rounded-[6px] ${
                      moving && moving[0] === r && moving[1] === c
                        ? 'bg-white/60 ring-2 ring-forest'
                        : ''
                    }`}
                  >
                    <span
                      className="leading-none"
                      style={{ fontSize: big ? '2rem' : '1.5rem' }}
                    >
                      {meta.emoji}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* info bar */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          ['🏝️', '岛屿等级', `Lv.${level}`],
          ['📦', '已放置', `${placedCount(grid)}/${ROWS * COLS}`],
          ['🎒', '背包', `${inventory.length}`],
        ].map(([icon, label, val], i) => (
          <div
            key={i}
            className="rounded-card border border-line bg-white p-2 text-center shadow-soft"
          >
            <div className="text-lg">{icon}</div>
            <div className="text-sm font-extrabold text-forest">{val}</div>
            <div className="text-[10px] text-gray-400">{label}</div>
          </div>
        ))}
      </div>

      {!edit ? (
        <button
          onClick={() => setEdit(true)}
          className="mt-3 w-full rounded-card bg-forest py-3 text-sm font-extrabold text-white shadow-soft active:scale-[0.98]"
        >
          编辑岛屿 ✏️
        </button>
      ) : (
        <button
          onClick={() => {
            setEdit(false);
            reset();
          }}
          className="mt-3 w-full rounded-card bg-amber py-3 text-sm font-extrabold text-white shadow-soft active:scale-[0.98]"
        >
          完成编辑 ✓
        </button>
      )}

      {/* edit hint + inventory bar */}
      <AnimatePresence>
        {edit && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3"
          >
            <div className="mb-2 text-center text-xs font-bold text-amber">
              编辑中… {moving ? '点击空格移动物品' : selectedInv !== null ? '点击空格放置物品' : '点物品栏选物品 / 点岛上物品可移动或收回'}
            </div>
            {inventory.length === 0 ? (
              <div className="rounded-card border border-dashed border-line bg-cream p-4 text-center text-xs text-gray-400">
                背包是空的，去 🛒 商店买点装饰吧～
              </div>
            ) : (
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                {inventory.map((id, i) => {
                  const meta = getItemMeta(id)!;
                  const sel = selectedInv === i;
                  return (
                    <button
                      key={`inv-${i}`}
                      onClick={() => {
                        setMoving(null);
                        setMenuFor(null);
                        setSelectedInv(sel ? null : i);
                      }}
                      className={`flex w-16 shrink-0 flex-col items-center gap-0.5 rounded-card border p-2 ${
                        sel
                          ? 'border-forest bg-forest/10'
                          : 'border-line bg-white'
                      }`}
                    >
                      <span className="text-2xl">{meta.emoji}</span>
                      <span className="truncate text-[10px] text-gray-500">
                        {meta.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* action menu sheet */}
      <AnimatePresence>
        {menuFor && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuFor(null)}
              className="fixed inset-0 z-40 bg-black/30"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-app rounded-t-[24px] bg-white p-5 pb-8 shadow-soft safe-bottom"
            >
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-200" />
              <div className="mb-4 flex items-center justify-center gap-2 text-lg font-extrabold text-gray-800">
                <span className="text-2xl">
                  {getItemMeta(grid[menuFor[0]][menuFor[1]]!)?.emoji}
                </span>
                {getItemMeta(grid[menuFor[0]][menuFor[1]]!)?.name}
              </div>
              <button
                onClick={() => {
                  setMoving(menuFor);
                  setSelectedInv(null);
                  setMenuFor(null);
                }}
                className="w-full rounded-card bg-forest py-3 text-sm font-extrabold text-white active:scale-[0.98]"
              >
                移动 ↔️
              </button>
              <button
                onClick={() => {
                  pickUpItem(menuFor[0], menuFor[1]);
                  setMenuFor(null);
                }}
                className="mt-2 w-full rounded-card border border-line bg-white py-3 text-sm font-bold text-gray-600 active:scale-[0.98]"
              >
                收回背包 🎒
              </button>
              <button
                onClick={() => setMenuFor(null)}
                className="mt-2 w-full py-2 text-sm font-semibold text-gray-400"
              >
                取消
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
