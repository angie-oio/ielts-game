import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import DayCard, { type DayStatus } from '../components/DayCard';
import CompleteSheet from '../components/CompleteSheet';
import RewardBubbles, { type Bubble } from '../components/RewardBubble';

type Tab = 'quests' | 'plan' | 'island';

interface FlatDay {
  weekIdx: number;
  dayIdx: number;
  globalDay: number;
}

export default function Game() {
  const data = useStore((s) => s.data)!;
  const completeDay = useStore((s) => s.completeDay);
  const resetPlan = useStore((s) => s.resetPlan);
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('quests');
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const bubbleId = useRef(0);

  const showReward = (text: string) => {
    const id = ++bubbleId.current;
    setBubbles((b) => [...b, { id, text }]);
    setTimeout(() => {
      setBubbles((b) => b.filter((x) => x.id !== id));
    }, 2000);
  };

  // flatten days with global indices
  const flat: FlatDay[] = useMemo(() => {
    const out: FlatDay[] = [];
    let g = 0;
    data.weeks.forEach((w, wi) =>
      w.days.forEach((_, di) => {
        g++;
        out.push({ weekIdx: wi, dayIdx: di, globalDay: g });
      })
    );
    return out;
  }, [data.weeks]);

  const totalDays = flat.length;
  const currentWeekIdx = useMemo(() => {
    const cur = flat.find((f) => f.globalDay === data.stats.currentDay);
    return cur ? cur.weekIdx : 0;
  }, [flat, data.stats.currentDay]);

  return (
    <div className="relative min-h-full pb-24">
      <RewardBubbles bubbles={bubbles} />

      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-b from-sky to-forest px-5 pb-6 pt-[max(16px,env(safe-area-inset-top))]">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-extrabold text-white drop-shadow">
              雅思岛 🌿
            </h1>
            <div className="flex gap-2">
              <span className="rounded-full bg-white/25 px-3 py-1 text-sm font-bold text-white backdrop-blur">
                🔥 {data.stats.streak}
              </span>
              <span className="rounded-full bg-white/25 px-3 py-1 text-sm font-bold text-white backdrop-blur">
                ⭐ {data.stats.xp}
              </span>
            </div>
          </div>
        </div>
        <svg
          viewBox="0 0 480 60"
          className="-mt-1 block h-[60px] w-full"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0,30 Q120,0 240,24 T480,18 L480,60 L0,60 Z"
            fill="#5BB89A"
          />
          <ellipse cx="240" cy="56" rx="150" ry="20" fill="#7BC97F" />
        </svg>
      </div>

      {tab === 'quests' && (
        <QuestsTab
          flat={flat}
          currentWeekIdx={currentWeekIdx}
          showReward={showReward}
          onComplete={(wi, di, note, gd, crossWeek, nextWeek) => {
            completeDay(wi, di, note);
            showReward(`🎉 Day ${gd} 完成！`);
            if (crossWeek) {
              // handled inside QuestsTab via state; nothing extra here
            }
            void nextWeek;
          }}
        />
      )}

      {tab === 'plan' && (
        <PlanTab
          rawText={data.rawText}
          completedDays={data.stats.completedDays}
          totalDays={totalDays}
          onReset={() => {
            if (
              window.confirm(
                '确定要重新输入计划吗？当前进度会全部清空，无法恢复哦。'
              )
            ) {
              resetPlan();
              navigate('/setup', { replace: true });
            }
          }}
        />
      )}

      {tab === 'island' && (
        <IslandTab
          completedDays={data.stats.completedDays}
          streak={data.stats.streak}
          xp={data.stats.xp}
        />
      )}

      {/* Bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-app justify-around border-t border-line bg-white/95 backdrop-blur safe-bottom">
        {(
          [
            ['quests', '📋', '关卡'],
            ['plan', '📖', '计划'],
            ['island', '🏝️', '我的岛'],
          ] as [Tab, string, string][]
        ).map(([key, icon, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex flex-1 flex-col items-center gap-0.5 py-2"
            style={{ minHeight: 56 }}
          >
            <span className="text-xl">{icon}</span>
            <span
              className={`text-xs font-bold ${
                tab === key ? 'text-forest' : 'text-gray-400'
              }`}
            >
              {label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}

/* ---------- Quests Tab ---------- */
function QuestsTab({
  flat,
  currentWeekIdx,
  showReward,
  onComplete,
}: {
  flat: FlatDay[];
  currentWeekIdx: number;
  showReward: (t: string) => void;
  onComplete: (
    wi: number,
    di: number,
    note: string,
    gd: number,
    crossWeek: boolean,
    nextWeek: number
  ) => void;
}) {
  const data = useStore((s) => s.data)!;
  const { weeks, stats } = data;
  const totalDays = flat.length;

  const [selectedWeek, setSelectedWeek] = useState(currentWeekIdx);
  const [expandedDay, setExpandedDay] = useState(stats.currentDay);
  const [sheet, setSheet] = useState<{
    wi: number;
    di: number;
    gd: number;
  } | null>(null);

  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // keep selected week / expansion synced to current day on mount & when day advances
  useEffect(() => {
    setSelectedWeek(currentWeekIdx);
    setExpandedDay(stats.currentDay);
  }, [currentWeekIdx, stats.currentDay]);

  // auto-scroll to today's card
  useEffect(() => {
    const el = cardRefs.current[stats.currentDay];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [stats.currentDay, selectedWeek]);

  const statusFor = (gd: number, completed: boolean): DayStatus => {
    if (completed) return 'completed';
    if (gd === stats.currentDay) return 'today';
    if (gd < stats.currentDay) return 'completed';
    return 'locked';
  };

  const weekDays = flat.filter((f) => f.weekIdx === selectedWeek);

  return (
    <div className="px-4 pt-4">
      {/* 4-grid stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          ['当前', `${stats.currentDay}`, '天'],
          ['已完成', `${stats.completedDays}`, '天'],
          ['总天数', `${totalDays}`, '天'],
          ['总XP', `${stats.xp}`, '⭐'],
        ].map(([label, val, unit], i) => (
          <div
            key={i}
            className="rounded-card border border-line bg-white p-2 text-center shadow-soft"
          >
            <div className="text-lg font-extrabold text-forest">{val}</div>
            <div className="text-[10px] text-gray-400">
              {label} {unit}
            </div>
          </div>
        ))}
      </div>

      {/* streak bar */}
      <div className="mt-3 flex items-center gap-3 rounded-card border border-line bg-white p-4 shadow-soft">
        <span className="text-2xl">🔥</span>
        <div className="flex-1">
          <div className="text-sm font-extrabold text-gray-800">
            连续打卡 {stats.streak} 天
          </div>
          <div className="text-xs text-gray-400">坚持就是胜利，每天来一下～</div>
        </div>
        <span className="rounded-full bg-forest/15 px-3 py-1 text-xs font-bold text-forest">
          第 {selectedWeek + 1} 周
        </span>
      </div>

      {/* week tabs */}
      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
        {weeks.map((w, wi) => (
          <button
            key={wi}
            onClick={() => setSelectedWeek(wi)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
              wi === selectedWeek
                ? 'bg-forest text-white shadow-soft'
                : 'border border-line bg-white text-gray-500'
            }`}
          >
            {w.label}
          </button>
        ))}
      </div>

      {/* day cards */}
      <div className="mt-4 space-y-3">
        {weekDays.map(({ weekIdx, dayIdx, globalDay }) => {
          const day = weeks[weekIdx].days[dayIdx];
          const status = statusFor(globalDay, day.completed);
          return (
            <DayCard
              key={globalDay}
              ref={(el) => (cardRefs.current[globalDay] = el)}
              day={day}
              weekIdx={weekIdx}
              dayIdx={dayIdx}
              globalDay={globalDay}
              status={status}
              expanded={expandedDay === globalDay}
              onToggleExpand={() =>
                setExpandedDay((prev) =>
                  prev === globalDay ? -1 : globalDay
                )
              }
              onRequestComplete={() =>
                setSheet({ wi: weekIdx, di: dayIdx, gd: globalDay })
              }
              showReward={showReward}
            />
          );
        })}
      </div>

      <CompleteSheet
        open={!!sheet}
        globalDay={sheet?.gd ?? 0}
        onClose={() => setSheet(null)}
        onConfirm={(note) => {
          if (!sheet) return;
          const { wi, di, gd } = sheet;
          const wasLastOfWeek =
            di === weeks[wi].days.length - 1 && wi < weeks.length - 1;
          onComplete(wi, di, note, gd, wasLastOfWeek, wi + 1);
          setSheet(null);
          if (wasLastOfWeek && gd < totalDays) {
            setSelectedWeek(wi + 1);
          }
        }}
      />
    </div>
  );
}

/* ---------- Plan Tab ---------- */
function PlanTab({
  rawText,
  completedDays,
  totalDays,
  onReset,
}: {
  rawText: string;
  completedDays: number;
  totalDays: number;
  onReset: () => void;
}) {
  const pct = totalDays ? Math.round((completedDays / totalDays) * 100) : 0;
  return (
    <div className="px-4 pt-4">
      <div className="rounded-card border border-line bg-white p-4 shadow-soft">
        <div className="mb-2 flex items-center justify-between text-sm font-bold text-gray-700">
          <span>整体进度</span>
          <span className="text-forest">
            {completedDays}/{totalDays} 天 · {pct}%
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-gray-100">
          <motion.div
            className="h-full rounded-full bg-forest"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="mt-3 rounded-card border border-line bg-white p-4 shadow-soft">
        <div className="mb-2 text-sm font-bold text-gray-700">📝 我的计划</div>
        <pre className="whitespace-pre-wrap break-words font-mono text-[12px] leading-relaxed text-gray-600">
          {rawText}
        </pre>
      </div>

      <button
        onClick={onReset}
        className="mt-3 w-full rounded-card border border-amber/40 bg-amber/10 py-3 text-sm font-bold text-amber-700 active:scale-[0.99]"
      >
        🔄 重新输入计划
      </button>
    </div>
  );
}

/* ---------- Island Tab ---------- */
const MILESTONES = [
  { days: 1, icon: '🌱', label: '岛屿诞生' },
  { days: 7, icon: '🏠', label: '图书馆解锁' },
  { days: 14, icon: '☕', label: '咖啡馆解锁' },
  { days: 21, icon: '🏛️', label: '博物馆解锁' },
  { days: 30, icon: '🌳', label: '古树广场' },
  { days: 45, icon: '🏆', label: '雅思神殿' },
  { days: 60, icon: '🎓', label: '通关纪念碑' },
];

function IslandTab({
  completedDays,
  streak,
  xp,
}: {
  completedDays: number;
  streak: number;
  xp: number;
}) {
  const level = Math.floor(completedDays / 5) + 1;
  const buildings = Math.floor(completedDays / 7) + 1;
  return (
    <div className="px-4 pt-6">
      <div className="text-center">
        <div className="text-6xl">🏝️</div>
        <h2 className="mt-2 text-xl font-extrabold text-gray-800">
          我的雅思岛
        </h2>
        <p className="mt-1 text-sm text-gray-500">每完成一天，岛屿升一级</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {[
          ['🏝️', '岛屿等级', `Lv.${level}`],
          ['🏗️', '已解锁建筑', `${buildings}`],
          ['🔥', '连续天数', `${streak}`],
          ['⭐', '总 XP', `${xp}`],
        ].map(([icon, label, val], i) => (
          <div
            key={i}
            className="rounded-card border border-line bg-white p-4 text-center shadow-soft"
          >
            <div className="text-2xl">{icon}</div>
            <div className="mt-1 text-xl font-extrabold text-forest">
              {val}
            </div>
            <div className="text-xs text-gray-400">{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-card border border-line bg-white p-4 shadow-soft">
        <div className="mb-3 text-sm font-bold text-gray-700">📋 里程碑</div>
        <div className="space-y-2">
          {MILESTONES.map((m) => {
            const reached = completedDays >= m.days;
            return (
              <div
                key={m.days}
                className={`flex items-center gap-3 rounded-card px-3 py-2 ${
                  reached ? 'bg-forest/10' : 'bg-cream'
                }`}
              >
                <span className="text-xl">{m.icon}</span>
                <div className="flex-1">
                  <div
                    className={`text-sm font-bold ${
                      reached ? 'text-forest' : 'text-gray-400'
                    }`}
                  >
                    {m.label}
                  </div>
                  <div className="text-xs text-gray-400">第 {m.days} 天</div>
                </div>
                <span className="text-sm">
                  {reached ? (
                    <span className="font-bold text-forest">✅</span>
                  ) : (
                    <span className="text-gray-300">🔒</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
