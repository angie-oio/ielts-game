import { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Day } from '../types';
import { useStore } from '../store';

export type DayStatus = 'today' | 'completed' | 'locked' | 'upcoming';

interface Props {
  day: Day;
  weekIdx: number;
  dayIdx: number;
  globalDay: number;
  status: DayStatus;
  expanded: boolean;
  onToggleExpand: () => void;
  onRequestComplete: () => void;
  showReward: (text: string) => void;
}

const DayCard = forwardRef<HTMLDivElement, Props>(function DayCard(
  {
    day,
    weekIdx,
    dayIdx,
    globalDay,
    status,
    expanded,
    onToggleExpand,
    onRequestComplete,
    showReward,
  },
  ref
) {
  const toggleQuest = useStore((s) => s.toggleQuest);

  const doneCount = day.quests.filter((q) => q.done).length;
  const total = day.quests.length;
  const allDone = doneCount === total && total > 0;
  const locked = status === 'locked';

  const badge =
    status === 'completed' ? (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-white">
        ✓
      </span>
    ) : status === 'today' ? (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-sm font-extrabold text-white">
        {globalDay}
      </span>
    ) : (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-400">
        {globalDay}
      </span>
    );

  const statusTag =
    status === 'today' ? (
      <span className="rounded-full bg-amber/15 px-3 py-1 text-xs font-bold text-amber">
        今天 ✦
      </span>
    ) : status === 'completed' ? (
      <span className="rounded-full bg-forest/15 px-3 py-1 text-xs font-bold text-forest">
        ✓ 完成
      </span>
    ) : (
      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-400">
        🔒
      </span>
    );

  return (
    <div
      ref={ref}
      className={`rounded-card border border-line bg-white shadow-soft transition ${
        locked ? 'opacity-55' : ''
      }`}
    >
      <button
        onClick={() => !locked && onToggleExpand()}
        disabled={locked}
        className="flex w-full items-center gap-3 p-4 text-left"
        style={{ minHeight: 64 }}
      >
        {badge}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-extrabold text-gray-800">
            Day {globalDay}
            {day.subtitle ? ` · ${day.subtitle}` : ''}
          </div>
          <div className="truncate text-xs text-gray-400">{day.title}</div>
        </div>
        {statusTag}
      </button>

      <AnimatePresence initial={false}>
        {expanded && !locked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {/* progress */}
              <div className="mb-3 flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-forest transition-all"
                    style={{
                      width: total ? `${(doneCount / total) * 100}%` : '0%',
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-500">
                  {doneCount}/{total}
                </span>
              </div>

              {/* quests */}
              <div className="space-y-2">
                {day.quests.map((q, qi) => (
                  <button
                    key={qi}
                    onClick={() => {
                      const wasDone = q.done;
                      toggleQuest(weekIdx, dayIdx, qi);
                      if (!wasDone) showReward(`+${q.xp}xp ✦`);
                    }}
                    className="flex w-full items-start gap-3 rounded-card bg-cream p-3 text-left active:scale-[0.99]"
                  >
                    <span
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs text-white transition-colors duration-200"
                      style={{
                        backgroundColor: q.done ? '#5BB89A' : 'transparent',
                        borderColor: q.done ? '#5BB89A' : '#CBD5E1',
                      }}
                    >
                      {q.done ? '✓' : ''}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-sm font-semibold ${
                          q.done
                            ? 'text-forest/60 line-through'
                            : 'text-gray-800'
                        }`}
                      >
                        {q.name}
                      </span>
                      {q.detail && (
                        <span className="mt-0.5 block text-xs text-gray-400">
                          {q.detail}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 rounded-full bg-amber/15 px-2 py-0.5 text-xs font-bold text-amber">
                      {q.xp}xp
                    </span>
                  </button>
                ))}
              </div>

              {/* action button */}
              {day.completed ? (
                <button
                  disabled
                  className="mt-3 w-full rounded-card bg-gray-100 py-3 text-sm font-bold text-gray-400"
                >
                  ✓ 已完成
                </button>
              ) : allDone ? (
                <button
                  onClick={onRequestComplete}
                  className="mt-3 w-full rounded-card bg-forest py-3 text-sm font-extrabold text-white active:scale-[0.98]"
                >
                  🎉 完成今日关卡！
                </button>
              ) : (
                <button
                  onClick={onRequestComplete}
                  className="mt-3 w-full rounded-card border border-line bg-white py-3 text-sm font-bold text-gray-600 active:scale-[0.98]"
                >
                  📝 记录完成情况
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default DayCard;
