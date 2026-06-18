# 阶段 1-C · Vue 装载 + 渲染 + 可玩验收 实现计划

> **面向 AI 代理的工作者：** 使用 superpowers:subagent-driven-development 或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法跟踪进度。

**目标：** 将 Plan B 完成的游戏内核装入 Vue 3 骨架，实现 Pinia 持久化、5 层 Canvas 纯色矩形渲染、HUD/Modal UI 组件、以及浏览器可玩的完整流程。

**架构：** `src/stores/` 为 Pinia 持久化层；`src/game/render/` 为 5 层 Canvas 渲染器；`src/components/GameCanvas.vue` 为 Vue 装载器（关联 GameSession + Renderer + InputController）；`src/views/HomeView.vue` 和 `GameView.vue` 为路由页面。

**技术栈：** Vue 3.4+ / TypeScript / Pinia / Vue Router 4 / Less / animal-island-vue

**前置条件：** Plan B 已完成（所有 `src/game/**` 模块存在且单测通过，`GameSession` 可独立使用）。

**验收标准：**
- 浏览器打开 → 主菜单（两个按钮）→ 进入游戏
- WASD/方向键控制蛇，吃食物变长+得分
- 撞墙弹结算 Modal，可重开/返回菜单
- 暂停/恢复（Space/P）
- 自由模式 + 每日挑战均可进入
- `pnpm test` 全部单测通过
- `pnpm typecheck` 无错误 / `pnpm lint` 无错误

---

**文件结构（本计划创建/修改）：**
- `src/stores/settings.ts` — Pinia 难度设置 + localStorage 持久化
- `src/stores/progress.ts` — Pinia 最高分 + localStorage 持久化
- `src/game/render/theme.ts` — 主题 token 辅助
- `src/game/render/layers/GrassLayer.ts` — 草地棋盘绘制
- `src/game/render/layers/FoodLayer.ts` — 食物圆形绘制
- `src/game/render/layers/SnakeLayer.ts` — 蛇身 pill + 眼睛绘制
- `src/game/render/layers/EffectsLayer.ts` — 特效层（Stage 1 空壳）
- `src/game/render/layers/ObstacleLayer.ts` — 障碍层（Stage 1 空壳）
- `src/game/render/Renderer.ts` — 5 层 Canvas 编排器
- `src/components/GameCanvas.vue` — Vue 装载器（原生 GameCanvas 组件的正确重命名）
- `src/components/GameHUD.vue` — 顶部分数/长度/暂停
- `src/components/GameOverModal.vue` — 死亡结算弹窗
- `src/views/HomeView.vue` — 主菜单页面（替换占位）
- `src/views/GameView.vue` — 游戏页面（替换占位，组装 Canvas+HUD+Modal）

**关键约束：**
- Pinia store 是 localStorage 的唯一读写出入口，不允许其他位置直接读写 localStorage
- Vue 组件不超过 300 行
- Renderer 每帧 draw() 被 GameSession.onRender 回调触发

---
## 任务 13：Pinia stores（settings + progress，Stage 1 最小版）

**文件：**

- 创建：`src/stores/settings.ts`、`src/stores/progress.ts`

**职责：**
- `settings.ts`：管理难度（影响 GameSession 的 tickMs）。Stage 1 只有难度一个字段。
- `progress.ts`：管理最高分（按岛）。Stage 1 只存 highScore，Stage 3 再扩展 dex/achievements。

**持久化**：localStorage key `snake-game.settings` / `snake-game.progress`。

- [ ] **步骤 13.1：创建 `src/stores/settings.ts`**

```ts
import { defineStore } from 'pinia';
import type { DifficultyId } from '@/game/types';

const STORAGE_KEY = 'snake-game.settings';

interface SettingsState {
  difficulty: DifficultyId;
  // Stage 2/4 扩展：bgmVolume、sfxVolume、touchEnabled
}

function load(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SettingsState;
  } catch { /* ignore */ }
  return { difficulty: 'normal' };
}

function save(state: SettingsState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => load(),
  getters: {
    tickMs: (s) => {
      const map: Record<DifficultyId, number> = { casual: 1000 / 4, normal: 1000 / 6, hard: 1000 / 10 };
      return map[s.difficulty];
    },
  },
  actions: {
    setDifficulty(d: DifficultyId) { this.difficulty = d; save(this.$state); },
  },
});
```

