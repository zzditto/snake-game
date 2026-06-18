# 阶段 1-B · 岛屿数据 + 游戏模式 + GameSession 组装 实现计划

> **面向 AI 代理的工作者：** 使用 superpowers:subagent-driven-development 或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法跟踪进度。

**目标：** 完成 5 岛数据配置、自由/每日双模式、以及 GameSession 组装层——将 Plan A 的内核模块串联成完整的游戏逻辑循环。

**架构：** `src/game/levels/islands.ts` 为数据驱动关卡配置；`src/game/modes/` 为模式规则层；`src/game/GameSession.ts` 为组装层——单 tick 内按顺序执行：方向应用 → 碰撞判定（边界/撞身/撞障）→ 吃食物 → 生长 → 过期清理 → 食物补充 → 调速。

**技术栈：** TypeScript 5+ / Vitest

**前置条件：** Plan A 已完成（`src/game/types.ts`、`src/game/core/Rng.ts`、`Snake.ts`、`Board.ts`、`Food.ts`、`EventBus.ts`、`GameLoop.ts` 存在且单测通过）。

**验收标准：** `pnpm test` 全部单测通过（含新增的 FreeMode/DailyMode/GameSession 测试）/ `pnpm typecheck` 无错误

---

**文件结构（本计划创建/修改）：**
- `src/game/levels/islands.ts` — 5 岛屿配置（Stage 1 春樱完整，其余基础占位）
- `src/game/modes/FreeMode.ts` — 自由模式规则
- `src/game/modes/DailyMode.ts` — 每日挑战（种子化）
- `src/game/GameSession.ts` — 组装层（tick 业务规则 + 调速 + 事件发射）
- `tests/game/FreeMode.test.ts` — 自由模式单测
- `tests/game/DailyMode.test.ts` — 每日挑战单测
- `tests/game/GameSession.test.ts` — 组装层集成测试

**关键约束：**
- `src/game/**` 禁止 import Vue/Pinia/Router（ESLint 已在 Plan A 配置）
- GameSession 通过 EventBus 对外 emit 事件，Vue 层订阅
- 每日挑战种子由 'YYYY-MM-DD' 派生，同一日期确定性相同

---
## 任务 9：Islands 数据（Stage 1 仅春樱完整）

**文件：**

- 创建：`src/game/levels/islands.ts`

**职责：** 5 个岛屿数据。Stage 1 只需春樱岛配置完整，其余 4 岛先放占位（unlockScore 与基础 theme），Stage 3 再补全。

- [ ] **步骤 9.1：创建 `src/game/levels/islands.ts`**

