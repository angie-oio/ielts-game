import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { SHOP_ITEMS } from '../lib/shopItems';
import type { ShopCategory, ShopItem } from '../types';

const CATS: { key: ShopCategory | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'nature', label: '🌿自然' },
  { key: 'infrastructure', label: '🔧设施' },
  { key: 'building', label: '🏠建筑' },
  { key: 'special', label: '✨特殊' },
];

function condText(item: ShopItem): string {
  if (!item.unlockCondition) return '';
  const { type, value } = item.unlockCondition;
  if (type === 'streak') return `连续打卡 ${value} 天解锁`;
  if (type === 'completedDays') return `完成 ${value} 天解锁`;
  return `计划满 ${value} 天解锁`;
}

export default function Shop({
  showToast,
}: {
  showToast: (t: string) => void;
}) {
  const data = useStore((s) => s.data)!;
  const buyItem = useStore((s) => s.buyItem);
  const { xpBalance, streak, completedDays } = data.stats;
  const totalDays = useStore((s) => s.totalDays)();
  const purchased = data.island.purchased;

  const [cat, setCat] = useState<ShopCategory | 'all'>('all');
  const [detail, setDetail] = useState<ShopItem | null>(null);

  const isUnlocked = (item: ShopItem): boolean => {
    if (!item.unlockCondition) return true;
    const { type, value } = item.unlockCondition;
    if (type === 'streak') return streak >= value;
    if (type === 'completedDays') return completedDays >= value;
    return totalDays >= value;
  };

  const list = SHOP_ITEMS.filter((i) => cat === 'all' || i.category === cat);

  const handleBuy = (item: ShopItem) => {
    const ok = buyItem(item.id);
    if (ok) {
      setDetail(null);
      showToast(`🎉 获得 ${item.name}！`);
    } else {
      showToast('余额不够，再做几个任务吧 💪');
    }
  };

  return (
    <div>
      {/* shop banner */}
      <div className="bg-gradient-to-b from-amber/90 to-amber px-5 pb-4 pt-3 text-center">
        <div className="text-lg font-extrabold text-white drop-shadow">
          狸猫商店 🦝
        </div>
        <div className="mt-1 inline-block rounded-full bg-white/25 px-4 py-1 text-sm font-bold text-white backdrop-blur">
          💰 {xpBalance} xp
        </div>
      </div>

      {/* category tabs */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
        {CATS.map((c) => (
          <button
            key={c.key}
            onClick={() => setCat(c.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
              cat === c.key
                ? 'bg-forest text-white shadow-soft'
                : 'border border-line bg-white text-gray-500'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* product grid */}
      <div className="grid grid-cols-2 gap-3 px-4 pb-4">
        {list.map((item) => {
          const owned = purchased.includes(item.id);
          const unlocked = isUnlocked(item);
          const affordable = xpBalance >= item.price;
          const locked = !unlocked;
          return (
            <button
              key={item.id}
              onClick={() => !locked && !owned && setDetail(item)}
              disabled={locked || owned}
              className={`relative flex flex-col items-center rounded-card border border-line bg-white p-3 text-center shadow-soft transition active:scale-[0.98] ${
                locked ? 'opacity-60' : ''
              }`}
            >
              <span className="text-4xl">{item.emoji}</span>
              <span className="mt-1 text-sm font-bold text-gray-800">
                {item.name}
              </span>
              {owned ? (
                <span className="mt-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-400">
                  ✅ 已拥有
                </span>
              ) : locked ? (
                <span className="mt-1 text-[10px] font-bold text-gray-400">
                  🔒 {condText(item)}
                </span>
              ) : (
                <span
                  className={`mt-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                    affordable
                      ? 'bg-amber/15 text-amber'
                      : 'bg-red-50 text-red-400'
                  }`}
                >
                  💰 {item.price}xp
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* detail sheet */}
      <AnimatePresence>
        {detail && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetail(null)}
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
              <div className="text-center">
                <div className="text-6xl">{detail.emoji}</div>
                <div className="mt-2 text-xl font-extrabold text-gray-800">
                  {detail.name}
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {detail.description}
                </div>
                <div className="mt-2 inline-block rounded-full bg-cream px-3 py-1 text-xs font-bold text-gray-500">
                  占地 {detail.size[0]}×{detail.size[1]}
                </div>
              </div>
              <button
                onClick={() => handleBuy(detail)}
                disabled={xpBalance < detail.price}
                className="mt-5 w-full rounded-card bg-forest py-4 text-base font-extrabold text-white active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400"
              >
                购买 -{detail.price}xp 💰
              </button>
              <button
                onClick={() => setDetail(null)}
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