- [ ] **步骤 13.2：创建 `src/stores/progress.ts`**

```ts
import { defineStore } from 'pinia';
import type { IslandId } from '@/game/types';

const STORAGE_KEY = 'snake-game.progress';

interface ProgressState {
  version: 1;
  /** 每岛最高分 */
  highScore: Partial<Record<IslandId, number>>;
  /** Stage 3 扩展：cumulativeScore, unlockedIslands, dex, achievements, dailyHistory 等 */
}

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ProgressState;
      if (parsed.version === 1) return parsed;
    }
  } catch { /* ignore */ }
  return { version: 1, highScore: {} };
}

function save(state: ProgressState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const useProgressStore = defineStore('progress', {
  state: (): ProgressState => load(),
  actions: {
    /** 更新某岛最高分（仅在超过历史时更新）。返回是否破纪录。 */
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
  },
});
```

- [ ] **步骤 13.3：Commit**

```bash
git add src/stores/settings.ts src/stores/progress.ts
git commit -m "feat(store): 添加 settings 和 progress Pinia stores（Stage 1 最小版）"
```

---
## 任务 14：Renderer v1（纯色矩形版，验证 5 层架构）

**文件：**

- 创建：`src/game/render/Renderer.ts`、`src/game/render/theme.ts`
- 创建：`src/game/render/layers/GrassLayer.ts`
- 创建：`src/game/render/layers/FoodLayer.ts`
- 创建：`src/game/render/layers/SnakeLayer.ts`
- 创建：`src/game/render/layers/EffectsLayer.ts`
- 创建：`src/game/render/layers/ObstacleLayer.ts`

**职责：** 5 层 Canvas 编排。Stage 1 全部用纯色矩形/圆形（不依赖 sprites）。验证分层架构可行即可，Stage 2 再替换为动森视觉。

- [ ] **步骤 14.1：创建 `src/game/render/theme.ts`**

```ts
import type { ThemeTokens } from '@/game/types';

/** 把主题 token 应用到 CanvasRenderingContext2D，返回清理函数（可选）。 */
export function applyTheme(ctx: CanvasRenderingContext2D, theme: ThemeTokens): void {
  // Stage 1 简单实现：主题通过层各自使用，这里先留空。
  void ctx; void theme;
}
```

- [ ] **步骤 14.2：创建 `src/game/render/layers/GrassLayer.ts`**

```ts
import type { ThemeTokens } from '@/game/types';

export function drawGrassLayer(
  ctx: CanvasRenderingContext2D,
  cellW: number,
  cellH: number,
  boardSize: number,
  theme: ThemeTokens,
): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (let x = 0; x < boardSize; x++) {
    for (let y = 0; y < boardSize; y++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? theme.grassA : theme.grassB;
      ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
    }
  }
  // 网格线
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= boardSize; x++) {
    ctx.beginPath();
    ctx.moveTo(x * cellW, 0);
    ctx.lineTo(x * cellW, boardSize * cellH);
    ctx.stroke();
  }
  for (let y = 0; y <= boardSize; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellH);
    ctx.lineTo(boardSize * cellW, y * cellH);
    ctx.stroke();
  }
}
```

- [ ] **步骤 14.3：创建 `src/game/render/layers/SnakeLayer.ts`**

