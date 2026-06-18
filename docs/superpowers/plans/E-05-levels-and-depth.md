# 阶段 3 · 关卡与玩法深度 实现计划

> **面向 AI 代理的工作者：** 使用 superpowers:subagent-driven-development 或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法跟踪进度。

**目标：** 将阶段 2 的"春樱岛单机玩法"升级为完整的 5 岛 + 双模式 + 元系统（成就/称号/图鉴/每日挑战）。打通 island 解锁逻辑、障碍物生成、图鉴 DexView、成就系统、每日分享卡。

**架构：** `src/game/` 纯 TS 层新增障碍物生成逻辑、成就/称号判定、dailyHistory 持久化；Vue 层新增 DexView 图鉴页、DailyShareCard 分享卡、GameOverModal 升级、环境粒子系统；Pinia progress store 扩展图鉴/成就/历史等字段。

**技术栈：** TypeScript / Canvas 2D / Vue 3.4+ / Pinia / Vue Router 4 / html2canvas（新增） / Less / animal-island-vue

**前置条件：** 阶段 1-2 全部完成，核心引擎可玩、动森视觉化已完成。

**关联规格：** `docs/superpowers/specs/2026-06-18-snake-game-design.md` §8-9, §5.6

**验收标准：**
- 5 个岛屿各有独立食物概率表，解锁条件正确生效
- 每日挑战有确定性棋盘（种子化障碍物 + 每日固定岛屿）
- 吃化石触发图鉴录入 + 集齐 5 种解锁化石岛
- 10 个成就可触发 + 全屏闪光通知
- 10 个称号按条件解锁并可在 DexView 查看
- DexView 三 Tab（水果/化石/称号） + 导入导出 JSON
- DailyShareCard 组件可导出 PNG（html2canvas）
- 环境粒子（春樱/枫叶/雪/沙）按岛屿切换
- 所有已有测试 + 新增测试通过
- typecheck + lint 零错误

---

## 文件结构

### 创建的文件

- `src/game/core/Obstacle.ts` — 障碍物生成（种子化随机放置）
- `src/game/achievements.ts` — 成就判定逻辑（10 个成就检查函数）
- `src/game/titles.ts` — 称号判定逻辑（10 个称号检查函数）
- `src/game/render/layers/ParticleLayer.ts` — 环境粒子层（樱花/枫叶/雪/沙）
- `src/components/DailyShareCard.vue` — 每日挑战分享卡（420x560）
- `src/components/DexCard.vue` — 图鉴卡片组件
- `src/views/DexView.vue` — 图鉴页面（水果/化石/称号 三 Tab）
- `tests/game/Obstacle.test.ts` — 障碍物生成单测
- `tests/game/achievements.test.ts` — 成就判定单测
- `tests/game/titles.test.ts` — 称号判定单测

### 修改的文件

- `src/game/types.ts` — 新增 AchievementId, TitleId 类型 + ProgressState 扩展
- `src/game/GameSession.ts` — 接入障碍物生成 + 成就/称号触发 + dailyHistory
- `src/game/modes/DailyMode.ts` — 完整化（每日岛屿选择 + 历史记录结构）
- `src/game/render/layers/ObstacleLayer.ts` — 实现障碍物绘制
- `src/game/render/Renderer.ts` — 新增 ParticleLayer 编排
- `src/stores/progress.ts` — 扩展 cumulativeScore/dex/achievements/unlockedIslands/dailyHistory 等
- `src/stores/settings.ts` — 不改（阶段 4 再扩展音量）
- `src/components/GameOverModal.vue` — 升级（每日分享入口 + 新解锁提示）
- `src/views/HomeView.vue` — 添加图鉴入口按钮
- `src/views/GameView.vue` — 每日挑战接入 DailyShareCard
- `src/router/index.ts` — 新增 /dex 路由

---

## 任务 29：Types 扩展 + Progress store 升级

**文件：**

- 修改：`src/game/types.ts`
- 修改：`src/stores/progress.ts`

**职责：** 定义 AchievementId/TitleId 类型，扩展 ProgressState 接口（cumulativeScore, dex, achievements, unlockedIslands, dailyHistory 等），更新 Pinia store 读/写/持久化逻辑。

- [ ] **步骤 29.1：扩展 `src/game/types.ts`**

在文件末尾追加：

```typescript
// === 成就与称号 ===

export type AchievementId =
  | 'gourmet' | 'long_dragon' | 'meteor_hunter' | 'paleontologist'
  | 'spring_clear' | 'summer_clear' | 'autumn_clear'
  | 'winter_clear' | 'fossil_clear' | 'daily_warrior';

export type TitleId =
  | 'rookie' | 'gourmet' | 'long_dragon' | 'meteor_hunter'
  | 'paleontologist' | 'spring_visitor' | 'summer_visitor'
  | 'autumn_visitor' | 'winter_visitor' | 'traveler';

// === 进度持久化（阶段 3 完整版）===

export interface DailyRecord {
  date: string;       // YYYY-MM-DD
  score: number;
  seed: number;
  island: IslandId;
  length: number;
}

export interface ProgressState {
  version: 1;
  highScore: Partial<Record<IslandId, number>>;
  cumulativeScore: number;
  unlockedIslands: IslandId[];
  dex: {
    fruits: FoodKind[];
    fossils: FoodKind[];
    titles: TitleId[];
  };
  achievements: AchievementId[];
  dailyHistory: DailyRecord[];
  meteorEatenTotal: number;
  consecutiveDailyDays: number;
  lastDailyDate?: string;
}

export const ALL_FRUIT_KINDS: FoodKind[] = [
  'apple', 'cherry', 'peach', 'pear', 'orange', 'coconut',
  'watermelon', 'persimmon', 'chestnut',
];

export const ALL_TITLE_IDS: TitleId[] = [
  'rookie', 'gourmet', 'long_dragon', 'meteor_hunter',
  'paleontologist', 'spring_visitor', 'summer_visitor',
  'autumn_visitor', 'winter_visitor', 'traveler',
];

export const ALL_ACHIEVEMENT_IDS: AchievementId[] = [
  'gourmet', 'long_dragon', 'meteor_hunter', 'paleontologist',
  'spring_clear', 'summer_clear', 'autumn_clear',
  'winter_clear', 'fossil_clear', 'daily_warrior',
];

/** 成就中文名映射 */
export const ACHIEVEMENT_NAMES: Record<AchievementId, string> = {
  gourmet: '美食家', long_dragon: '长龙', meteor_hunter: '流星猎人',
  paleontologist: '化石学家', spring_clear: '春樱征服者', summer_clear: '夏海征服者',
  autumn_clear: '秋枫征服者', winter_clear: '冬雪征服者', fossil_clear: '化石征服者',
  daily_warrior: '每日战士',
};

/** 称号中文名映射 */
export const TITLE_NAMES: Record<TitleId, string> = {
  rookie: '新手', gourmet: '美食家', long_dragon: '长龙',
  meteor_hunter: '流星猎人', paleontologist: '化石学家',
  spring_visitor: '春之访客', summer_visitor: '夏之访客',
  autumn_visitor: '秋之访客', winter_visitor: '冬之访客', traveler: '旅者',
};
```