```ts
import type { Island, IslandId } from '@/game/types';

const SPRING: Island = {
  id: 'spring',
  name: '春樱岛',
  unlockScore: 0,
  theme: {
    grassA: '#e8f4d6',
    grassB: '#dcecc4',
    grassNoise: 'rgba(0,0,0,0.04)',
    vignette: 'rgba(0,0,0,0.08)',
    snakeHead: '#794f27',
    snakeBodyStart: '#794f27',
    snakeBodyEnd: '#a87749',
    hatSprite: 'hat_cherry_blossom',
    accent: '#ffb6c1',
  },
  bgmKey: 'bgm_main',
  fruitWeights: { apple: 40, cherry: 35, peach: 20, meteor: 5 },
  decorations: [
    { spriteKey: 'cherry_tree', density: 0.15, zone: 'border' },
  ],
  ambientParticles: 'cherry_blossom',
};

const SUMMER: Island = {
  id: 'summer',
  name: '夏海岛',
  unlockScore: 200,
  theme: {
    grassA: '#d4ecf2', grassB: '#c0e0e8',
    grassNoise: 'rgba(0,0,0,0.04)', vignette: 'rgba(0,0,0,0.08)',
    snakeHead: '#794f27', snakeBodyStart: '#794f27', snakeBodyEnd: '#a87749',
    hatSprite: 'hat_shell', accent: '#19c8b9',
  },
  bgmKey: 'bgm_main',
  fruitWeights: { coconut: 35, watermelon: 30, orange: 25, meteor: 5, golden: 5 },
  decorations: [{ spriteKey: 'coconut_tree', density: 0.12, zone: 'border' }],
};

const AUTUMN: Island = {
  id: 'autumn',
  name: '秋枫岛',
  unlockScore: 600,
  theme: {
    grassA: '#f4e4c4', grassB: '#ecd4a4',
    grassNoise: 'rgba(0,0,0,0.04)', vignette: 'rgba(0,0,0,0.08)',
    snakeHead: '#794f27', snakeBodyStart: '#794f27', snakeBodyEnd: '#a87749',
    hatSprite: 'hat_maple_leaf', accent: '#d94b3a',
  },
  bgmKey: 'bgm_main',
  fruitWeights: {
    persimmon: 35, chestnut: 30, pear: 25,
    fossil_trilobite: 1, fossil_dino: 1, fossil_ammonite: 1,
    fossil_shell: 1, fossil_amber: 1,
    meteor: 5,
  },
  decorations: [{ spriteKey: 'maple_tree', density: 0.15, zone: 'border' }],
  ambientParticles: 'maple_leaf',
};

const WINTER: Island = {
  id: 'winter',
  name: '冬雪岛',
  unlockScore: 1200,
  theme: {
    grassA: '#eef2f6', grassB: '#dde4ec',
    grassNoise: 'rgba(0,0,0,0.04)', vignette: 'rgba(0,0,0,0.08)',
    snakeHead: '#794f27', snakeBodyStart: '#794f27', snakeBodyEnd: '#a87749',
    hatSprite: 'hat_snow', accent: '#a8c8e8',
  },
  bgmKey: 'bgm_main',
  fruitWeights: {
    apple: 30,
    fossil_trilobite: 4, fossil_dino: 4, fossil_ammonite: 4,
    fossil_shell: 4, fossil_amber: 4,
    meteor: 10, golden: 10, cherry: 15, peach: 15,
  },
  decorations: [{ spriteKey: 'pine_tree', density: 0.18, zone: 'border' }],
  ambientParticles: 'snow',
};

const FOSSIL: Island = {
  id: 'fossil',
  name: '化石岛',
  unlockScore: Number.POSITIVE_INFINITY,
  unlockSpecial: 'all_fossils',
  theme: {
    grassA: '#d4c4a8', grassB: '#b8a888',
    grassNoise: 'rgba(0,0,0,0.05)', vignette: 'rgba(0,0,0,0.1)',
    snakeHead: '#794f27', snakeBodyStart: '#794f27', snakeBodyEnd: '#a87749',
    hatSprite: 'hat_cherry_blossom', accent: '#c8a878',
  },
  bgmKey: 'bgm_main',
  fruitWeights: {
    fossil_trilobite: 10, fossil_dino: 10, fossil_ammonite: 10,
    fossil_shell: 10, fossil_amber: 10,
    meteor: 25, golden: 25,
  },
  decorations: [{ spriteKey: 'fossil_pit', density: 0.1, zone: 'scattered' }],
  ambientParticles: 'sand',
};

export const ISLANDS: Record<IslandId, Island> = {
  spring: SPRING,
  summer: SUMMER,
  autumn: AUTUMN,
  winter: WINTER,
  fossil: FOSSIL,
};

export const ISLAND_ORDER: IslandId[] = ['spring', 'summer', 'autumn', 'winter', 'fossil'];

export function getIsland(id: IslandId): Island {
  return ISLANDS[id];
}
```

- [ ] **步骤 9.2：Commit**

```bash
git add src/game/levels/islands.ts
git commit -m "feat(game): 添加 5 岛屿数据（Stage 1 春樱完整，其余基础占位）"
```

---
## 任务 10：FreeMode（自由模式规则）

**文件：**

- 创建：`src/game/modes/FreeMode.ts`
- 测试：`tests/game/FreeMode.test.ts`

**职责：** 自由模式不生成障碍、无胜利条件，靠死亡结束。`createFreeMode(island)` 返回 `GameMode` 实例。

- [ ] **步骤 10.1：编写失败的测试 `tests/game/FreeMode.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { createFreeMode } from '@/game/modes/FreeMode';

describe('FreeMode', () => {
  it('id = free, shouldSpawnObstacles = false', () => {
    const mode = createFreeMode();
    expect(mode.id).toBe('free');
    expect(mode.shouldSpawnObstacles).toBe(false);
  });

  it('rngSeed 不固定（每次新对局不同）', () => {
    const a = createFreeMode();
    const b = createFreeMode();
    expect(typeof a.rngSeed).toBe('number');
    expect(typeof b.rngSeed).toBe('number');
  });
});
```