```ts
import type { Cell, SnakeState } from '@/game/types';

export function drawSnakeLayer(
  ctx: CanvasRenderingContext2D,
  snake: SnakeState,
  cellW: number,
  cellH: number,
  alpha: number,
  colorHead: string,
  colorBody: string,
): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const pad = 2;
  for (let i = 0; i < snake.body.length; i++) {
    const seg = snake.body[i]!;
    // Stage 1 不插值：直接用格子位置
    ctx.fillStyle = i === 0 ? colorHead : colorBody;
    // 圆角矩形（简单 pill）
    const x = seg.x * cellW + pad;
    const y = seg.y * cellH + pad;
    const w = cellW - pad * 2;
    const h = cellH - pad * 2;
    const r = Math.min(w, h) / 2;
    roundRect(ctx, x, y, w, h, r);
    ctx.fill();
  }

  // 蛇头眼睛
  if (snake.body.length > 0) {
    const head = snake.body[0]!;
    const cx = head.x * cellW + cellW / 2;
    const cy = head.y * cellH + cellH / 2;
    ctx.fillStyle = '#fff';
    // 简单两点白圆
    ctx.beginPath();
    ctx.arc(cx - 4, cy - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 4, cy - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    // 瞳孔
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(cx - 3, cy - 3, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 5, cy - 3, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  void alpha;
}

function roundRect(
  ctx: CanvasRenderingContext2D, x: number, y: number,
  w: number, h: number, r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
```

- [ ] **步骤 14.4：创建 `src/game/render/layers/FoodLayer.ts`**

```ts
import type { Food } from '@/game/types';

export function drawFoodLayer(
  ctx: CanvasRenderingContext2D,
  foods: readonly Food[],
  cellW: number,
  cellH: number,
): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (const f of foods) {
    const cx = f.cell.x * cellW + cellW / 2;
    const cy = f.cell.y * cellH + cellH / 2;
    const r = Math.min(cellW, cellH) / 2 - 3;
    // 不同食物用不同颜色（Stage 1 纯色）
    ctx.fillStyle = foodColor(f.kind);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    // 高光
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.arc(cx - r * 0.2, cy - r * 0.2, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }
}

function foodColor(kind: string): string {
  const map: Record<string, string> = {
    apple: '#e63946', cherry: '#d90429', peach: '#ffb6c1',
    pear: '#bfd200', orange: '#f4a020', coconut: '#c8a878',
    watermelon: '#2a9d5c', persimmon: '#f4a020', chestnut: '#8b5a2b',
    meteor: '#5b3aa5', golden: '#ffd700',
  };
  if (kind.startsWith('fossil')) return '#d4c4a8';
  return map[kind] || '#f4a020';
}
```

- [ ] **步骤 14.5：创建 `src/game/render/layers/EffectsLayer.ts`**

```ts
// Stage 1：空壳，Stage 2 实现粒子/震屏特效
export function drawEffectsLayer(
  ctx: CanvasRenderingContext2D,
): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}
```

- [ ] **步骤 14.6：创建 `src/game/render/layers/ObstacleLayer.ts`**

```ts
import type { Cell } from '@/game/types';

// Stage 1：空壳，Stage 3 实现障碍绘制
export function drawObstacleLayer(
  ctx: CanvasRenderingContext2D,
  _obstacles: readonly Cell[],
  _cellW: number,
  _cellH: number,
): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}
```

- [ ] **步骤 14.7：创建 `src/game/render/Renderer.ts`**