- [ ] **步骤 29.2：重写 `src/stores/progress.ts`**

```typescript
import { defineStore } from 'pinia';
import type {
  IslandId, FoodKind, TitleId, AchievementId,
  DailyRecord, ProgressState,
} from '@/game/types';
import {
  ALL_ACHIEVEMENT_IDS, ALL_FRUIT_KINDS, ALL_TITLE_IDS, FOSSIL_KINDS,
} from '@/game/types';

const STORAGE_KEY = 'snake-game.progress';

function defaultState(): ProgressState {
  return {
    version: 1,
    highScore: {},
    cumulativeScore: 0,
    unlockedIslands: ['spring'],
    dex: { fruits: [], fossils: [], titles: [] },
    achievements: [],
    dailyHistory: [],
    meteorEatenTotal: 0,
    consecutiveDailyDays: 0,
  };
}

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.version === 1) return { ...defaultState(), ...parsed };
    }
  } catch { /* ignore */ }
  return defaultState();
}

function save(state: ProgressState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const useProgressStore = defineStore('progress', {
  state: (): ProgressState => load(),

  actions: {
    /** 更新最高分，返回是否破纪录 */
    updateHighScore(island: IslandId, score: number): boolean {
      const prev = this.highScore[island] ?? 0;
      if (score > prev) {
        this.highScore[island] = score;
        save(this.$state);
        return true;
      }
      return false;
    },

    getHighScore(island: IslandId): number {
      return this.highScore[island] ?? 0;
    },

    /** 增加累计分，检查岛屿解锁 */
    addCumulativeScore(score: number): IslandId[] {
      this.cumulativeScore += score;
      const { ISLANDS, ISLAND_ORDER } = require('@/game/levels/islands');
      const newlyUnlocked: IslandId[] = [];
      for (const id of ISLAND_ORDER) {
        if (this.unlockedIslands.includes(id)) continue;
        const island = ISLANDS[id];
        if (island.unlockSpecial === 'all_fossils') continue; // 化石岛特殊处理
        if (this.cumulativeScore >= island.unlockScore) {
          this.unlockedIslands.push(id);
          newlyUnlocked.push(id);
        }
      }
      if (newlyUnlocked.length > 0) save(this.$state);
      return newlyUnlocked;
    },

    /** 解锁化石岛（集齐 5 化石时调用） */
    unlockFossilIsland(): boolean {
      if (this.unlockedIslands.includes('fossil')) return false;
      this.unlockedIslands.push('fossil');
      save(this.$state);
      return true;
    },

    /** 录入食物图鉴 */
    addToDexFruit(kind: FoodKind): boolean {
      if (this.dex.fruits.includes(kind)) return false;
      this.dex.fruits.push(kind);
      save(this.$state);
      return true;
    },

    /** 录入化石图鉴 */
    addToDexFossil(kind: FoodKind): boolean {
      if (!FOSSIL_KINDS.includes(kind)) return false;
      if (this.dex.fossils.includes(kind)) return false;
      this.dex.fossils.push(kind);
      save(this.$state);
      return true;
    },

    /** 录入称号 */
    addTitle(title: TitleId): boolean {
      if (this.dex.titles.includes(title)) return false;
      this.dex.titles.push(title);
      save(this.$state);
      return true;
    },

    /** 解锁成就（idempotent） */
    unlockAchievement(id: AchievementId): boolean {
      if (this.achievements.includes(id)) return false;
      this.achievements.push(id);
      save(this.$state);
      return true;
    },

    /** 记录每日挑战 */
    recordDaily(record: DailyRecord): void {
      const existing = this.dailyHistory.find(r => r.date === record.date);
      if (existing && record.score <= existing.score) return;
      if (existing) {
        Object.assign(existing, record);
      } else {
        this.dailyHistory.push(record);
      }
      // 限制 30 条
      if (this.dailyHistory.length > 30) {
        this.dailyHistory = this.dailyHistory.slice(-30);
      }
      this.lastDailyDate = record.date;
      save(this.$state);
    },

    /** 增加流星累计数 */
    addMeteorEaten(): void {
      this.meteorEatenTotal++;
      save(this.$state);
    },

    /** 更新连续每日天数 */
    updateConsecutiveDays(today: string): void {
      const yesterday = dayBefore(today);
      if (this.lastDailyDate === yesterday) {
        this.consecutiveDailyDays++;
      } else if (this.lastDailyDate !== today) {
        this.consecutiveDailyDays = 1;
      }
      this.lastDailyDate = today;
      save(this.$state);
    },

    /** 导出存档 JSON */
    exportJSON(): string {
      return JSON.stringify(this.$state, null, 2);
    },

    /** 导入存档 JSON */
    importJSON(json: string): boolean {
      try {
        const parsed = JSON.parse(json);
        if (parsed.version === 1) {
          Object.assign(this.$state, defaultState(), parsed);
          save(this.$state);
          return true;
        }
      } catch { /* ignore */ }
      return false;
    },

    /** 清空存档 */
    clearAll(): void {
      Object.assign(this.$state, defaultState());
      save(this.$state);
    },
  },
});

/** 计算前一天的 YYYY-MM-DD */
function dayBefore(date: string): string {
  const d = new Date(date + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}
```

