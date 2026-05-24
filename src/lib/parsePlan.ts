import type { Week, Day, Quest } from '../types';

export interface ParseResult {
  ok: boolean;
  weeks: Week[];
  error?: string;
}

function extractSubtitle(title: string): string {
  // "Day 1 · 摸底听力" -> "摸底听力"
  const parts = title.split('·');
  if (parts.length > 1) return parts.slice(1).join('·').trim();
  return '';
}

function parseQuest(line: string): Quest | null {
  // strip leading "- "
  const body = line.replace(/^[-*]\s+/, '').trim();
  if (!body) return null;
  const segments = body.split('|').map((s) => s.trim());
  const name = segments[0];
  if (!name) return null;
  const detail = segments[1] || '';
  const xpStr = segments[2] || '';
  const m = xpStr.match(/\d+/);
  const xp = m ? parseInt(m[0], 10) : 30;
  return { name, detail, xp, done: false };
}

export function parsePlan(text: string): ParseResult {
  const weeks: Week[] = [];

  // Split into week blocks by "## " at line start (but not "### ")
  const lines = text.split('\n');
  let currentWeek: Week | null = null;
  let currentDay: Day | null = null;

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, '');
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (/^###\s+/.test(trimmed)) {
      // Day heading
      const title = trimmed.replace(/^###\s+/, '').trim();
      if (!currentWeek) {
        // a day without a week — create a default week
        currentWeek = { label: '第1周', days: [] };
        weeks.push(currentWeek);
      }
      currentDay = {
        title,
        subtitle: extractSubtitle(title),
        quests: [],
        completed: false,
        note: '',
      };
      currentWeek.days.push(currentDay);
    } else if (/^##\s+/.test(trimmed)) {
      // Week heading
      const label = trimmed.replace(/^##\s+/, '').trim();
      currentWeek = { label, days: [] };
      currentDay = null;
      weeks.push(currentWeek);
    } else if (/^[-*]\s+/.test(trimmed)) {
      // Quest line
      const quest = parseQuest(trimmed);
      if (quest && currentDay) {
        currentDay.quests.push(quest);
      }
    }
    // any other line is ignored
  }

  // Validation
  if (weeks.length === 0) {
    return {
      ok: false,
      weeks: [],
      error: '没找到任何周标题，请用「## 第1周 · xxx」开头哦 🌿',
    };
  }
  const totalDays = weeks.reduce((acc, w) => acc + w.days.length, 0);
  if (totalDays === 0) {
    return {
      ok: false,
      weeks: [],
      error: '没找到任何天，请用「### Day 1 · xxx」标记每一天 📅',
    };
  }
  const totalQuests = weeks.reduce(
    (acc, w) => acc + w.days.reduce((a, d) => a + d.quests.length, 0),
    0
  );
  if (totalQuests === 0) {
    return {
      ok: false,
      weeks: [],
      error: '每天至少要有一个任务哦，用「- 任务名 | 备注 | 40xp」添加 ✏️',
    };
  }

  return { ok: true, weeks };
}