```ts
import type { GameState, ThemeTokens } from '@/game/types';
import { BOARD_SIZE } from '@/game/types';
import { drawGrassLayer } from '@/game/render/layers/GrassLayer';
import { drawFoodLayer } from '@/game/render/layers/FoodLayer';
import { drawSnakeLayer } from '@/game/render/layers/SnakeLayer';
import { drawEffectsLayer } from '@/game/render/layers/EffectsLayer';
import { drawObstacleLayer } from '@/game/render/layers/ObstacleLayer';

export class Renderer {
  private canvases: Record<string, HTMLCanvasElement> = {};
  private contexts: Record<string, CanvasRenderingContext2D> = {};
  private cellW = 0;
  private cellH = 0;
  private boardSize: number;
  private theme: ThemeTokens;

  constructor(container: HTMLElement, boardSize: number, theme: ThemeTokens) {
    this.boardSize = boardSize;
    this.theme = theme;
    this.resize(container.clientWidth, container.clientHeight);
    for (const name of ['grass', 'food', 'obstacle', 'snake', 'effects'] as const) {
      const canvas = document.createElement('canvas');
      canvas.style.position = 'absolute';
      canvas.style.inset = '0';
      canvas.width = this.cellW * boardSize;
      canvas.height = this.cellH * boardSize;
      container.appendChild(canvas);
      this.canvases[name] = canvas;
      this.contexts[name] = canvas.getContext('2d')!;
    }
    // 草地层只在初始化时绘制一次
    this.drawGrass();
  }

  resize(containerW: number, _containerH: number): void {
    const size = Math.min(containerW, this.boardSize * 64);
    this.cellW = size / this.boardSize;
    this.cellH = this.cellW;
  }

  /** 每帧调用 */
  draw(state: GameState, alpha: number): void {
    drawFoodLayer(this.ctx('food'), state.foods, this.cellW, this.cellH);
    drawObstacleLayer(this.ctx('obstacle'), state.obstacles, this.cellW, this.cellH);
    drawSnakeLayer(
      this.ctx('snake'), state.snake, this.cellW, this.cellH, alpha,
      this.theme.snakeHead, this.theme.snakeBodyEnd,
    );
    drawEffectsLayer(this.ctx('effects'));
  }

  private drawGrass(): void {
    drawGrassLayer(this.ctx('grass'), this.cellW, this.cellH, this.boardSize, this.theme);
  }

  private ctx(name: string): CanvasRenderingContext2D {
    return this.contexts[name]!;
  }

  destroy(): void {
    for (const c of Object.values(this.canvases)) c.remove();
    this.canvases = {};
    this.contexts = {};
  }
}
```

- [ ] **步骤 14.8：运行 typecheck 确认无引入错误**

```bash
pnpm typecheck
```

预期：无错误

- [ ] **步骤 14.9：Commit**

```bash
git add src/game/render/
git commit -m "feat(render): 实现 Renderer v1（5 层 Canvas 纯色矩形版）"
```

---
## 任务 15：GameCanvas.vue（Vue 装载器）

**文件：**

- 创建：`src/components/GameCanvas.vue`（替换现有 GameView 占位中的逻辑）

**职责：** 生命周期的核心组件——接收 props（islandId、modeId、difficulty），创建 GameSession + Renderer，挂载 InputController，暴露 pause/resume/reset。

- [ ] **步骤 15.1：创建 `src/components/GameCanvas.vue`**

```vue
<template>
  <div ref="containerRef" class="game-canvas"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import type { IslandId, ModeId, DifficultyId, Dir } from '@/game/types';
import { BOARD_SIZE } from '@/game/types';
import { GameSession } from '@/game/GameSession';
import { createFreeMode } from '@/game/modes/FreeMode';
import { createDailyMode } from '@/game/modes/DailyMode';
import { getIsland } from '@/game/levels/islands';
import { InputController } from '@/game/core/InputController';
import { Renderer } from '@/game/render/Renderer';

const props = withDefaults(defineProps<{
  island: IslandId;
  mode: ModeId;
  difficulty: DifficultyId;
}>(), {
  island: 'spring',
  mode: 'free',
  difficulty: 'normal',
});

const emit = defineEmits<{
  scoreChange: [score: number];
  die: [payload: { score: number; length: number; island: IslandId; mode: ModeId }];
  eat: [payload: { foodKind: string; snakeLength: number }];
}>();

const containerRef = ref<HTMLElement | null>(null);

let session: GameSession | null = null;
let renderer: Renderer | null = null;
let inputCtrl: InputController | null = null;

function initGame(): void {
  const container = containerRef.value;
  if (!container) return; // 初始挂载时 container 已有，reset 时不动 DOM 重新创建

  const island = getIsland(props.island);
  const mode = props.mode === 'free'
    ? createFreeMode()
    : createDailyMode();

  session = new GameSession({
    island,
    mode,
    difficulty: props.difficulty,
    boardSize: BOARD_SIZE,
    maxFoodsOnBoard: 1,
  });

  if (!renderer) {
    renderer = new Renderer(container, BOARD_SIZE, island.theme);
  }

  session.onRender((_alpha, state) => {
    renderer?.draw(state, 0);
  });

  session.bus.on('eat', (p) => emit('eat', { foodKind: p.food.kind, snakeLength: p.snakeLength }));
  session.bus.on('die', (p) => emit('die', p));

  inputCtrl = new InputController({
    target: document,
    onDirection: (dir: Dir) => session?.queueDirection(dir),
    onPauseToggle: () => {
      if (!session) return;
      session.isPaused() ? session.resume() : session.pause();
    },
    onPauseRequest: () => session?.pause(),
    onReset: () => reset(),
  });
  inputCtrl.attach();

  session.start();
}

onMounted(() => { initGame(); });

function reset(): void {
  session?.destroy();
  inputCtrl?.detach();
  initGame();
}

function pause(): void { session?.pause(); }
function resume(): void { session?.resume(); }

watch(() => session?.state.score, (v) => { if (v !== undefined) emit('scoreChange', v); });

onBeforeUnmount(() => {
  session?.destroy();
  renderer?.destroy();
  inputCtrl?.detach();
});

defineExpose({ reset, pause, resume });
</script>

<style lang="less" scoped>
.game-canvas {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  max-width: 640px;
  margin: 0 auto;
}
</style>
```