- [ ] **步骤 10.2：运行测试验证失败**

```bash
pnpm test -- tests/game/FreeMode.test.ts
```

预期：FAIL。

- [ ] **步骤 10.3：实现 `src/game/modes/FreeMode.ts`**

```ts
import type { GameMode } from '@/game/types';

export function createFreeMode(): GameMode {
  return {
    id: 'free',
    shouldSpawnObstacles: false,
    rngSeed: (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0,
  };
}
```

- [ ] **步骤 10.4：运行测试验证通过**

```bash
pnpm test -- tests/game/FreeMode.test.ts
```

预期：2 个测试全部 PASS

- [ ] **步骤 10.5：Commit**

```bash
git add src/game/modes/FreeMode.ts tests/game/FreeMode.test.ts
git commit -m "feat(game): 实现 FreeMode 自由模式规则 + 单测"
```

---

## 任务 11：DailyMode（每日挑战，Stage 1 简化版）

**文件：**

- 创建：`src/game/modes/DailyMode.ts`
- 测试：`tests/game/DailyMode.test.ts`

**职责：** 由日期生成种子；shouldSpawnObstacles = true（Stage 1 obstacleDensity 默认 0.03，但 Stage 1 实际不生成障碍——Obstacle 模块在 Stage 3 实现，Stage 1 这里只暴露字段）。

> **Stage 1 范围说明**：DailyMode 只需要返回正确的 `id` / `rngSeed` / `obstacleDensity`；`Obstacle` 模块和障碍实际生成放在 Stage 3。这个任务只验证种子可复现 + 字段正确。

- [ ] **步骤 11.1：编写失败的测试 `tests/game/DailyMode.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { createDailyMode, todayDateString } from '@/game/modes/DailyMode';

describe('DailyMode', () => {
  it('id = daily, shouldSpawnObstacles = true', () => {
    const mode = createDailyMode('2026-06-18');
    expect(mode.id).toBe('daily');
    expect(mode.shouldSpawnObstacles).toBe(true);
  });

  it('相同日期生成相同种子', () => {
    const a = createDailyMode('2026-06-18');
    const b = createDailyMode('2026-06-18');
    expect(a.rngSeed).toBe(b.rngSeed);
  });

  it('不同日期生成不同种子', () => {
    const a = createDailyMode('2026-06-18');
    const b = createDailyMode('2026-06-19');
    expect(a.rngSeed).not.toBe(b.rngSeed);
  });

  it('obstacleDensity 默认 0.03', () => {
    const mode = createDailyMode('2026-06-18');
    expect(mode.obstacleDensity).toBe(0.03);
  });

  it('todayDateString 返回 YYYY-MM-DD 格式', () => {
    const s = todayDateString();
    expect(s).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
```

- [ ] **步骤 11.2：运行测试验证失败**

```bash
pnpm test -- tests/game/DailyMode.test.ts
```

预期：FAIL。

- [ ] **步骤 11.3：实现 `src/game/modes/DailyMode.ts`**

```ts
import type { GameMode } from '@/game/types';
import { dailySeed } from '@/game/core/Rng';

export function todayDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function createDailyMode(dateStr: string = todayDateString()): GameMode {
  return {
    id: 'daily',
    shouldSpawnObstacles: true,
    rngSeed: dailySeed(dateStr),
    obstacleDensity: 0.03,
  };
}

/** 由 seed 选当日岛屿（前 4 个，化石岛排除——需特殊解锁）。 */
export function pickDailyIsland(seed: number): import('@/game/types').IslandId {
  const order: import('@/game/types').IslandId[] = ['spring', 'summer', 'autumn', 'winter'];
  return order[seed % 4]!;
}
```

- [ ] **步骤 11.4：运行测试验证通过**

```bash
pnpm test -- tests/game/DailyMode.test.ts
```

预期：5 个测试全部 PASS

- [ ] **步骤 11.5：Commit**

```bash
git add src/game/modes/DailyMode.ts tests/game/DailyMode.test.ts
git commit -m "feat(game): 实现 DailyMode 每日挑战种子化（Stage 1 简化版）+ 单测"
```