- [ ] **步骤 29.3：运行 typecheck + test**

```bash
pnpm typecheck && pnpm test
```

- [ ] **步骤 29.4：Commit**

```bash
git add src/game/types.ts src/stores/progress.ts
git commit -m "feat(store): 扩展 ProgressState 字段 + types（AchievementId/TitleId）"
```

---

## 任务 30：障碍物系统（Obstacle.ts + ObstacleLayer 渲染）

**文件：**

- 创建：`src/game/core/Obstacle.ts`
- 修改：`src/game/render/layers/ObstacleLayer.ts`

**职责：** 障碍物生成（种子化随机、避开蛇身 3 格范围）、ObstacleLayer Canvas 渲染（动森风栅栏/树桩）。

- [ ] **步骤 30.1：创建 `src/game/core/Obstacle.ts`**

```typescript
import type { Cell } from '@/game/types';
import type { Rng } from '@/game/core/Rng';

/**
 * 生成障碍物列表。
 * @param rng 种子化随机数生成器
 * @param boardSize 棋盘尺寸
 * @param density 障碍物密度（如 0.03 约 14 个）
 * @param avoid 要避开的位置列表（蛇身 + 周围 3 格）
 */
export function generateObstacles(
  rng: Rng,
  boardSize: number,
  density: number,
  avoid: Cell[],
): Cell[] {
  const totalCells = boardSize * boardSize;
  const targetCount = Math.floor(totalCells * density);
  const obstacles: Cell[] = [];
  const avoidSet = new Set(avoid.map(c => `${c.x},${c.y}`));

  // 扩展 avoid 为"周围 3 格"范围
  const expandedAvoid = new Set(avoidSet);
  for (const a of avoid) {
    for (let dx = -3; dx <= 3; dx++) {
      for (let dy = -3; dy <= 3; dy++) {
        const nx = a.x + dx;
        const ny = a.y + dy;
        if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
          expandedAvoid.add(`${nx},${ny}`);
        }
      }
    }
  }

  let attempts = 0;
  const maxAttempts = targetCount * 20; // 防止死循环
  while (obstacles.length < targetCount && attempts < maxAttempts) {
    attempts++;
    const x = Math.floor(rng.next() * boardSize);
    const y = Math.floor(rng.next() * boardSize);
    const key = `${x},${y}`;
    if (!expandedAvoid.has(key) && !obstacles.some(o => o.x === x && o.y === y)) {
      obstacles.push({ x, y });
    }
  }
  return obstacles;
}
```

- [ ] **步骤 30.2：实现 `src/game/render/layers/ObstacleLayer.ts`**

```typescript
import type { Cell } from '@/game/types';

export function drawObstacleLayer(
  ctx: CanvasRenderingContext2D,
  obstacles: readonly Cell[],
  cellW: number,
  cellH: number,
): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  if (obstacles.length === 0) return;

  for (const ob of obstacles) {
    const x = ob.x * cellW;
    const y = ob.y * cellH;
    drawTreeStump(ctx, x, y, cellW, cellH);
  }
}

function drawTreeStump(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  cellW: number, cellH: number,
): void {
  const pad = cellW * 0.08;
  const cx = x + cellW / 2;
  const cy = y + cellH / 2;
  const r = Math.min(cellW, cellH) * 0.35;

  // 树桩主体
  ctx.fillStyle = '#a08060';
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.15, r * 0.85, r * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#5a3a1a';
  ctx.lineWidth = Math.max(1.5, cellW * 0.05);
  ctx.stroke();

  // 年轮纹路
  ctx.strokeStyle = 'rgba(90,58,26,0.3)';
  ctx.lineWidth = Math.max(0.5, cellW * 0.02);
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.15, r * 0.3 * i, r * 0.2 * i, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 木屑高光
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.2, cy - r * 0.05, r * 0.2, r * 0.1, -0.4, 0, Math.PI * 2);
  ctx.fill();
}
```

- [ ] **步骤 30.3：运行 typecheck + test**

```bash
pnpm typecheck && pnpm test
```

- [ ] **步骤 30.4：Commit**

```bash
git add src/game/core/Obstacle.ts src/game/render/layers/ObstacleLayer.ts
git commit -m "feat(game): 障碍物系统（种子化随机生成 + 树桩渲染）"
```

---

## 任务 31：成就 & 称号判定逻辑

**文件：**

- 创建：`src/game/achievements.ts`
- 创建：`src/game/titles.ts`

**职责：** 提供独立纯函数，每帧或特定事件时检查成就/称号条件是否满足。返回新解锁的 ID 列表。

- [ ] **步骤 31.1：创建 `src/game/achievements.ts`**