- [ ] **步骤 15.2：Commit**

```bash
git add src/components/GameCanvas.vue
git commit -m "feat(ui): 实现 GameCanvas（Vue 装载器，关联 GameSession + Renderer + Input）"
```

---
## 任务 16：GameHUD + GameOverModal

**文件：**

- 创建：`src/components/GameHUD.vue`
- 创建：`src/components/GameOverModal.vue`

- [ ] **步骤 16.1：创建 `src/components/GameHUD.vue`**

```vue
<template>
  <div class="hud">
    <div class="hud-item">
      <span class="hud-label">分数</span>
      <span class="hud-value">{{ score }}</span>
    </div>
    <div class="hud-item">
      <span class="hud-label">长度</span>
      <span class="hud-value">{{ length }}</span>
    </div>
    <div class="hud-item">
      <span class="hud-label">岛屿</span>
      <span class="hud-value">{{ islandName }}</span>
    </div>
    <button class="hud-pause" @click="$emit('pause')">暂停</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  score: number;
  length: number;
  islandName: string;
}>();
defineEmits<{ pause: [] }>();
</script>

<style lang="less" scoped>
@import '@/styles/tokens.less';

.hud {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 12px 24px;
  background: @bg-color-content;
  border-bottom: 2px solid @border-color-light;
  flex-wrap: wrap;
}
.hud-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.hud-label {
  font-size: 11px;
  color: @text-color-secondary;
}
.hud-value {
  font-size: 20px;
  font-weight: 700;
  color: @text-color;
}
.hud-pause {
  padding: 6px 20px;
  border: 2px solid @text-color;
  border-radius: 999px;
  background: @bg-color;
  color: @text-color;
  font-size: 14px;
  cursor: pointer;
  &:hover { background: @primary-color; color: #fff; border-color: @primary-color; }
}
</style>
```

- [ ] **步骤 16.2：创建 `src/components/GameOverModal.vue`**

```vue
<template>
  <div v-if="visible" class="overlay">
    <div class="modal">
      <h2>游戏结束</h2>
      <div class="stats">
        <p><strong>{{ score }}</strong> 分</p>
        <p>长度 {{ length }} 节</p>
        <p v-if="isNewHighScore" class="new-record">新纪录!</p>
      </div>
      <div class="actions">
        <button @click="$emit('retry')">再来一局</button>
        <button class="secondary" @click="$emit('home')">返回主菜单</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
  score: number;
  length: number;
  isNewHighScore: boolean;
}>();
defineEmits<{ retry: []; home: [] }>();
</script>

<style lang="less" scoped>
@import '@/styles/tokens.less';

.overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  z-index: 100;
}
.modal {
  background: @bg-color-content;
  border: 3px solid @text-color;
  border-radius: 24px;
  padding: 40px 48px;
  text-align: center;
  min-width: 280px;
}
h2 { color: @text-color; margin: 0 0 24px; }
.stats p { font-size: 16px; color: @text-color-body; margin: 8px 0; }
.new-record { color: @success-color; font-weight: 700; }
.actions { display: flex; gap: 12px; margin-top: 24px; justify-content: center; }
button {
  padding: 10px 28px;
  border: none;
  border-radius: 999px;
  background: @primary-color;
  color: #fff;
  font-size: 15px;
  cursor: pointer;
  &.secondary { background: @bg-color-secondary; color: @text-color; border: 2px solid @border-color-light; }
}
</style>
```