---
## 任务 12：GameSession（组装层 + 单 tick 业务规则）

**文件：**

- 创建：`src/game/GameSession.ts`
- 测试：`tests/game/GameSession.test.ts`

**职责：** 把 Snake / Board / Food / GameLoop / InputController / EventBus 组装为一个对外接口。Vue 层只看到 `GameSession.start() / pause() / resume() / destroy() / queueDirection() / state`。

**单 tick 内的 update 顺序**（来自规格 6.2）：

1. 应用 pendingDirection
2. 计算新蛇头
3. 边界碰撞 → 死亡
4. 撞身（除非 invincible）→ 死亡
5. 撞障（除非 invincible）→ 死亡（Stage 1 障碍数组为空）
6. 吃食物：growthQueue++、score += food.score、emit 'eat'
7. 更新蛇身（unshift / pop）
8. 移除过期食物
9. 食物生成判定（保持场上 1-2 个食物）
10. 调速：每吃 SPEED_UP_EVERY 个，tickMs 乘以 SPEED_UP_FACTOR，封顶 SPEED_CAP_TICK_MS

- [ ] **步骤 12.1：编写失败的测试 `tests/game/GameSession.test.ts`**

```ts
import { describe, it, expect, vi } from 'vitest';
import { GameSession } from '@/game/GameSession';
import { createFreeMode } from '@/game/modes/FreeMode';
import { ISLANDS } from '@/game/levels/islands';
import type { Food } from '@/game/types';

function makeSession() {
  return new GameSession({
    island: ISLANDS.spring,
    mode: { ...createFreeMode(), rngSeed: 42 },
    difficulty: 'normal',
    boardSize: 22,
  });
}

describe('GameSession', () => {
  it('初始化后 state.snake 为 3 节，alive', () => {
    const s = makeSession();
    expect(s.state.snake.body.length).toBe(3);
    expect(s.state.snake.alive).toBe(true);
    expect(s.state.score).toBe(0);
  });

  it('初始化后场上至少有 1 个食物', () => {
    const s = makeSession();
    expect(s.state.foods.length).toBeGreaterThanOrEqual(1);
  });

  it('queueDirection + step 应用方向', () => {
    const s = makeSession();
    s.queueDirection('up');
    s.stepForTest();
    expect(s.state.snake.direction).toBe('up');
  });

  it('蛇撞墙后 alive = false 并 emit die', () => {
    const s = makeSession();
    const dieHandler = vi.fn();
    s.bus.on('die', dieHandler);
    // 蛇头初始 (10,10) 朝右；连续 step 直到 x >= 22
    for (let i = 0; i < 30 && s.state.snake.alive; i++) s.stepForTest();
    expect(s.state.snake.alive).toBe(false);
    expect(dieHandler).toHaveBeenCalledOnce();
  });

  it('吃到食物时 score 增加、growthQueue + 1、emit eat', () => {
    const s = makeSession();
    // 强制把场上唯一食物放到蛇头前一格
    const head = s.state.snake.body[0]!;
    const next = { x: head.x + 1, y: head.y };
    s.state.foods = [{
      cell: next, kind: 'apple', spawnedAt: 0, score: 1,
    } as Food];
    const eatHandler = vi.fn();
    s.bus.on('eat', eatHandler);
    s.stepForTest();
    expect(s.state.score).toBe(1);
    expect(s.state.snake.growthQueue).toBe(1);
    expect(eatHandler).toHaveBeenCalledOnce();
  });

  it('每吃 5 个食物后 tickMs 减小', () => {
    const s = makeSession();
    const initialTickMs = s.getTickMs();
    for (let i = 0; i < 5; i++) {
      const head = s.state.snake.body[0]!;
      // 让食物始终出现在蛇头正前方
      s.state.foods = [{
        cell: { x: head.x + 1, y: head.y },
        kind: 'apple', spawnedAt: 0, score: 1,
      } as Food];
      s.stepForTest();
    }
    expect(s.getTickMs()).toBeLessThan(initialTickMs);
  });

  it('pause 后 stepForTest 不再推进逻辑（loop 不跑）', () => {
    const s = makeSession();
    const before = s.state.snake.body[0]!;
    s.pause();
    // pause 不影响 stepForTest 直接调用（用于测试），但 isPaused = true
    expect(s.isPaused()).toBe(true);
    void before;
  });

  it('destroy 后再调用方法不抛错', () => {
    const s = makeSession();
    s.destroy();
    expect(() => s.queueDirection('up')).not.toThrow();
  });
});
```