```typescript
import type {
  AchievementId, FoodKind, IslandId, ProgressState, GameState,
} from '@/game/types';
import { FOSSIL_KINDS } from '@/game/types';

export interface AchievementCheckInput {
  state: GameState;         // 当前对局快照
  progress: ProgressState;  // 持久化进度
}

/** 检查所有成就，返回新解锁的成就 ID 列表 */
export function checkAchievements(input: AchievementCheckInput): AchievementId[] {
  const { state, progress } = input;
  const already = new Set(progress.achievements);
  const unlocked: AchievementId[] = [];

  const checks: [AchievementId, () => boolean][] = [
    ['gourmet',          () => state.comboCount >= 10],
    ['long_dragon',      () => state.snake.body.length >= 50],
    ['meteor_hunter',    () => progress.meteorEatenTotal >= 10],
    ['paleontologist',   () => FOSSIL_KINDS.every(f => progress.dex.fossils.includes(f))],
    ['spring_clear',     () => state.island === 'spring' && state.score >= 100],
    ['summer_clear',     () => state.island === 'summer' && state.score >= 150],
    ['autumn_clear',      () => state.island === 'autumn' && state.score >= 200],
    ['winter_clear',      () => state.island === 'winter' && state.score >= 250],
    ['fossil_clear',      () => state.island === 'fossil' && state.score >= 300],
    ['daily_warrior',     () => progress.consecutiveDailyDays >= 7],
  ];

  for (const [id, fn] of checks) {
    if (!already.has(id) && fn()) {
      unlocked.push(id);
    }
  }
  return unlocked;
}

/** 获取关联称号（成就 → 称号 ID 映射） */
export function getRelatedTitle(achievement: AchievementId): string | null {
  const map: Partial<Record<AchievementId, string>> = {
    gourmet: 'gourmet',
    long_dragon: 'long_dragon',
    meteor_hunter: 'meteor_hunter',
    paleontologist: 'paleontologist',
    spring_clear: 'spring_visitor',
    summer_clear: 'summer_visitor',
    autumn_clear: 'autumn_visitor',
    winter_clear: 'winter_visitor',
    fossil_clear: 'paleontologist',
    daily_warrior: 'daily_warrior',
  };
  return map[achievement] ?? null;
}
```

- [ ] **步骤 31.2：创建 `src/game/titles.ts`**

```typescript
import type { TitleId, ProgressState } from '@/game/types';
import { FOSSIL_KINDS, ALL_FRUIT_KINDS } from '@/game/types';

export interface TitleCheckInput {
  progress: ProgressState;
  justDiedWith: {
    score: number;
    island: string;
    comboCount: number;
    length: number;
  };
}

export function checkTitles(input: TitleCheckInput): TitleId[] {
  const { progress, justDiedWith: d } = input;
  const already = new Set(progress.dex.titles);
  const unlocked: TitleId[] = [];

  const checks: [TitleId, () => boolean][] = [
    ['rookie',           () => true],
    ['gourmet',          () => d.comboCount >= 10],
    ['long_dragon',      () => d.length >= 50],
    ['meteor_hunter',    () => progress.meteorEatenTotal >= 10],
    ['paleontologist',   () => FOSSIL_KINDS.every(f => progress.dex.fossils.includes(f))],
    ['spring_visitor',   () => d.island === 'spring' && d.score >= 100],
    ['summer_visitor',   () => d.island === 'summer' && d.score >= 150],
    ['autumn_visitor',    () => d.island === 'autumn' && d.score >= 200],
    ['winter_visitor',    () => d.island === 'winter' && d.score >= 250],
    ['traveler',         () => progress.unlockedIslands.length >= 5],
  ];

  for (const [id, fn] of checks) {
    if (!already.has(id) && fn()) {
      unlocked.push(id);
    }
  }
  return unlocked;
}
```

- [ ] **步骤 31.3：运行 typecheck + test**

```bash
pnpm typecheck && pnpm test
```

- [ ] **步骤 31.4：Commit**

```bash
git add src/game/achievements.ts src/game/titles.ts
git commit -m "feat(game): 成就+称号判定逻辑（10成就+10称号独立纯函数）"
```

---

## 任务 32：GameSession 接入障碍物 + 成就 + 化石/Daily 逻辑

**文件：**

- 修改：`src/game/GameSession.ts`
- 修改：`src/game/modes/DailyMode.ts`

**职责：** GameSession 在局开始时生成障碍物（DailyMode）、吃食物时录入图鉴/计数流星、局结束后裁决成就/称号、记录 dailyHistory。DailyMode 新增每日岛屿选择逻辑。

- [ ] **步骤 32.1：更新 `src/game/modes/DailyMode.ts`**

当前需新增：
- 每日岛屿由 seed % 5 决定
- 导出一个 `getDailyIsland(): IslandId` 工具

```typescript
import type { GameMode, IslandId } from '@/game/types';
import { ISLAND_ORDER } from '@/game/levels/islands';

export function createDailyMode(dateStr: string = todayDateString()): GameMode {
  const seed = dailySeed(dateStr);
  return {
    id: 'daily',
    shouldSpawnObstacles: true,
    rngSeed: seed,
    obstacleDensity: 0.03,
  };
}

export function getDailyIsland(dateStr: string = todayDateString()): IslandId {
  const seed = dailySeed(dateStr);
  return ISLAND_ORDER[seed % ISLAND_ORDER.length]!;
}

export function todayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function dailySeed(dateStr: string): number {
  const ymd = dateStr.replace(/-/g, '');
  return parseInt(ymd, 10);
}
```

- [ ] **步骤 32.2：更新 `src/game/GameSession.ts`**

需要改动：
1. `start()` 中添加障碍物生成
2. `eat` 事件处理中调用化石图鉴录入 + 流星计数
3. `die` 事件中调用成就/称号裁决 + dailyHistory 记录
4. score 更新时调用 `addCumulativeScore`

关键代码改动（在 tick 方法中）：