- [ ] **步骤 16.3：Commit**

```bash
git add src/components/GameHUD.vue src/components/GameOverModal.vue
git commit -m "feat(ui): 实现 GameHUD 和 GameOverModal"
```

---
## 任务 17：重写 HomeView + GameView（接入 GameCanvas）

**文件：**

- 修改：`src/views/HomeView.vue`（替换占位）
- 修改：`src/views/GameView.vue`（替换占位，接入 GameCanvas + HUD + Modal）

- [ ] **步骤 17.1：重写 `src/views/HomeView.vue`**

```vue
<template>
  <main class="home">
    <div class="title-area">
      <h1 class="title">动森贪吃蛇</h1>
      <p class="subtitle">在无人岛上收集水果吧</p>
    </div>
    <div class="menu-buttons">
      <button class="btn-primary" @click="startFree">自由散步</button>
      <button class="btn-primary" @click="startDaily">今日挑战</button>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function startFree() {
  router.push({ name: 'game', params: { island: 'spring' }, query: { mode: 'free' } });
}

function startDaily() {
  router.push({ name: 'game', params: { island: 'spring' }, query: { mode: 'daily' } });
}
</script>

<style lang="less" scoped>
@import '@/styles/tokens.less';

.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px 20px;
  gap: 48px;
  background: @bg-color;
}
.title-area { text-align: center; }
.title { font-size: 48px; color: @text-color; margin: 0; }
.subtitle { font-size: 16px; color: @text-color-secondary; margin: 8px 0 0; }
.menu-buttons { display: flex; flex-direction: column; gap: 16px; width: 240px; }
.btn-primary {
  padding: 14px 32px;
  border: none;
  border-radius: 999px;
  background: @primary-color;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  transition: background 0.2s;
  &:hover { background: #3dd4c6; }
  &:active { background: #11a89b; }
}
</style>
```

- [ ] **步骤 17.2：重写 `src/views/GameView.vue`**

```vue
<template>
  <main class="game-view">
    <GameHUD
      :score="score"
      :length="snakeLength"
      :island-name="islandName"
      @pause="togglePause"
    />
    <div class="canvas-area">
      <GameCanvas
        ref="canvasRef"
        :island="island"
        :mode="mode"
        :difficulty="difficulty"
        @die="onDie"
        @eat="onEat"
        @score-change="(v) => score = v"
      />
    </div>
    <GameOverModal
      :visible="gameOverVisible"
      :score="finalScore"
      :length="finalLength"
      :is-new-high-score="isNewHigh"
      @retry="retry"
      @home="goHome"
    />
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import GameCanvas from '@/components/GameCanvas.vue';
import GameHUD from '@/components/GameHUD.vue';
import GameOverModal from '@/components/GameOverModal.vue';
import { useSettingsStore } from '@/stores/settings';
import { useProgressStore } from '@/stores/progress';
import type { IslandId, ModeId } from '@/game/types';
import { ISLANDS } from '@/game/levels/islands';

const route = useRoute();
const router = useRouter();
const settings = useSettingsStore();
const progress = useProgressStore();

const canvasRef = ref<InstanceType<typeof GameCanvas> | null>(null);

const island = (route.params.island ?? 'spring') as IslandId;
const mode = (route.query.mode ?? 'free') as ModeId;
const difficulty = computed(() => settings.difficulty);

const score = ref(0);
const snakeLength = ref(3);
const gameOverVisible = ref(false);
const finalScore = ref(0);
const finalLength = ref(0);
const isNewHigh = ref(false);

const islandName = computed(() => ISLANDS[island]?.name ?? '未知岛');

function onDie(payload: { score: number; length: number; island: IslandId; mode: ModeId }) {
  finalScore.value = payload.score;
  finalLength.value = payload.length;
  isNewHigh.value = progress.updateHighScore(payload.island, payload.score);
  gameOverVisible.value = true;
}

function onEat(_payload: { foodKind: string; snakeLength: number }) {
  snakeLength.value = _payload.snakeLength;
}

function togglePause() {
  canvasRef.value?.pause();
}

function retry() {
  gameOverVisible.value = false;
  canvasRef.value?.reset();
}

function goHome() {
  router.push({ name: 'home' });
}
</script>

<style lang="less" scoped>
@import '@/styles/tokens.less';

.game-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: @bg-color;
}
.canvas-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
</style>
```

