import type { ShopItem } from '../types';

export const SHOP_ITEMS: ShopItem[] = [
  // 自然景观（便宜）
  { id: 'flower1', name: '小雏菊', emoji: '🌼', category: 'nature', price: 10, size: [1, 1], description: '一朵可爱的小花' },
  { id: 'flower2', name: '郁金香', emoji: '🌷', category: 'nature', price: 15, size: [1, 1], description: '荷兰来的问候' },
  { id: 'flower3', name: '向日葵', emoji: '🌻', category: 'nature', price: 20, size: [1, 1], description: '永远面朝阳光' },
  { id: 'bush', name: '灌木丛', emoji: '🌿', category: 'nature', price: 15, size: [1, 1], description: '整整齐齐的绿篱' },
  { id: 'rock', name: '小石头', emoji: '🪨', category: 'nature', price: 10, size: [1, 1], description: '朴实无华的石头' },
  { id: 'mushroom', name: '蘑菇', emoji: '🍄', category: 'nature', price: 15, size: [1, 1], description: '别吃，用来看的' },
  { id: 'tree_cherry', name: '樱花树', emoji: '🌸', category: 'nature', price: 30, size: [1, 1], description: '春天的气息' },
  { id: 'tree_pine', name: '松树', emoji: '🌲', category: 'nature', price: 25, size: [1, 1], description: '四季常青' },
  { id: 'tree_palm', name: '椰子树', emoji: '🌴', category: 'nature', price: 25, size: [1, 1], description: '热带风情' },

  // 基础设施（中等）
  { id: 'fence', name: '木栅栏', emoji: '🪵', category: 'infrastructure', price: 20, size: [1, 1], description: '圈出你的领地' },
  { id: 'path', name: '石板路', emoji: '🟫', category: 'infrastructure', price: 25, size: [1, 1], description: '走起来很舒服' },
  { id: 'lamp', name: '路灯', emoji: '🏮', category: 'infrastructure', price: 40, size: [1, 1], description: '夜晚也亮堂' },
  { id: 'bench', name: '长椅', emoji: '🪑', category: 'infrastructure', price: 40, size: [1, 1], description: '学累了坐一坐' },
  { id: 'mailbox', name: '邮箱', emoji: '📮', category: 'infrastructure', price: 30, size: [1, 1], description: '也许会收到好消息' },
  { id: 'well', name: '水井', emoji: '⛲', category: 'infrastructure', price: 50, size: [1, 1], description: '许个愿吧' },
  { id: 'bridge', name: '小木桥', emoji: '🌉', category: 'infrastructure', price: 60, size: [2, 1], description: '连接岛的两边' },
  { id: 'fountain', name: '喷泉', emoji: '⛲', category: 'infrastructure', price: 80, size: [2, 2], description: '岛屿的中心广场' },

  // 建筑（贵）
  { id: 'cabin', name: '小木屋', emoji: '🏡', category: 'building', price: 100, size: [2, 1], description: '温馨的学习小窝' },
  { id: 'library', name: '图书馆', emoji: '📚', category: 'building', price: 150, size: [2, 2], description: '知识的殿堂' },
  { id: 'cafe', name: '咖啡馆', emoji: '☕', category: 'building', price: 150, size: [2, 1], description: '学习间隙来一杯' },
  { id: 'bakery', name: '面包店', emoji: '🥐', category: 'building', price: 180, size: [2, 1], description: '刚出炉的香气' },
  { id: 'museum', name: '博物馆', emoji: '🏛️', category: 'building', price: 200, size: [2, 2], description: '收藏你的成就' },
  { id: 'lighthouse', name: '灯塔', emoji: '🗼', category: 'building', price: 200, size: [1, 1], description: '指引方向的光' },
  { id: 'clocktower', name: '钟楼', emoji: '🕰️', category: 'building', price: 250, size: [2, 2], description: '时间管理大师' },
  { id: 'temple', name: '雅思神殿', emoji: '⛩️', category: 'building', price: 300, size: [2, 2], description: '传说中的终极建筑' },

  // 特殊（需要解锁）
  { id: 'rainbow', name: '彩虹拱门', emoji: '🌈', category: 'special', price: 200, size: [2, 1], description: '坚持的彩虹', unlockCondition: { type: 'streak', value: 14 } },
  { id: 'fireworks', name: '烟花发射台', emoji: '🎆', category: 'special', price: 250, size: [1, 1], description: '庆祝每一步', unlockCondition: { type: 'completedDays', value: 30 } },
  { id: 'statue', name: '金色雕像', emoji: '🏆', category: 'special', price: 300, size: [1, 1], description: '通关者的荣耀', unlockCondition: { type: 'completedDays', value: 45 } },
  { id: 'ferriswheel', name: '摩天轮', emoji: '🎡', category: 'special', price: 350, size: [2, 2], description: '在顶端看到远方', unlockCondition: { type: 'streak', value: 30 } },
];

export const SHOP_MAP: Record<string, ShopItem> = Object.fromEntries(
  SHOP_ITEMS.map((i) => [i.id, i])
);

// Preset (non-purchasable) items placed on the island at the start.
export const PRESET_META: Record<string, { emoji: string; name: string; size: [number, number] }> = {
  tent: { emoji: '⛺', name: '帐篷', size: [1, 1] },
  preset_tree: { emoji: '🌳', name: '大树', size: [1, 1] },
};

export function getItemMeta(
  id: string
): { emoji: string; name: string; size: [number, number] } | null {
  if (PRESET_META[id]) return PRESET_META[id];
  const item = SHOP_MAP[id];
  if (item) return { emoji: item.emoji, name: item.name, size: item.size };
  return null;
}

export const PRESET_IDS = new Set(Object.keys(PRESET_META));