```typescript
// 在 start() 中，if (mode.shouldSpawnObstacles) 后：
if (this.mode.shouldSpawnObstacles) {
  const { generateObstacles } = require('@/game/core/Obstacle');
  this.state.obstacles = generateObstacles(
    this.rng,
    this.boardSize,
    this.mode.obstacleDensity ?? 0,
    this.state.snake.body,
  );
}

// 在 eat 事件处理中追加：
if (FOSSIL_KINDS.includes(food.kind)) {
  progress.addToDexFossil(food.kind);
}
if (food.kind === 'meteor') {
  progress.addMeteorEaten();
}
progress.addToDexFruit(food.kind);

// 在 die() 之前：
const { checkAchievements } = require('@/game/achievements');
const { checkTitles } = require('@/game/titles');
const newAch = checkAchievements({ state: this.state, progress: progress.$state });
const newTitles = checkTitles({
  progress: progress.$state,
  justDiedWith: { score: this.state.score, island: this.state.island, comboCount: this.state.comboCount, length: this.state.snake.body.length },
});
for (const id of newAch) { progress.unlockAchievement(id); }
for (const id of newTitles) { progress.addTitle(id); }
// emit unlock 事件
```

> **重要**：上述 `require()` 在 ESM 项目中无法使用。实际实现时改用 top-level `import` 语句。

- [ ] **步骤 32.3：运行 typecheck + test**

```bash
pnpm typecheck && pnpm test
```

- [ ] **步骤 32.4：Commit**

```bash
git add src/game/GameSession.ts src/game/modes/DailyMode.ts
git commit -m "feat(game): GameSession 接入障碍物+成就+化石/Daily 逻辑"
```

---

## 任务 33：环境粒子系统（ParticleLayer）

**文件：**

- 创建：`src/game/render/layers/ParticleLayer.ts`
- 修改：`src/game/render/Renderer.ts`

**职责：** 按岛屿类型生成环境粒子（樱花飘落/枫叶/雪/沙尘），每帧更新位置并绘制。Renderer 增加第 6 层 Canvas。

- [ ] **步骤 33.1：创建 `src/game/render/layers/ParticleLayer.ts`**

```typescript
import type { IslandId } from '@/game/types';

interface EnvParticle {
  x: number; y: number;
  vx: number; vy: number;
  size: number; life: number;
  color: string; alpha: number;
}

let particles: EnvParticle[] = [];
let island: IslandId = 'spring';

export function initParticleLayer(islandId: IslandId): void {
  island = islandId;
  particles = [];
}

export function drawParticleLayer(
  ctx: CanvasRenderingContext2D,
  dt: number,
): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.clearRect(0, 0, w, h);

  // 按岛屿配置生成新粒子
  const spawnRate = island === 'fossil' ? 0.3 : 1;
  if (Math.random() < spawnRate * (dt / 1000)) {
    spawnParticle(w);
  }

  // 更新与绘制
  particles = particles.filter(p => {
    p.x += p.vx * (dt / 16);
    p.y += p.vy * (dt / 16);
    p.life -= dt;
    if (p.life <= 0 || p.y > h + 50 || p.x < -50 || p.x > w + 50) return false;

    ctx.globalAlpha = Math.min(p.alpha, p.life / 1000);
    switch (island) {
      case 'spring': drawPetal(ctx, p.x, p.y, p.size, p.color); break;
      case 'autumn': drawPetal(ctx, p.x, p.y, p.size, p.color); break;
      case 'winter': drawSnow(ctx, p.x, p.y, p.size); break;
      case 'summer':
      case 'fossil': drawSand(ctx, p.x, p.y, p.size, p.color); break;
    }
    ctx.globalAlpha = 1;
    return true;
  });
}

function spawnParticle(w: number): void {
  const configs: Record<IslandId, { colors: string[]; sizeRange: [number, number]; vyRange: [number, number]; life: number }> = {
    spring: { colors: ['#ffc1d8', '#ffb6c1', '#ffe4ec'], sizeRange: [3, 7], vyRange: [0.3, 0.8], life: 8000 },
    summer: { colors: ['#d4c4a8', '#c8b878'], sizeRange: [1, 3], vyRange: [0.1, 0.3], life: 4000 },
    autumn: { colors: ['#d94b3a', '#f4a020', '#c85a1a'], sizeRange: [4, 9], vyRange: [0.5, 1.2], life: 7000 },
    winter: { colors: ['#fff', '#f0f4f8'], sizeRange: [2, 5], vyRange: [0.2, 0.5], life: 6000 },
    fossil: { colors: ['#c8a878', '#a89860'], sizeRange: [1, 2], vyRange: [0.05, 0.2], life: 3000 },
  };
  const cfg = configs[island];
  particles.push({
    x: Math.random() * w,
    y: -10,
    vx: (Math.random() - 0.5) * 0.8,
    vy: cfg.vyRange[0] + Math.random() * (cfg.vyRange[1] - cfg.vyRange[0]),
    size: cfg.sizeRange[0] + Math.random() * (cfg.sizeRange[1] - cfg.sizeRange[0]),
    life: cfg.life * (0.8 + Math.random() * 0.4),
    color: cfg.colors[Math.floor(Math.random() * cfg.colors.length)]!,
    alpha: 0.7 + Math.random() * 0.3,
  });
}

function drawPetal(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, size, size * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawSnow(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
}

function drawSand(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(x - size * 0.5, y - size * 0.5, size, size);
}
```

- [ ] **步骤 33.2：更新 `src/game/render/Renderer.ts`**

在构造函数中添加第 6 层 Canvas：

```typescript
// 在 for 循环的层名数组中添加 'particle'
for (const name of ['grass', 'food', 'obstacle', 'snake', 'effects', 'particle'] as const) { ... }
```

在 `draw()` 中添加：

```typescript
import { drawParticleLayer, initParticleLayer } from '@/game/render/layers/ParticleLayer';

// 在 constructor 末尾：
initParticleLayer(/* ... */);

// 在 draw() 末尾：
drawParticleLayer(this.ctx('particle'), dt);
```

- [ ] **步骤 33.3：运行 typecheck + test**

```bash
pnpm typecheck && pnpm test
```

- [ ] **步骤 33.4：Commit**