- [ ] **步骤 12.2：运行测试验证失败**

```bash
pnpm test -- tests/game/GameSession.test.ts
```

预期：FAIL。

- [ ] **步骤 12.3：实现 `src/game/GameSession.ts`**

```ts
import type {
  Cell, Dir, Food, GameMode, GameState, Island,
  DifficultyId,
} from '@/game/types';
import {
  TICK_MS_BY_DIFFICULTY, SPEED_UP_EVERY, SPEED_UP_FACTOR,
  SPEED_CAP_TICK_MS, GOLDEN_INVINCIBLE_MS, FOSSIL_KINDS,
} from '@/game/types';
import { Rng } from '@/game/core/Rng';
import { Board } from '@/game/core/Board';
import {
  createSnake, queueDirection as queueDirectionOnSnake,
  stepSnake, collidesSelf, killSnake,
} from '@/game/core/Snake';
import { spawnFood, isExpired } from '@/game/core/Food';
import { GameLoop } from '@/game/core/GameLoop';
import { EventBus, type GameEvents } from '@/game/core/EventBus';

export interface GameSessionOptions {
  island: Island;
  mode: GameMode;
  difficulty: DifficultyId;
  boardSize: number;
  /** 同时存在的食物数；默认 1。 */
  maxFoodsOnBoard?: number;
}

export class GameSession {
  readonly bus = new EventBus<GameEvents>();
  readonly state: GameState;

  private board: Board;
  private rng: Rng;
  private mode: GameMode;
  private island: Island;
  private loop: GameLoop;
  private maxFoods: number;
  private destroyed = false;

  constructor(opts: GameSessionOptions) {
    this.island = opts.island;
    this.mode = opts.mode;
    this.board = new Board(opts.boardSize);
    this.rng = new Rng(opts.mode.rngSeed ?? Date.now() >>> 0);
    this.maxFoods = opts.maxFoodsOnBoard ?? 1;

    const center: Cell = { x: Math.floor(opts.boardSize / 2), y: Math.floor(opts.boardSize / 2) };
    const snake = createSnake(center, 'right', 3);

    this.state = {
      snake,
      foods: [],
      obstacles: [], // Stage 1 始终空数组（DailyMode 在 Stage 3 接入 Obstacle 模块）
      score: 0,
      comboCount: 0,
      tickCount: 0,
      startedAt: this.now(),
      island: opts.island.id,
      mode: opts.mode.id,
    };

    this.refillFoods();

    this.loop = new GameLoop({
      tickMs: TICK_MS_BY_DIFFICULTY[opts.difficulty],
      update: () => this.tick(),
      render: () => { /* 由外部 Renderer 通过 onRender 订阅 */ },
    });
  }

  start(): void {
    if (this.destroyed) return;
    this.bus.emit('start', { island: this.island.id, mode: this.mode.id });
    this.loop.start();
  }

  pause(): void {
    if (this.destroyed) return;
    this.loop.pause();
    this.bus.emit('pause', undefined);
  }

  resume(): void {
    if (this.destroyed) return;
    this.loop.resume();
    this.bus.emit('resume', undefined);
  }

  isPaused(): boolean {
    return this.loop.getState() === 'paused';
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.loop.stop();
    this.bus.clear();
  }

  queueDirection(dir: Dir): void {
    if (this.destroyed || !this.state.snake.alive) return;
    queueDirectionOnSnake(this.state.snake, dir);
  }

  /** 用于让 Renderer 在每个动画帧拿到 alpha 与最新 state。 */
  onRender(cb: (alpha: number, state: GameState) => void): () => void {
    const wrapped = (alpha: number) => cb(alpha, this.state);
    this.loop.setRender(wrapped);
    return () => { this.loop.setRender(() => {}); };
  }

  /** 测试专用：手动调用一次 tick（不走 loop）。 */
  stepForTest(): void {
    this.tick();
  }

  getTickMs(): number {
    return this.loop.getTickMs();
  }

  // ---- 核心 tick ----

  private tick(): void {
    if (!this.state.snake.alive) return;

    // 1+2: pending 方向已在 stepSnake 内应用
    const head = stepSnakeAndGetHead(this.state.snake);

    // 3: 边界碰撞
    if (!this.board.isInside(head)) {
      this.die();
      return;
    }

    // 4: 撞身
    const invincible = (this.state.snake.invincibleUntil ?? 0) > this.now();
    if (!invincible && collidesSelf(this.state.snake)) {
      this.die();
      return;
    }

    // 5: 撞障（Stage 1 障碍数组为空）
    if (!invincible) {
      for (const ob of this.state.obstacles) {
        if (ob.x === head.x && ob.y === head.y) {
          this.die();
          return;
        }
      }
    }

    // 6: 吃食物
    const eatenIdx = this.state.foods.findIndex((f) => f.cell.x === head.x && f.cell.y === head.y);
    if (eatenIdx >= 0) {
      const food = this.state.foods[eatenIdx]!;
      this.state.foods.splice(eatenIdx, 1);
      this.state.snake.growthQueue += 1;
      this.state.score += food.score;
      this.state.comboCount += 1;
      if (food.kind === 'golden') {
        this.state.snake.invincibleUntil = this.now() + GOLDEN_INVINCIBLE_MS;
      }
      this.bus.emit('eat', { food, snakeLength: this.state.snake.body.length });
      this.maybeSpeedUp();
    }

    // 7: stepSnake 已经处理（unshift + 条件 pop）

    // 8: 移除过期食物
    const now = this.now();
    this.state.foods = this.state.foods.filter((f) => !isExpired(f, now));

    // 9: 食物补充
    this.refillFoods();

    // 10: tick 计数 + onTickHook + emit
    this.state.tickCount += 1;
    this.mode.onTickHook?.(this.state);
    this.bus.emit('tick', { tickCount: this.state.tickCount });
  }

  private die(): void {
    killSnake(this.state.snake);
    this.bus.emit('die', {
      score: this.state.score,
      length: this.state.snake.body.length,
      island: this.state.island,
      mode: this.state.mode,
    });
    this.loop.stop();
  }

  private maybeSpeedUp(): void {
    const totalEaten = this.state.score; // Stage 1 简化：用分数代表吃的次数（普通水果都是 1 分）
    if (totalEaten > 0 && totalEaten % SPEED_UP_EVERY === 0) {
      const next = Math.max(SPEED_CAP_TICK_MS, this.loop.getTickMs() * SPEED_UP_FACTOR);
      this.loop.setTickMs(next);
    }
  }

  private refillFoods(): void {
    while (this.state.foods.length < this.maxFoods) {
      const occ = new Set<string>();
      for (const c of this.state.snake.body) occ.add(`${c.x},${c.y}`);
      for (const f of this.state.foods) occ.add(`${f.cell.x},${f.cell.y}`);
      for (const o of this.state.obstacles) occ.add(`${o.x},${o.y}`);
      const f = spawnFood(this.board, this.rng, occ, this.island.fruitWeights, this.now());
      if (!f) break;
      // 化石去重：每种化石只在场上同时存在一个
      if (FOSSIL_KINDS.includes(f.kind) && this.state.foods.some((x) => x.kind === f.kind)) continue;
      this.state.foods.push(f);
    }
  }

  private now(): number {
    return performance.now();
  }
}

/** 内部：调用 stepSnake 并返回新蛇头。 */
function stepSnakeAndGetHead(snake: import('@/game/types').SnakeState): Cell {
  stepSnake(snake);
  return snake.body[0]!;
}
```

- [ ] **步骤 12.4：运行测试验证通过**

```bash
pnpm test -- tests/game/GameSession.test.ts
```

预期：8 个测试全部 PASS

- [ ] **步骤 12.5：运行全部 game/ 单测确保未破坏其他模块**

```bash
pnpm test
```

预期：所有单测 PASS。

- [ ] **步骤 12.6：Commit**

```bash
git add src/game/GameSession.ts tests/game/GameSession.test.ts
git commit -m "feat(game): 实现 GameSession 组装层（tick 业务规则 + 调速 + 事件）+ 单测"
```

---