- [ ] **步骤 17.3：运行 typecheck + lint 验证全项目**

```bash
pnpm typecheck && pnpm lint
```

预期：无错误。如有 ESLint warnings，修复后重试。

- [ ] **步骤 17.4：Commit**

```bash
git add src/views/HomeView.vue src/views/GameView.vue
git commit -m "feat(ui): 实现 HomeView 菜单 + GameView 接入完整游戏流程"
```

---

## 任务 18：端到端验收

**无需修改文件**，纯验证步骤。

- [ ] **步骤 18.1：启动开发服务器**

```bash
pnpm dev
```

- [ ] **步骤 18.2：验证游戏可玩流程**

1. 打开 `http://localhost:5173/` → 看到「动森贪吃蛇」标题 + 两个按钮
2. 点击「自由散步」→ 进入游戏画面，看到：
   - 顶部 HUD（分数 0、长度 3、岛屿「春樱岛」、暂停按钮）
   - 22×22 方格草地（绿色双色棋盘）
   - 3 节棕色蛇身在中间朝右
   - 1 颗红色苹果在场上
3. 按 W/S/A/D 或方向键 → 蛇能正常移动
4. 蛇头碰到苹果 → 蛇变长 1 节、分数 +1、新苹果生成
5. 蛇撞墙 → 弹出「游戏结束」Modal，显示分数+长度
6. 点击「再来一局」→ 游戏重新开始
7. 点击「返回主菜单」→ 回到 HomeView
8. 在主菜单点「今日挑战」→ 进入游戏，HUD 应该显示 mode 为 daily

- [ ] **步骤 18.3：验证暂停**

1. 游戏中按 Space 或 P → 蛇停止移动
2. 再按 Space → 蛇恢复移动

- [ ] **步骤 18.4：运行全部单测**

```bash
pnpm test
```

预期：所有 test 文件全部 PASS（Snake / Board / Food / Rng / EventBus / GameLoop / InputController / FreeMode / DailyMode / GameSession）。

- [ ] **步骤 18.5：Commit**

```bash
git add -A
git commit -m "chore: 阶段 1 完成 - 核心引擎可玩版本验收通过"
```

---

## 阶段 1 完成标准

- [x] 键盘 WASD/方向键操控蛇
- [x] 蛇吃苹果变长、分数增加
- [x] 撞墙/撞身死亡
- [x] GameOverModal 显示结算，可重开或返回菜单
- [x] 暂停/恢复（Space/P）
- [x] 自由模式 + 每日挑战两种入口
- [x] 所有核心单测通过
- [x] typecheck + lint 无错误
- [x] 视觉用纯色矩形（Stage 2 替换为动森风格）

---

## 附录：pnpm 安装补充说明

如果 `animal-island-vue` 不在 npm registry，在 `package.json` 中改为本地路径：

```json
"animal-island-vue": "link:../animal-island-vue"
```

或先 `pnpm install` 试一下，如果报 404，再确认组件库来源。