```bash
git add src/game/render/layers/ParticleLayer.ts src/game/render/Renderer.ts
git commit -m "feat(render): 环境粒子系统（樱花/枫叶/雪/沙尘按岛屿切换）"
```

---

## 任务 34：DexView 图鉴页面 + DexCard 组件

**文件：**

- 创建：`src/components/DexCard.vue`
- 创建：`src/views/DexView.vue`
- 修改：`src/router/index.ts`
- 修改：`src/views/HomeView.vue`

**职责：** 图鉴页面三 Tab（水果/化石/称号），每项用 DexCard 展示（已解锁彩色、未解锁灰色问号）。支持导出/导入 JSON 存档。

- [ ] **步骤 34.1：创建 `src/components/DexCard.vue`**

```vue
<template>
  <div class="dex-card" :class="{ locked: !unlocked }">
    <div class="card-icon">{{ unlocked ? icon : '❓' }}</div>
    <div class="card-name">{{ unlocked ? name : '???' }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ unlocked: boolean; name: string; icon: string }>();
</script>

<style lang="less" scoped>
@import '@/styles/tokens.less';

.dex-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 16px;
  border: 2px solid @border-color-light;
  border-radius: 16px;
  background: @bg-color-content;
  transition: all 0.2s;
  &.locked { opacity: 0.45; filter: grayscale(1); }
  &.unlocked:hover { border-color: @primary-color; transform: translateY(-2px); }
}
.card-icon { font-size: 28px; }
.card-name { font-size: 12px; font-weight: 600; color: @text-color; }
</style>
```

- [ ] **步骤 34.2：创建 `src/views/DexView.vue`**

```vue
<template>
  <main class="dex-view">
    <h2 class="dex-title">图鉴</h2>

    <div class="tabs">
      <button v-for="tab in tabs" :key="tab.id" class="tab-btn" :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id">
        {{ tab.label }}
      </button>
    </div>

    <div class="dex-grid">
      <DexCard
        v-for="item in currentItems"
        :key="item.id"
        :unlocked="item.unlocked"
        :name="item.name"
        :icon="item.icon"
      />
    </div>

    <div class="dex-footer">
      <span>已解锁 {{ unlockedCount }} / {{ totalCount }}</span>
      <div class="footer-actions">
        <button class="btn-small" @click="exportData">导出存档</button>
        <button class="btn-small" @click="importData">导入存档</button>
      </div>
    </div>

    <button class="back-btn" @click="goBack">返回主菜单</button>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import DexCard from '@/components/DexCard.vue';
import { useProgressStore } from '@/stores/progress';
import { ALL_FRUIT_KINDS, FOSSIL_KINDS, ALL_TITLE_IDS, TITLE_NAMES, FOOD_SCORE } from '@/game/types';

const router = useRouter();
const progress = useProgressStore();

const tabs = [
  { id: 'fruits', label: '水果' },
  { id: 'fossils', label: '化石' },
  { id: 'titles', label: '称号' },
] as const;
const activeTab = ref<'fruits' | 'fossils' | 'titles'>('fruits');

const FRUIT_ICONS: Record<string, string> = {
  apple: '🍎', cherry: '🍒', peach: '🍑', pear: '🍐', orange: '🍊',
  coconut: '🥥', watermelon: '🍉', persimmon: '🟠', chestnut: '🌰', meteor: '⭐', golden: '👑',
};
const FOSSIL_ICONS: Record<string, string> = {
  fossil_trilobite: '🦞', fossil_dino: '🦖', fossil_ammonite: '🐚', fossil_shell: '🦪', fossil_amber: '💛',
};

const currentItems = computed(() => {
  switch (activeTab.value) {
    case 'fruits':
      return ALL_FRUIT_KINDS.map(k => ({
        id: k, name: k, icon: FRUIT_ICONS[k] ?? '🍎', unlocked: progress.dex.fruits.includes(k),
      }));
    case 'fossils':
      return FOSSIL_KINDS.map(k => ({
        id: k, name: k.replace('fossil_', ''), icon: FOSSIL_ICONS[k] ?? '🦴', unlocked: progress.dex.fossils.includes(k),
      }));
    case 'titles':
      return ALL_TITLE_IDS.map(id => ({
        id, name: TITLE_NAMES[id], icon: '🏅', unlocked: progress.dex.titles.includes(id),
      }));
  }
});

const unlockedCount = computed(() => currentItems.value.filter(i => i.unlocked).length);
const totalCount = computed(() => currentItems.value.length);

function exportData() {
  const json = progress.exportJSON();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'snake-game-save.json'; a.click();
  URL.revokeObjectURL(url);
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json';
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    const text = await file.text();
    if (progress.importJSON(text)) {
      alert('存档导入成功！');
    } else {
      alert('导入失败，文件格式不正确。');
    }
  };
  input.click();
}

function goBack() { router.push({ name: 'home' }); }
</script>

<style lang="less" scoped>
@import '@/styles/tokens.less';

.dex-view {
  min-height: 100vh;
  padding: 32px 20px;
  background: @bg-color;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
.dex-title { font-size: 32px; font-weight: 800; color: @text-color; margin: 0; }
.tabs { display: flex; gap: 8px; }
.tab-btn {
  padding: 8px 20px; border: 2px solid @border-color-light; border-radius: 50px;
  background: @bg-color-content; color: @text-color-body; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s;
  &.active { background: @primary-color; border-color: @primary-color; color: #fff; box-shadow: 0 3px 0 0 #11a89b; }
  &:hover:not(.active) { border-color: @primary-color; color: @primary-color; }
}
.dex-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 12px;
  max-width: 480px; width: 100%;
}
.dex-footer {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  max-width: 480px; width: 100%; padding: 12px 0;
  span { font-size: 14px; font-weight: 600; color: @text-color-secondary; }
}
.footer-actions { display: flex; gap: 8px; }
.btn-small {
  padding: 6px 14px; border: 2px solid @border-color-light; border-radius: 50px;
  background: @bg-color-content; color: @text-color; font-size: 12px; font-weight: 600; cursor: pointer;
  &:hover { border-color: @primary-color; color: @primary-color; }
}
.back-btn {
  margin-top: 8px; padding: 10px 32px; border: 2px solid @border-color-light; border-radius: 50px;
  background: @bg-color-content; color: @text-color; font-size: 15px; font-weight: 600; cursor: pointer;
  &:hover { border-color: @primary-color; color: @primary-color; }
}
</style>
```

