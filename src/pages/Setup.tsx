import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { parsePlan } from '../lib/parsePlan';
import { PLAN_TEMPLATE, SAMPLE_PLAN } from '../lib/samplePlan';
import IslandScene from '../components/IslandScene';

export default function Setup() {
  const navigate = useNavigate();
  const createPlan = useStore((s) => s.createPlan);
  const [text, setText] = useState(PLAN_TEMPLATE);
  const [error, setError] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);
  const [building, setBuilding] = useState(false);

  const handleStart = () => {
    if (building) return;
    setError('');
    const result = parsePlan(text);
    if (!result.ok) {
      setError(result.error || '格式有点问题，请检查一下 🧐');
      return;
    }
    setBuilding(true);
    createPlan(text, result.weeks);
    setTimeout(() => navigate('/game', { replace: true }), 600);
  };

  return (
    <div className="min-h-full">
      <div className="relative">
        <IslandScene height={200} />
        <div className="-mt-6 rounded-t-[24px] bg-white px-5 pb-10 pt-6">
          <div className="mb-4 text-center">
            <div className="text-4xl">🏝️</div>
            <h1 className="mt-1 text-2xl font-extrabold text-gray-800">
              雅思岛
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              输入你的备考计划，开始闯关
            </p>
          </div>

          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError('');
            }}
            spellCheck={false}
            className="min-h-[200px] w-full resize-y rounded-card border border-line bg-cream p-3 font-mono text-[13px] leading-relaxed text-gray-700 outline-none focus:border-forest"
            placeholder="在这里粘贴或输入你的计划…"
          />

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 rounded-card border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-amber-700"
              >
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* help accordion */}
          <button
            onClick={() => setHelpOpen((v) => !v)}
            className="mt-3 flex w-full items-center justify-between rounded-card border border-line bg-cream px-4 py-3 text-left text-sm font-semibold text-gray-600 active:scale-[0.99]"
          >
            <span>📖 查看格式说明</span>
            <span>{helpOpen ? '▲' : '▼'}</span>
          </button>
          <AnimatePresence initial={false}>
            {helpOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-2 rounded-card bg-cream p-4 text-[13px] leading-relaxed text-gray-600">
                  <p>
                    <code className="rounded bg-white px-1">## </code>{' '}
                    开头是<b>周标题</b>，例如{' '}
                    <code className="rounded bg-white px-1">## 第1周 · 打基础</code>
                  </p>
                  <p>
                    <code className="rounded bg-white px-1">### </code>{' '}
                    开头是<b>天标题</b>，例如{' '}
                    <code className="rounded bg-white px-1">### Day 1 · 摸底听力</code>
                  </p>
                  <p>
                    <code className="rounded bg-white px-1">- </code> 开头是
                    <b>任务</b>，用 <code className="rounded bg-white px-1">|</code>{' '}
                    分隔三段：
                  </p>
                  <p className="rounded bg-white px-2 py-1">
                    - 任务名 | 备注说明 | 40xp
                  </p>
                  <p className="text-gray-500">
                    备注和 xp 都可省略，不写 xp 默认 30。最少只写任务名也行。
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => {
              setText(SAMPLE_PLAN);
              setError('');
            }}
            className="mt-3 w-full rounded-card border border-line bg-white py-3 text-sm font-bold text-forest active:scale-[0.99]"
          >
            📋 加载示例计划
          </button>

          <button
            onClick={handleStart}
            disabled={building}
            className="mt-3 w-full rounded-card bg-forest py-4 text-base font-extrabold text-white shadow-soft transition active:scale-[0.98] disabled:opacity-80"
          >
            {building ? (
              <span className="inline-flex items-center gap-2">
                建岛中
                <span className="inline-flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="inline-block h-1.5 w-1.5 rounded-full bg-white"
                      style={{
                        animation: 'dotPulse 1.2s infinite',
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </span>
              </span>
            ) : (
              '开始建岛 🏝️'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