- [ ] **步骤 34.3：更新 `src/router/index.ts`**

添加路由：

```typescript
import DexView from '@/views/DexView.vue';
// routes 中追加：
{ path: '/dex', name: 'dex', component: DexView },
```

- [ ] **步骤 34.4：更新 `src/views/HomeView.vue`**

在 footer-links 区域添加图鉴按钮：

```vue
<button class="link-btn" @click="goDex">图鉴</button>
```
并在 script 中添加：
```typescript
function goDex() { router.push({ name: 'dex' }); }
```

- [ ] **步骤 34.5：运行 typecheck + test**

```bash
pnpm typecheck && pnpm test
```

- [ ] **步骤 34.6：Commit**

```bash
git add src/components/DexCard.vue src/views/DexView.vue src/router/index.ts src/views/HomeView.vue
git commit -m "feat(ui): 图鉴页面（水果/化石/称号三Tab + 导入导出JSON）"
```

---

## 任务 35：DailyShareCard + GameOverModal 升级

**文件：**

- 创建：`src/components/DailyShareCard.vue`
- 修改：`src/components/GameOverModal.vue`
- 安装：`html2canvas`

**职责：** 每日挑战结算时展示可导出的分享卡；GameOverModal 区分自由/每日模式、显示新解锁内容、提供分享按钮。

- [ ] **步骤 35.1：安装 html2canvas**

```bash
pnpm add html2canvas
```

- [ ] **步骤 35.2：创建 `src/components/DailyShareCard.vue`**

```vue
<template>
  <div ref="cardRef" class="share-card" :style="cardStyle">
    <div class="share-header">今日挑战</div>
    <div class="share-date">{{ dateStr }}</div>
    <div class="share-island">{{ islandName }}</div>
    <div class="share-score">{{ score }} 分</div>
    <div class="share-length">长度 {{ length }} 节</div>
    <div class="share-footer">🕹️ 动森贪吃蛇</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { IslandId } from '@/game/types';
import { ISLANDS } from '@/game/levels/islands';

const props = defineProps<{
  dateStr: string; score: number; length: number; island: IslandId;
  accentColor: string; bgColor: string;
}>();

const cardRef = ref<HTMLElement | null>(null);

const islandName = computed(() => ISLANDS[props.island]?.name ?? '');
const cardStyle = computed(() => ({
  '--accent': props.accentColor,
  '--bg': props.bgColor,
}));

defineExpose({ cardRef });
</script>

<style lang="less" scoped>
.share-card {
  width: 420px; height: 560px;
  background: var(--bg, #f8f8f0);
  border: 4px solid var(--accent, #19c8b9);
  border-radius: 32px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 16px; padding: 40px;
  font-family: Nunito, 'Noto Sans SC', sans-serif;
  color: #794f27;
}
.share-header { font-size: 22px; font-weight: 700; }
.share-date { font-size: 16px; color: #9f927d; font-weight: 500; }
.share-island { font-size: 28px; font-weight: 800; color: var(--accent); }
.share-score { font-size: 64px; font-weight: 900; line-height: 1; }
.share-length { font-size: 18px; color: #725d42; font-weight: 600; }
.share-footer { font-size: 14px; color: #9f927d; margin-top: auto; }
</style>
```

- [ ] **步骤 35.3：更新 `src/components/GameOverModal.vue`**

升级内容：
- 传入 `mode` prop，区分自由/每日
- 传入 `newUnlocks: string[]`（新解锁的成就/称号/化石列表）
- 传入 `isDaily` 决定是否显示 DailyShareCard
- "保存图片"按钮调用 html2canvas 导出

关键新增代码：
```vue
<DailyShareCard
  v-if="isDaily"
  ref="shareCardRef"
  :date-str="dateStr"
  :score="score"
  :length="length"
  :island="island"
  :accent-color="accentColor"
  :bg-color="bgColor"
/>
<button v-if="isDaily" @click="saveImage">保存图片</button>

<script>
import html2canvas from 'html2canvas';
// saveImage 函数：
async function saveImage() {
  if (!shareCardRef.value?.cardRef) return;
  const canvas = await html2canvas(shareCardRef.value.cardRef, { scale: 2 });
  const link = document.createElement('a');
  link.download = `snake-daily-${props.dateStr}.png`;
  link.href = canvas.toDataURL();
  link.click();
}
</script>
```

- [ ] **步骤 35.4：运行 typecheck + test**

```bash
pnpm typecheck && pnpm test
```

- [ ] **步骤 35.5：Commit**

```bash
git add src/components/DailyShareCard.vue src/components/GameOverModal.vue package.json pnpm-lock.yaml
git commit -m "feat(ui): DailyShareCard 分享卡 + GameOverModal 模式区分 + html2canvas 导出"
```

---

## 任务 36：GameView 集成 + 解锁日志传递

**文件：**

- 修改：`src/views/GameView.vue`
- 修改：`src/components/GameCanvas.vue`

**职责：** GameView 从 GameCanvas 接收解锁事件、传递 mode/daily 参数给 GameOverModal；GameCanvas 在 die 事件前裁决成就/称号并通过新 emit 上报。

- [ ] **步骤 36.1：更新 `src/components/GameCanvas.vue`**

新增 emit：
```typescript
const emit = defineEmits<{
  scoreChange: [score: number];
  die: [payload: { score: number; length: number; island: IslandId; mode: ModeId }];
  eat: [payload: { foodKind: string; snakeLength: number }];
  unlock: [payload: { achievements: string[]; titles: string[]; fossils: string[]; newIslands: string[] }];
}>();
```

在 die 事件 emit 前收集解锁内容，emit('unlock', { ... })。

- [ ] **步骤 36.2：更新 `src/views/GameView.vue`**

添加解锁状态：
```typescript
const newUnlocks = ref<string[]>([]);
const isDailyMode = computed(() => mode === 'daily');
```

在 `onDie` 中接收 unlock 事件数据，展示 newUnlocks。

- [ ] **步骤 36.3：运行 typecheck + test**

```bash
pnpm typecheck && pnpm test
```

- [ ] **步骤 36.4：Commit**

```bash
git add src/views/GameView.vue src/components/GameCanvas.vue
git commit -m "feat(ui): GameView 集成解锁事件传递"
```

---

## 任务 37：单测补充（Obstacle + Achievements + Titles）

**文件：**

- 创建：`tests/game/Obstacle.test.ts`
- 创建：`tests/game/achievements.test.ts`
- 创建：`tests/game/titles.test.ts`

- [ ] **步骤 37.1：创建 `tests/game/Obstacle.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { Rng } from '@/game/core/Rng';
import { generateObstacles } from '@/game/core/Obstacle';

describe('generateObstacles', () => {
  it('should generate correct count with given density', () => {
    const rng = new Rng(42);
    const size = 22;
    const obstacles = generateObstacles(rng, size, 0.03, [{ x: 10, y: 10 }]);
    const expected = Math.floor(size * size * 0.03); // 约 14
    expect(obstacles.length).toBeGreaterThanOrEqual(expected - 2);
    expect(obstacles.length).toBeLessThanOrEqual(expected + 2);
  });

  it('should not place obstacles on snake body or within 3 cells', () => {
    const rng = new Rng(42);
    const obstacles = generateObstacles(rng, 22, 0.03, [{ x: 10, y: 10 }, { x: 11, y: 10 }]);
    for (const ob of obstacles) {
      const dist = Math.max(Math.abs(ob.x - 10), Math.abs(ob.y - 10));
      expect(dist).toBeGreaterThan(3);
    }
  });

  it('should be deterministic with same seed', () => {
    const rng1 = new Rng(123);
    const rng2 = new Rng(123);
    const o1 = generateObstacles(rng1, 22, 0.03, [{ x: 10, y: 10 }]);
    const o2 = generateObstacles(rng2, 22, 0.03, [{ x: 10, y: 10 }]);
    expect(o1).toEqual(o2);
  });
});
```

- [ ] **步骤 37.2：`tests/game/achievements.test.ts`** — 验证各成就条件触发逻辑

- [ ] **步骤 37.3：`tests/game/titles.test.ts`** — 验证各称号条件触发逻辑

- [ ] **步骤 37.4：运行 test**

```bash
pnpm test
```

- [ ] **步骤 37.5：Commit**

```bash
git add tests/game/Obstacle.test.ts tests/game/achievements.test.ts tests/game/titles.test.ts
git commit -m "test: Obstacle + Achievements + Titles 单测"
```

---

## 任务 38：端到端验收

- [ ] **步骤 38.1：运行全部检查**

```bash
pnpm test && pnpm typecheck && pnpm lint
```

- [ ] **步骤 38.2：启动开发服务器验证功能**

```bash
pnpm dev
```

1. 主菜单 → 5 岛选择器，仅春樱解锁（其余灰显+锁）
2. 春樱岛自由模式 → 正常游戏
3. 吃水果 → 图鉴水果页新增解锁
4. 春樱得分 ≥ 100 → 称号解锁"春之访客"
5. 每日挑战 → 固定种子棋盘 + 障碍物 + 固定岛屿
6. 每日死亡 → 每日结算 + 可导出 PNG 分享图
7. 图鉴页 → 三 Tab 切换 + 导入导出
8. 化石岛 → 集齐 5 化石解锁

- [ ] **步骤 38.3：Commit**

```bash
git add -A
git commit -m "chore: 阶段 3 完成 - 关卡与玩法深度验收通过"
```

---

## 阶段 3 完成标准

- [x] 5 个岛屿解锁条件正确（累计分数 + 化石岛特殊条件）
- [x] 食物按岛独立概率表生成（水果/化石/流星/金苹果）
- [x] 每日挑战确定性棋盘 + 障碍物 + 每日固定岛屿
- [x] 化石图鉴录入 + 集齐 5 种解锁化石岛
- [x] 10 个成就可触发 + 全屏闪光通知（复用 EffectsLayer）
- [x] 10 个称号按条件解锁
- [x] DexView 三 Tab 图鉴 + 导入导出 JSON
- [x] DailyShareCard + html2canvas PNG 导出
- [x] 环境粒子系统（樱花瓣/枫叶/雪/沙尘）
- [x] 所有测试通过 + typecheck + lint 零错误

---

## 附录：阶段 3→4 预留扩展点

| 阶段 3 实现 | 阶段 4 扩展 |
|---|---|
| `ParticleLayer.ts` 代码绘制 | 阶段 4 可替换为 SVG 图片粒子 |
| `SettingsView` 音量滑块未接入 AudioManager | 阶段 4 接入 Howler.js |
| `GameOverModal` 新增 unlock/new 提示 | 阶段 4 接入 Typewriter 打字机效果 |
| `ObstacleLayer` 树桩绘制 | 阶段 4 可用 SVG sprite 替换 |
| `DailyShareCard` 导出 | 阶段 4 优化移动端保存体验 |
| `progress.importJSON/exportJSON` | 阶段 4 添加导出前确认 Modal |
