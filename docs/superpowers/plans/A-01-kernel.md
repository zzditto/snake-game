# 阶段 1-A · 项目脚手架 + 游戏内核模块 实现计划

> **面向 AI 代理的工作者：** 使用 superpowers:subagent-driven-development 或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法跟踪进度。

**目标：** 完成项目脚手架配置 + 纯 TS 游戏内核全部模块及完整单测——包括 Snake、Board、Food、EventBus、GameLoop、InputController。

**架构：** Vue 3 + TS + Pinia + Router 骨架；`src/game/core/` 为纯 TS 内核，完全脱离 Vue，每个模块独立单测。

**技术栈：** Vue 3.4+ / TypeScript 5+ / Vite 5+ / Pinia / Vue Router 4 / Vitest / ESLint + Prettier / pnpm

**关联规格：** `docs/superpowers/specs/2026-06-18-snake-game-design.md`

**依赖：** 无。这是整个阶段 1 的第一个计划。

**验收标准：** `pnpm test` 全部单测通过 / `pnpm typecheck` 无错误 / `pnpm lint` 无错误

---

## 文件结构

### 创建的文件

**根配置：**

- `package.json` — pnpm 依赖与脚本（dev/build/test/lint/typecheck）
- `pnpm-workspace.yaml` — 留空（单包），便于后续扩展
- `tsconfig.json` — 严格模式 + path alias `@/*`
- `tsconfig.node.json` — Vite/Vitest 的 node 侧配置
- `vite.config.ts` — Vite + Vue 插件 + alias + Vitest 配置
- `.eslintrc.cjs` — Vue 3 + TS 规则
- `.prettierrc` — 统一代码风格
- `.gitignore` — node_modules / dist / .DS_Store / .superpowers 等
- `.editorconfig` — 跨编辑器统一缩进
- `index.html` — 单页入口

**Vue 入口与路由：**

- `src/main.ts` — Vue/Pinia/Router 装配
- `src/App.vue` — RouterView 容器
- `src/router/index.ts` — Home / Game 两条路由（Stage 1 简化版）
- `src/styles/tokens.less` — 复用 animal-island-vue 的设计 token

**Pinia stores（Stage 1 用到的）：**

- `src/stores/settings.ts` — 难度（影响 tick 速度）
- `src/stores/progress.ts` — 仅最高分（Stage 3 再扩展）

**game/core/（纯 TS 内核）：**

- `src/game/types.ts` — 全部公共类型（Cell/Dir/IslandId/FoodKind/SnakeState/Food/GameMode/GameState 等）
- `src/game/core/Rng.ts` — mulberry32 种子化随机
- `src/game/core/EventBus.ts` — 简单 emit/on/off 事件总线
- `src/game/core/Snake.ts` — 蛇身状态机（move/turn/grow/collide）
- `src/game/core/Board.ts` — 棋盘+食物管理（spawn/findEmptyCell）
- `src/game/core/Food.ts` — 食物工厂（按权重生成）
- `src/game/core/InputController.ts` — 键盘事件转 Dir 指令
- `src/game/core/GameLoop.ts` — 固定步长 + RAF 渲染回调
- `src/game/modes/FreeMode.ts` — 自由模式规则
- `src/game/modes/DailyMode.ts` — 每日挑战（Stage 1 仅占位实现：种子化棋盘 + 无障碍）
- `src/game/GameSession.ts` — 组装层：把 Snake/Board/Loop/Mode 串起来，对外暴露 start/pause/resume/destroy
- `src/game/levels/islands.ts` — 5 岛配置（Stage 1 仅春樱完整，其余占位）

**game/render/（Stage 1 v1 版）：**

- `src/game/render/Renderer.ts` — 5 层 Canvas 编排（v1 全部用纯色矩形）
- `src/game/render/theme.ts` — 主题 token 应用
- `src/game/render/layers/GrassLayer.ts` — 双色棋盘背景
- `src/game/render/layers/FoodLayer.ts` — 红色圆形苹果
- `src/game/render/layers/SnakeLayer.ts` — 棕色 pill 矩形
- `src/game/render/layers/EffectsLayer.ts` — 空壳（接口定义，Stage 2 实现）
- `src/game/render/layers/ObstacleLayer.ts` — 空壳（DailyMode 占位用）

**Vue 组件：**

- `src/components/GameCanvas.vue` — Canvas 容器 + 生命周期（创建 GameSession + 注册输入 + 启动循环）
- `src/components/GameHUD.vue` — 顶部分数 + 长度 + 暂停按钮
- `src/components/GameOverModal.vue` — 死亡结算（基于 animal-island-vue Modal）
- `src/components/PauseModal.vue` — 暂停（同上）

**Views：**

- `src/views/HomeView.vue` — Stage 1 极简：飘带标题 + 开始按钮
- `src/views/GameView.vue` — GameCanvas + GameHUD + 两个 Modal

**测试（tests/game/）：**

- `tests/game/Rng.test.ts`
- `tests/game/Snake.test.ts`
- `tests/game/Board.test.ts`
- `tests/game/Food.test.ts`
- `tests/game/FreeMode.test.ts`
- `tests/game/DailyMode.test.ts`

### 文件职责约束

- `src/game/**` 禁止 import 任何 `vue` / `pinia` / `vue-router` 模块（用 ESLint no-restricted-imports 强制）
- 所有 Pinia store 是 localStorage 的唯一读写出入口
- 单个 Vue 组件文件 ≤ 300 行，单个 TS 文件 ≤ 250 行（超出需评估拆分）

---
## 任务 1：项目脚手架

**文件：**

- 创建：`package.json`、`pnpm-workspace.yaml`、`tsconfig.json`、`tsconfig.node.json`、`vite.config.ts`、`.eslintrc.cjs`、`.prettierrc`、`.editorconfig`、`index.html`、`src/main.ts`、`src/App.vue`、`src/router/index.ts`、`src/styles/tokens.less`、`src/views/HomeView.vue`、`src/views/GameView.vue`
- 修改：`.gitignore`（追加构建产物）

- [ ] **步骤 1.1：创建 `package.json`**

```json
{
  "name": "snake-game",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint --ext .ts,.vue src tests",
    "typecheck": "vue-tsc --noEmit"
  },
  "dependencies": {
    "animal-island-vue": "^1.0.0",
    "pinia": "^2.1.7",
    "vue": "^3.4.0",
    "vue-router": "^4.2.5"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "@typescript-eslint/parser": "^6.13.0",
    "@vitejs/plugin-vue": "^5.0.0",
    "@vue/test-utils": "^2.4.3",
    "eslint": "^8.55.0",
    "eslint-plugin-vue": "^9.19.0",
    "happy-dom": "^12.10.3",
    "less": "^4.2.0",
    "prettier": "^3.1.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.1.0",
    "vue-tsc": "^1.8.25"
  }
}
```

- [ ] **步骤 1.2：创建 `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "jsx": "preserve",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client", "vitest/globals"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "useDefineForClassFields": true
  },
  "include": ["src/**/*", "tests/**/*", "vite.config.ts"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **步骤 1.3：创建 `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **步骤 1.4：创建 `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts'],
  },
});
```

- [ ] **步骤 1.5：创建 `.eslintrc.cjs`**

```js
module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended',
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-restricted-imports': ['error', {
      patterns: [{
        group: ['vue', 'pinia', 'vue-router', '@/stores/*', '@/components/*', '@/views/*'],
        message: 'src/game/** must not depend on Vue/Pinia/Router or app-layer modules.',
      }],
    }],
  },
  overrides: [
    {
      files: ['src/game/**/*.ts'],
      rules: {
        'no-restricted-imports': ['error', {
          patterns: [{
            group: ['vue', 'pinia', 'vue-router', '@/stores/*', '@/components/*', '@/views/*'],
            message: 'src/game/** must not depend on Vue/Pinia/Router.',
          }],
        }],
      },
    },
    {
      // 仅对 views / components / stores / tests 关闭；game/ 保持限制
      files: ['src/views/**/*.vue', 'src/views/**/*.ts', 'src/components/**/*.vue', 'src/components/**/*.ts', 'src/stores/**/*.ts', 'tests/**/*.ts'],
      rules: { 'no-restricted-imports': 'off' },
    },
  ],
};
```

- [ ] **步骤 1.6：创建 `.prettierrc`**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "vueIndentScriptAndStyle": true
}
```

- [ ] **步骤 1.7：创建 `.editorconfig`**

```ini
root = true
[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true
```

- [ ] **步骤 1.8：更新 `.gitignore`**

追加以下内容到现有 `.gitignore`：

```
node_modules/
dist/
.vite/
*.log
.DS_Store
coverage/
```

- [ ] **步骤 1.9：创建 `index.html`**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>动森贪吃蛇</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **步骤 1.10：创建 `src/styles/tokens.less`**

```less
// 复用 animal-island-vue 的色彩 token（见 .opencode/skills/animal-island-vue-style/SKILL.md）
@primary-color: #19c8b9;
@text-color: #794f27;
@text-color-body: #725d42;
@bg-color: #f8f8f0;
@bg-color-content: rgb(247, 243, 223);
@border-color-light: #c4b89e;
@success-color: #6fba2c;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: @bg-color;
  color: @text-color-body;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
#app { min-height: 100vh; }
```

- [ ] **步骤 1.11：创建 `src/main.ts`**

```ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import './styles/tokens.less';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');
```

- [ ] **步骤 1.12：创建 `src/App.vue`**

```vue
<template>
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>
```

- [ ] **步骤 1.13：创建 `src/router/index.ts`**

```ts
import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import GameView from '@/views/GameView.vue';

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/game/:island?', name: 'game', component: GameView, props: true },
  ],
});
```

- [ ] **步骤 1.14：创建占位 `src/views/HomeView.vue`**

```vue
<template>
  <main class="home">
    <h1>动森贪吃蛇</h1>
    <button @click="start">开始游戏</button>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();
const start = () => router.push({ name: 'game', params: { island: 'spring' } });
</script>

<style lang="less" scoped>
.home { display: flex; flex-direction: column; align-items: center; padding: 80px 20px; gap: 32px; }
h1 { font-size: 48px; color: #794f27; }
button { padding: 12px 48px; font-size: 18px; border-radius: 999px; border: 2px solid #794f27; background: #19c8b9; color: white; cursor: pointer; }
</style>
```

- [ ] **步骤 1.15：创建占位 `src/views/GameView.vue`**

```vue
<template>
  <main class="game"><p>Game placeholder - 任务 16 实现</p></main>
</template>
<script setup lang="ts"></script>
<style lang="less" scoped>.game { padding: 40px; }</style>
```

- [ ] **步骤 1.16：安装依赖并验证启动**

```bash
pnpm install
pnpm dev
```

预期：浏览器打开 `http://localhost:5173/` 显示「动森贪吃蛇」标题 + 「开始游戏」按钮，点击进入空 GameView。

- [ ] **步骤 1.17：运行 typecheck 和 lint**

```bash
pnpm typecheck && pnpm lint
```

预期：无错误。

- [ ] **步骤 1.18：Commit**

```bash
git add -A
git commit -m "chore: 初始化 Vite + Vue 3 + TS + Pinia + Router 脚手架"
```

---
## 任务 2：公共类型与 Rng

### 2.A：types.ts

**文件：**

- 创建：`src/game/types.ts`

- [ ] **步骤 2.A.1：创建 `src/game/types.ts`**

```ts
export interface Cell {
  x: number;
  y: number;
}

export type Dir = 'up' | 'down' | 'left' | 'right';

export type IslandId = 'spring' | 'summer' | 'autumn' | 'winter' | 'fossil';

export type DifficultyId = 'casual' | 'normal' | 'hard';

export type ModeId = 'free' | 'daily';

export type FoodKind =
  | 'apple' | 'cherry' | 'peach' | 'pear' | 'orange' | 'coconut' | 'watermelon'
  | 'persimmon' | 'chestnut'
  | 'fossil_trilobite' | 'fossil_dino' | 'fossil_ammonite'
  | 'fossil_shell' | 'fossil_amber'
  | 'meteor' | 'golden';

export interface SnakeState {
  body: Cell[];
  direction: Dir;
  pendingDirection: Dir;
  growthQueue: number;
  alive: boolean;
  invincibleUntil?: number;
}

export interface Food {
  cell: Cell;
  kind: FoodKind;
  spawnedAt: number;
  expiresAt?: number;
  score: number;
}

export interface ThemeTokens {
  grassA: string;
  grassB: string;
  grassNoise: string;
  vignette: string;
  snakeHead: string;
  snakeBodyStart: string;
  snakeBodyEnd: string;
  hatSprite: string;
  accent: string;
}

export interface DecorationDef {
  spriteKey: string;
  density: number;
  zone: 'border' | 'corner' | 'scattered';
}

export interface Island {
  id: IslandId;
  name: string;
  unlockScore: number;
  unlockSpecial?: 'all_fossils';
  theme: ThemeTokens;
  bgmKey: string;
  fruitWeights: Partial<Record<FoodKind, number>>;
  decorations: DecorationDef[];
  ambientParticles?: 'cherry_blossom' | 'maple_leaf' | 'snow' | 'sand';
}

export interface GameState {
  snake: SnakeState;
  foods: Food[];
  obstacles: Cell[];
  score: number;
  comboCount: number;
  tickCount: number;
  startedAt: number;
  island: IslandId;
  mode: ModeId;
}

export interface GameMode {
  id: ModeId;
  shouldSpawnObstacles: boolean;
  rngSeed?: number;
  obstacleDensity?: number;
  onTickHook?: (state: GameState) => void;
}

export const BOARD_SIZE = 22;

export const FOOD_SCORE: Record<FoodKind, number> = {
  apple: 1, cherry: 1, peach: 1, pear: 1, orange: 1,
  coconut: 1, watermelon: 1, persimmon: 1, chestnut: 1,
  meteor: 5, golden: 3,
  fossil_trilobite: 10, fossil_dino: 10, fossil_ammonite: 10,
  fossil_shell: 10, fossil_amber: 10,
};

export const FOSSIL_KINDS: FoodKind[] = [
  'fossil_trilobite', 'fossil_dino', 'fossil_ammonite',
  'fossil_shell', 'fossil_amber',
];

export const TICK_MS_BY_DIFFICULTY: Record<DifficultyId, number> = {
  casual: 1000 / 4,
  normal: 1000 / 6,
  hard: 1000 / 10,
};

export const SPEED_UP_EVERY = 5;
export const SPEED_UP_FACTOR = 0.95;
export const SPEED_CAP_TICK_MS = 1000 / 12;

export const METEOR_LIFETIME_MS = 10_000;
export const GOLDEN_INVINCIBLE_MS = 3_000;
```

- [ ] **步骤 2.A.2：Commit**

```bash
git add src/game/types.ts
git commit -m "feat(game): 添加公共类型定义与游戏常量"
```

---

### 2.B：Rng（mulberry32 种子化随机）

**文件：**

- 创建：`src/game/core/Rng.ts`
- 测试：`tests/game/Rng.test.ts`

- [ ] **步骤 2.B.1：编写失败的测试 `tests/game/Rng.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { Rng } from '@/game/core/Rng';

describe('Rng', () => {
  it('相同种子产生相同序列', () => {
    const a = new Rng(12345);
    const b = new Rng(12345);
    const seqA = Array.from({ length: 10 }, () => a.next());
    const seqB = Array.from({ length: 10 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it('不同种子产生不同序列', () => {
    const a = new Rng(1);
    const b = new Rng(2);
    const seqA = Array.from({ length: 10 }, () => a.next());
    const seqB = Array.from({ length: 10 }, () => b.next());
    expect(seqA).not.toEqual(seqB);
  });

  it('next() 返回 [0, 1) 范围', () => {
    const r = new Rng(42);
    for (let i = 0; i < 1000; i++) {
      const v = r.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('intRange(min, max) 返回 [min, max) 整数', () => {
    const r = new Rng(7);
    for (let i = 0; i < 1000; i++) {
      const v = r.intRange(5, 10);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThan(10);
    }
  });

  it('pickWeighted 按权重选取', () => {
    const r = new Rng(1);
    const counts = { a: 0, b: 0, c: 0 };
    const items = { a: 1, b: 8, c: 1 };
    for (let i = 0; i < 10_000; i++) {
      const k = r.pickWeighted(items);
      counts[k]++;
    }
    // b 的权重是 a/c 的 8 倍，期望 b 占比约 80%
    expect(counts.b).toBeGreaterThan(7000);
    expect(counts.b).toBeLessThan(8500);
  });
});
```

- [ ] **步骤 2.B.2：运行测试验证失败**

```bash
pnpm test -- tests/game/Rng.test.ts
```

预期：FAIL，报错 `Cannot find module '@/game/core/Rng'`

- [ ] **步骤 2.B.3：实现 `src/game/core/Rng.ts`**

```ts
export class Rng {
  private state: number;

  constructor(seed: number) {
    // mulberry32 要求非零 32-bit 种子
    this.state = (seed >>> 0) || 1;
  }

  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  intRange(minInclusive: number, maxExclusive: number): number {
    return Math.floor(this.next() * (maxExclusive - minInclusive)) + minInclusive;
  }

  pick<T>(arr: readonly T[]): T {
    if (arr.length === 0) throw new Error('Rng.pick: empty array');
    return arr[this.intRange(0, arr.length)] as T;
  }

  pickWeighted<K extends string>(weights: Partial<Record<K, number>>): K {
    const entries = Object.entries(weights) as [K, number][];
    const total = entries.reduce((acc, [, w]) => acc + (w ?? 0), 0);
    if (total <= 0) throw new Error('Rng.pickWeighted: total weight must be positive');
    let r = this.next() * total;
    for (const [key, w] of entries) {
      r -= w ?? 0;
      if (r <= 0) return key;
    }
    return entries[entries.length - 1]![0];
  }
}

/** 由 'YYYY-MM-DD' 派生 32-bit 种子，用于每日挑战。 */
export function dailySeed(dateStr: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < dateStr.length; i++) {
    h ^= dateStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
```

- [ ] **步骤 2.B.4：运行测试验证通过**

```bash
pnpm test -- tests/game/Rng.test.ts
```

预期：5 个测试全部 PASS

- [ ] **步骤 2.B.5：Commit**

```bash
git add src/game/core/Rng.ts tests/game/Rng.test.ts
git commit -m "feat(game): 实现 Rng（mulberry32 种子化随机）+ 单测"
```

---
## 任务 3：Snake（蛇身状态机）

**文件：**

- 创建：`src/game/core/Snake.ts`
- 测试：`tests/game/Snake.test.ts`

**职责：** 维护蛇身位置数组、当前方向、待生效方向、生长队列；提供 turn / step / collidesSelf / die 等纯函数式操作。**不感知棋盘大小**（边界由 Board 判定）。

- [ ] **步骤 3.1：编写失败的测试 `tests/game/Snake.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import {
  createSnake,
  queueDirection,
  stepSnake,
  collidesSelf,
  nextHead,
} from '@/game/core/Snake';

describe('Snake', () => {
  it('createSnake 默认 3 节朝右，head 在指定位置', () => {
    const s = createSnake({ x: 10, y: 10 }, 'right');
    expect(s.body).toEqual([
      { x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 },
    ]);
    expect(s.direction).toBe('right');
    expect(s.pendingDirection).toBe('right');
    expect(s.alive).toBe(true);
    expect(s.growthQueue).toBe(0);
  });

  it('stepSnake 朝当前方向前进一格', () => {
    const s = createSnake({ x: 5, y: 5 }, 'right');
    stepSnake(s);
    expect(s.body[0]).toEqual({ x: 6, y: 5 });
    expect(s.body.length).toBe(3);
  });

  it('queueDirection + step 应用新方向', () => {
    const s = createSnake({ x: 5, y: 5 }, 'right');
    queueDirection(s, 'up');
    stepSnake(s);
    expect(s.direction).toBe('up');
    expect(s.body[0]).toEqual({ x: 5, y: 4 });
  });

  it('queueDirection 忽略反向键', () => {
    const s = createSnake({ x: 5, y: 5 }, 'right');
    queueDirection(s, 'left');
    expect(s.pendingDirection).toBe('right');
  });

  it('一帧内连续按 ↑ 然后 ← 仅执行 ↑ 方向变更', () => {
    const s = createSnake({ x: 5, y: 5 }, 'right');
    queueDirection(s, 'up');
    queueDirection(s, 'left');
    stepSnake(s);
    expect(s.direction).toBe('up');
    expect(s.body[0]).toEqual({ x: 5, y: 4 });
  });

  it('growthQueue > 0 时尾巴不删，长度增加', () => {
    const s = createSnake({ x: 5, y: 5 }, 'right');
    s.growthQueue = 2;
    const initialLen = s.body.length;
    stepSnake(s);
    expect(s.body.length).toBe(initialLen + 1);
    expect(s.growthQueue).toBe(1);
    stepSnake(s);
    expect(s.body.length).toBe(initialLen + 2);
    expect(s.growthQueue).toBe(0);
    stepSnake(s);
    expect(s.body.length).toBe(initialLen + 2);
  });

  it('collidesSelf 检测蛇头撞身', () => {
    const s = createSnake({ x: 3, y: 3 }, 'right');
    s.body = [
      { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 4 },
      { x: 4, y: 3 }, { x: 3, y: 3 },
    ];
    expect(collidesSelf(s)).toBe(true);
  });

  it('未撞身时 collidesSelf 返回 false', () => {
    const s = createSnake({ x: 5, y: 5 }, 'right');
    expect(collidesSelf(s)).toBe(false);
  });

  it('nextHead 不修改状态', () => {
    const s = createSnake({ x: 5, y: 5 }, 'right');
    const before = JSON.stringify(s);
    const next = nextHead(s);
    expect(next).toEqual({ x: 6, y: 5 });
    expect(JSON.stringify(s)).toBe(before);
  });
});
```

- [ ] **步骤 3.2：运行测试验证失败**

```bash
pnpm test -- tests/game/Snake.test.ts
```

预期：FAIL，模块不存在。

- [ ] **步骤 3.3：实现 `src/game/core/Snake.ts`**

```ts
import type { Cell, Dir, SnakeState } from '@/game/types';

const DIR_VECTOR: Record<Dir, Cell> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE: Record<Dir, Dir> = {
  up: 'down', down: 'up', left: 'right', right: 'left',
};

export function isOpposite(a: Dir, b: Dir): boolean {
  return OPPOSITE[a] === b;
}

export function createSnake(head: Cell, direction: Dir, length = 3): SnakeState {
  const body: Cell[] = [];
  const back = OPPOSITE[direction];
  const v = DIR_VECTOR[back];
  for (let i = 0; i < length; i++) {
    body.push({ x: head.x + v.x * i, y: head.y + v.y * i });
  }
  return {
    body,
    direction,
    pendingDirection: direction,
    growthQueue: 0,
    alive: true,
  };
}

export function queueDirection(snake: SnakeState, dir: Dir): void {
  if (isOpposite(dir, snake.direction)) return;
  snake.pendingDirection = dir;
}

function applyPendingDirection(snake: SnakeState): void {
  if (!isOpposite(snake.pendingDirection, snake.direction)) {
    snake.direction = snake.pendingDirection;
  }
}

export function nextHead(snake: SnakeState): Cell {
  const dir = isOpposite(snake.pendingDirection, snake.direction)
    ? snake.direction
    : snake.pendingDirection;
  const v = DIR_VECTOR[dir];
  const head = snake.body[0]!;
  return { x: head.x + v.x, y: head.y + v.y };
}

export function stepSnake(snake: SnakeState): void {
  applyPendingDirection(snake);
  const v = DIR_VECTOR[snake.direction];
  const head = snake.body[0]!;
  const newHead: Cell = { x: head.x + v.x, y: head.y + v.y };
  snake.body.unshift(newHead);
  if (snake.growthQueue > 0) {
    snake.growthQueue -= 1;
  } else {
    snake.body.pop();
  }
}

export function collidesSelf(snake: SnakeState): boolean {
  const head = snake.body[0]!;
  for (let i = 1; i < snake.body.length; i++) {
    const seg = snake.body[i]!;
    if (seg.x === head.x && seg.y === head.y) return true;
  }
  return false;
}

export function killSnake(snake: SnakeState): void {
  snake.alive = false;
}
```

- [ ] **步骤 3.4：运行测试验证通过**

```bash
pnpm test -- tests/game/Snake.test.ts
```

预期：9 个测试全部 PASS

- [ ] **步骤 3.5：Commit**

```bash
git add src/game/core/Snake.ts tests/game/Snake.test.ts
git commit -m "feat(game): 实现 Snake 状态机（移动/转向/生长/撞身判定）+ 单测"
```

---
## 任务 4：Board（棋盘 + 边界 + 空格查找）

**文件：**

- 创建：`src/game/core/Board.ts`
- 测试：`tests/game/Board.test.ts`

**职责：** 边界判定、空格枚举与随机选取。**不感知食物种类**（由 Food 模块决定）。

- [ ] **步骤 4.1：编写失败的测试 `tests/game/Board.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { Board } from '@/game/core/Board';
import { Rng } from '@/game/core/Rng';
import { createSnake } from '@/game/core/Snake';

describe('Board', () => {
  it('isInside 判定边界', () => {
    const b = new Board(22);
    expect(b.isInside({ x: 0, y: 0 })).toBe(true);
    expect(b.isInside({ x: 21, y: 21 })).toBe(true);
    expect(b.isInside({ x: -1, y: 0 })).toBe(false);
    expect(b.isInside({ x: 0, y: 22 })).toBe(false);
    expect(b.isInside({ x: 22, y: 0 })).toBe(false);
  });

  it('findEmptyCell 不与已占格重叠', () => {
    const b = new Board(22);
    const rng = new Rng(123);
    const snake = createSnake({ x: 10, y: 10 }, 'right');
    const occupied = new Set(snake.body.map((c) => `${c.x},${c.y}`));
    for (let i = 0; i < 100; i++) {
      const cell = b.findEmptyCell(rng, occupied);
      expect(cell).not.toBeNull();
      expect(occupied.has(`${cell!.x},${cell!.y}`)).toBe(false);
    }
  });

  it('findEmptyCell 在棋盘填满时返回 null', () => {
    const b = new Board(3);
    const rng = new Rng(1);
    const occupied = new Set<string>();
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) occupied.add(`${x},${y}`);
    }
    expect(b.findEmptyCell(rng, occupied)).toBeNull();
  });

  it('相同种子相同 occupied 时输出相同（可复现）', () => {
    const occ = new Set(['10,10', '11,10']);
    const a = new Board(22).findEmptyCell(new Rng(7), occ);
    const c = new Board(22).findEmptyCell(new Rng(7), occ);
    expect(a).toEqual(c);
  });
});
```

- [ ] **步骤 4.2：运行测试验证失败**

```bash
pnpm test -- tests/game/Board.test.ts
```

预期：FAIL。

- [ ] **步骤 4.3：实现 `src/game/core/Board.ts`**

```ts
import type { Cell } from '@/game/types';
import type { Rng } from '@/game/core/Rng';

export class Board {
  constructor(public readonly size: number) {}

  isInside(cell: Cell): boolean {
    return cell.x >= 0 && cell.x < this.size && cell.y >= 0 && cell.y < this.size;
  }

  /**
   * 在棋盘上随机找一个不在 occupied 中的格子。
   * 算法：先随机尝试 16 次以 O(1) 处理常见情况；失败后枚举所有空格再随机挑选，
   * 在棋盘快填满时仍能正确返回（O(N^2) 仅限边界场景）。
   */
  findEmptyCell(rng: Rng, occupied: ReadonlySet<string>): Cell | null {
    for (let i = 0; i < 16; i++) {
      const x = rng.intRange(0, this.size);
      const y = rng.intRange(0, this.size);
      if (!occupied.has(`${x},${y}`)) return { x, y };
    }
    const empties: Cell[] = [];
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        if (!occupied.has(`${x},${y}`)) empties.push({ x, y });
      }
    }
    if (empties.length === 0) return null;
    return rng.pick(empties);
  }

  /** 工具：把 Cell 数组转换成 occupied 字符串集合。 */
  static toOccupied(cells: readonly Cell[]): Set<string> {
    const set = new Set<string>();
    for (const c of cells) set.add(`${c.x},${c.y}`);
    return set;
  }
}
```

- [ ] **步骤 4.4：运行测试验证通过**

```bash
pnpm test -- tests/game/Board.test.ts
```

预期：4 个测试全部 PASS

- [ ] **步骤 4.5：Commit**

```bash
git add src/game/core/Board.ts tests/game/Board.test.ts
git commit -m "feat(game): 实现 Board（边界判定 + 空格随机查找）+ 单测"
```

---
## 任务 5：Food（食物工厂 + 过期判定）

**文件：**

- 创建：`src/game/core/Food.ts`
- 测试：`tests/game/Food.test.ts`

**职责：** 按概率权重生成食物、计算过期时间、判定过期。

- [ ] **步骤 5.1：编写失败的测试 `tests/game/Food.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { spawnFood, isExpired } from '@/game/core/Food';
import { Rng } from '@/game/core/Rng';
import { Board } from '@/game/core/Board';
import { METEOR_LIFETIME_MS } from '@/game/types';

describe('Food', () => {
  it('spawnFood 返回的食物位置在棋盘内、不在 occupied 中', () => {
    const board = new Board(22);
    const rng = new Rng(1);
    const occ = new Set(['10,10']);
    const weights = { apple: 1, cherry: 1 } as const;
    for (let i = 0; i < 50; i++) {
      const f = spawnFood(board, rng, occ, weights, 0);
      expect(f).not.toBeNull();
      expect(board.isInside(f!.cell)).toBe(true);
      expect(occ.has(`${f!.cell.x},${f!.cell.y}`)).toBe(false);
    }
  });

  it('棋盘填满时返回 null', () => {
    const board = new Board(2);
    const rng = new Rng(1);
    const occ = new Set(['0,0', '0,1', '1,0', '1,1']);
    const f = spawnFood(board, rng, occ, { apple: 1 }, 0);
    expect(f).toBeNull();
  });

  it('普通水果分值为 1，无 expiresAt', () => {
    const board = new Board(22);
    const rng = new Rng(1);
    const f = spawnFood(board, rng, new Set(), { apple: 1 }, 1000);
    expect(f!.kind).toBe('apple');
    expect(f!.score).toBe(1);
    expect(f!.spawnedAt).toBe(1000);
    expect(f!.expiresAt).toBeUndefined();
  });

  it('meteor 分值为 5，expiresAt = spawnedAt + 10s', () => {
    const board = new Board(22);
    const rng = new Rng(1);
    const f = spawnFood(board, rng, new Set(), { meteor: 1 }, 1000);
    expect(f!.kind).toBe('meteor');
    expect(f!.score).toBe(5);
    expect(f!.expiresAt).toBe(1000 + METEOR_LIFETIME_MS);
  });

  it('化石分值为 10，无 expiresAt', () => {
    const board = new Board(22);
    const rng = new Rng(1);
    const f = spawnFood(board, rng, new Set(), { fossil_amber: 1 }, 0);
    expect(f!.kind).toBe('fossil_amber');
    expect(f!.score).toBe(10);
    expect(f!.expiresAt).toBeUndefined();
  });

  it('isExpired: 普通水果永不过期、流星按 expiresAt 过期', () => {
    const apple = { cell: { x: 0, y: 0 }, kind: 'apple' as const, spawnedAt: 0, score: 1 };
    expect(isExpired(apple, 999_999)).toBe(false);

    const meteor = {
      cell: { x: 1, y: 1 }, kind: 'meteor' as const,
      spawnedAt: 0, expiresAt: 10_000, score: 5,
    };
    expect(isExpired(meteor, 9_999)).toBe(false);
    expect(isExpired(meteor, 10_001)).toBe(true);
  });
});
```

- [ ] **步骤 5.2：运行测试验证失败**

```bash
pnpm test -- tests/game/Food.test.ts
```

预期：FAIL。

- [ ] **步骤 5.3：实现 `src/game/core/Food.ts`**

```ts
import type { Food, FoodKind } from '@/game/types';
import { FOOD_SCORE, METEOR_LIFETIME_MS } from '@/game/types';
import type { Board } from '@/game/core/Board';
import type { Rng } from '@/game/core/Rng';

export function spawnFood(
  board: Board,
  rng: Rng,
  occupied: ReadonlySet<string>,
  weights: Partial<Record<FoodKind, number>>,
  now: number,
): Food | null {
  const cell = board.findEmptyCell(rng, occupied);
  if (!cell) return null;
  const kind = rng.pickWeighted(weights) as FoodKind;
  const food: Food = {
    cell,
    kind,
    spawnedAt: now,
    score: FOOD_SCORE[kind],
  };
  if (kind === 'meteor') {
    food.expiresAt = now + METEOR_LIFETIME_MS;
  }
  return food;
}

export function isExpired(food: Food, now: number): boolean {
  return food.expiresAt !== undefined && now >= food.expiresAt;
}
```

- [ ] **步骤 5.4：运行测试验证通过**

```bash
pnpm test -- tests/game/Food.test.ts
```

预期：6 个测试全部 PASS

- [ ] **步骤 5.5：Commit**

```bash
git add src/game/core/Food.ts tests/game/Food.test.ts
git commit -m "feat(game): 实现 Food 工厂（按权重生成 + 过期判定）+ 单测"
```

---
## 任务 6：EventBus（事件总线）

**文件：**

- 创建：`src/game/core/EventBus.ts`
- 测试：`tests/game/EventBus.test.ts`

**职责：** 解耦核心层与渲染/Vue 层。核心层 emit 事件，订阅者按需响应（动效、SFX、Pinia 持久化）。

**事件清单（Stage 1 用到的）：**

- `eat`：吃到食物时，payload `{ food: Food, snakeLength: number }`
- `die`：撞墙/撞身时，payload `{ score: number, length: number, island: IslandId, mode: ModeId }`
- `start`：游戏开始，payload `{ island: IslandId, mode: ModeId }`
- `pause` / `resume`：暂停切换，无 payload
- `tick`：每个逻辑步长，payload `{ tickCount: number }`（用于调试，可不订阅）

- [ ] **步骤 6.1：编写失败的测试 `tests/game/EventBus.test.ts`**

```ts
import { describe, it, expect, vi } from 'vitest';
import { EventBus } from '@/game/core/EventBus';

describe('EventBus', () => {
  it('on + emit 触发监听器', () => {
    const bus = new EventBus<{ ping: { value: number } }>();
    const handler = vi.fn();
    bus.on('ping', handler);
    bus.emit('ping', { value: 42 });
    expect(handler).toHaveBeenCalledWith({ value: 42 });
  });

  it('off 移除监听器', () => {
    const bus = new EventBus<{ ping: void }>();
    const handler = vi.fn();
    bus.on('ping', handler);
    bus.off('ping', handler);
    bus.emit('ping', undefined);
    expect(handler).not.toHaveBeenCalled();
  });

  it('多个监听器都被触发', () => {
    const bus = new EventBus<{ ping: void }>();
    const a = vi.fn();
    const b = vi.fn();
    bus.on('ping', a);
    bus.on('ping', b);
    bus.emit('ping', undefined);
    expect(a).toHaveBeenCalledOnce();
    expect(b).toHaveBeenCalledOnce();
  });

  it('on 返回的 unsubscribe 函数可移除监听器', () => {
    const bus = new EventBus<{ ping: void }>();
    const handler = vi.fn();
    const unsub = bus.on('ping', handler);
    unsub();
    bus.emit('ping', undefined);
    expect(handler).not.toHaveBeenCalled();
  });

  it('clear 清空所有监听器', () => {
    const bus = new EventBus<{ ping: void; pong: void }>();
    const a = vi.fn();
    const b = vi.fn();
    bus.on('ping', a);
    bus.on('pong', b);
    bus.clear();
    bus.emit('ping', undefined);
    bus.emit('pong', undefined);
    expect(a).not.toHaveBeenCalled();
    expect(b).not.toHaveBeenCalled();
  });
});
```

- [ ] **步骤 6.2：运行测试验证失败**

```bash
pnpm test -- tests/game/EventBus.test.ts
```

预期：FAIL。

- [ ] **步骤 6.3：实现 `src/game/core/EventBus.ts`**

```ts
import type { Food, IslandId, ModeId } from '@/game/types';

export interface GameEvents {
  eat: { food: Food; snakeLength: number };
  die: { score: number; length: number; island: IslandId; mode: ModeId };
  start: { island: IslandId; mode: ModeId };
  pause: void;
  resume: void;
  tick: { tickCount: number };
}

type Handler<T> = (payload: T) => void;

export class EventBus<EMap extends Record<string, unknown> = GameEvents> {
  private listeners = new Map<keyof EMap, Set<Handler<unknown>>>();

  on<K extends keyof EMap>(type: K, handler: Handler<EMap[K]>): () => void {
    let set = this.listeners.get(type);
    if (!set) {
      set = new Set();
      this.listeners.set(type, set);
    }
    set.add(handler as Handler<unknown>);
    return () => this.off(type, handler);
  }

  off<K extends keyof EMap>(type: K, handler: Handler<EMap[K]>): void {
    this.listeners.get(type)?.delete(handler as Handler<unknown>);
  }

  emit<K extends keyof EMap>(type: K, payload: EMap[K]): void {
    const set = this.listeners.get(type);
    if (!set) return;
    for (const h of set) (h as Handler<EMap[K]>)(payload);
  }

  clear(): void {
    this.listeners.clear();
  }
}
```

- [ ] **步骤 6.4：运行测试验证通过**

```bash
pnpm test -- tests/game/EventBus.test.ts
```

预期：5 个测试全部 PASS

- [ ] **步骤 6.5：Commit**

```bash
git add src/game/core/EventBus.ts tests/game/EventBus.test.ts
git commit -m "feat(game): 实现 EventBus（类型安全的事件总线）+ 单测"
```

---
## 任务 7：GameLoop（固定步长 + RAF 渲染插值）

**文件：**

- 创建：`src/game/core/GameLoop.ts`
- 测试：`tests/game/GameLoop.test.ts`

**职责：** 固定逻辑步长 update，每帧 render(alpha) 渲染插值，支持暂停/恢复。**不感知具体游戏内容**——只接受两个回调。

- [ ] **步骤 7.1：编写失败的测试 `tests/game/GameLoop.test.ts`**

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameLoop } from '@/game/core/GameLoop';

describe('GameLoop', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('start 后按固定步长触发 update', () => {
    const update = vi.fn();
    const render = vi.fn();
    const loop = new GameLoop({ tickMs: 100, update, render });
    loop.start();
    // 模拟 350ms 推进；预期触发 3 次 update
    loop.tickFor(350);
    expect(update).toHaveBeenCalledTimes(3);
  });

  it('render 每次推进时被调用一次，alpha 在 [0, 1)', () => {
    const update = vi.fn();
    let lastAlpha = -1;
    const render = vi.fn((a: number) => { lastAlpha = a; });
    const loop = new GameLoop({ tickMs: 100, update, render });
    loop.start();
    loop.tickFor(50);
    expect(render).toHaveBeenCalled();
    expect(lastAlpha).toBeGreaterThanOrEqual(0);
    expect(lastAlpha).toBeLessThan(1);
  });

  it('pause 后 update 不再被调用', () => {
    const update = vi.fn();
    const render = vi.fn();
    const loop = new GameLoop({ tickMs: 100, update, render });
    loop.start();
    loop.tickFor(150);
    const calls = update.mock.calls.length;
    loop.pause();
    loop.tickFor(500);
    expect(update.mock.calls.length).toBe(calls);
  });

  it('resume 后不会一次性触发大量 update（不积累暂停期间）', () => {
    const update = vi.fn();
    const render = vi.fn();
    const loop = new GameLoop({ tickMs: 100, update, render });
    loop.start();
    loop.pause();
    loop.tickFor(5000);
    loop.resume();
    loop.tickFor(50);
    expect(update.mock.calls.length).toBeLessThanOrEqual(1);
  });

  it('setTickMs 可在运行时调整步长', () => {
    const update = vi.fn();
    const render = vi.fn();
    const loop = new GameLoop({ tickMs: 100, update, render });
    loop.start();
    loop.setTickMs(50);
    loop.tickFor(150);
    expect(update.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('stop 永久停止', () => {
    const update = vi.fn();
    const render = vi.fn();
    const loop = new GameLoop({ tickMs: 100, update, render });
    loop.start();
    loop.stop();
    loop.tickFor(500);
    expect(update).not.toHaveBeenCalled();
  });
});
```

- [ ] **步骤 7.2：运行测试验证失败**

```bash
pnpm test -- tests/game/GameLoop.test.ts
```

预期：FAIL。

- [ ] **步骤 7.3：实现 `src/game/core/GameLoop.ts`**

```ts
export interface GameLoopOptions {
  tickMs: number;
  update: () => void;
  render: (alpha: number) => void;
  /** 默认使用 requestAnimationFrame；测试用 tickFor 手动推进时可省略。 */
  raf?: (cb: (now: number) => void) => number;
  cancelRaf?: (handle: number) => void;
  now?: () => number;
}

export class GameLoop {
  private tickMs: number;
  private update: () => void;
  private render: (alpha: number) => void;
  private raf: (cb: (now: number) => void) => number;
  private cancelRaf: (h: number) => void;
  private now: () => number;

  private acc = 0;
  private lastT = 0;
  private rafHandle: number | null = null;
  private state: 'idle' | 'running' | 'paused' | 'stopped' = 'idle';
  private virtualNow = 0; // 用于 tickFor 手动推进

  constructor(opts: GameLoopOptions) {
    this.tickMs = opts.tickMs;
    this.update = opts.update;
    this.render = opts.render;
    this.raf = opts.raf ?? ((cb) => requestAnimationFrame(cb));
    this.cancelRaf = opts.cancelRaf ?? ((h) => cancelAnimationFrame(h));
    this.now = opts.now ?? (() => performance.now());
  }

  setTickMs(ms: number): void {
    this.tickMs = Math.max(1, ms);
  }

  getTickMs(): number {
    return this.tickMs;
  }

  getState(): 'idle' | 'running' | 'paused' | 'stopped' {
    return this.state;
  }

  setRender(cb: (alpha: number) => void): void {
    this.render = cb;
  }

  start(): void {
    if (this.state === 'running') return;
    this.state = 'running';
    this.lastT = this.now();
    this.acc = 0;
    this.scheduleFrame();
  }

  pause(): void {
    if (this.state !== 'running') return;
    this.state = 'paused';
    if (this.rafHandle !== null) {
      this.cancelRaf(this.rafHandle);
      this.rafHandle = null;
    }
  }

  resume(): void {
    if (this.state !== 'paused') return;
    this.state = 'running';
    this.lastT = this.now();
    this.acc = 0; // 不积累暂停期间的时间
    this.scheduleFrame();
  }

  stop(): void {
    this.state = 'stopped';
    if (this.rafHandle !== null) {
      this.cancelRaf(this.rafHandle);
      this.rafHandle = null;
    }
  }

  /** 测试专用：手动推进虚拟时间。 */
  tickFor(deltaMs: number): void {
    if (this.state !== 'running') return;
    this.virtualNow += deltaMs;
    this.frame(this.lastT + this.virtualNow);
  }

  private scheduleFrame(): void {
    this.rafHandle = this.raf((t) => this.frame(t));
  }

  private frame(now: number): void {
    if (this.state !== 'running') return;
    const delta = now - this.lastT;
    this.lastT = now;
    this.acc += delta;
    while (this.acc >= this.tickMs) {
      this.update();
      this.acc -= this.tickMs;
    }
    const alpha = this.acc / this.tickMs;
    this.render(alpha);
    // 仅在使用真实 RAF 时继续调度；tickFor 手动模式不自动调度
    if (this.rafHandle !== null || this.virtualNow === 0) {
      this.scheduleFrame();
    }
  }
}
```

- [ ] **步骤 7.4：运行测试验证通过**

```bash
pnpm test -- tests/game/GameLoop.test.ts
```

预期：6 个测试全部 PASS

- [ ] **步骤 7.5：Commit**

```bash
git add src/game/core/GameLoop.ts tests/game/GameLoop.test.ts
git commit -m "feat(game): 实现 GameLoop（固定步长 + RAF 渲染插值 + 暂停恢复）+ 单测"
```

---
## 任务 8：InputController（键盘输入到方向指令）

**文件：**

- 创建：`src/game/core/InputController.ts`
- 测试：`tests/game/InputController.test.ts`

**职责：** 把 DOM `keydown` 事件转换为 `Dir` 指令并通过回调下发；处理暂停键。**不感知 SnakeState**——上游决定如何响应。

支持的键位（详见规格 10.1）：

- WASD / 方向键 → up/down/left/right
- Space / P → 暂停切换
- ESC → 仅打开暂停（不切换）
- R → reset（GameOverModal 打开时用）

- [ ] **步骤 8.1：编写失败的测试 `tests/game/InputController.test.ts`**

```ts
import { describe, it, expect, vi } from 'vitest';
import { InputController } from '@/game/core/InputController';

function dispatchKey(target: EventTarget, code: string, key: string): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { code, key }));
}

describe('InputController', () => {
  it('WASD 触发对应方向', () => {
    const onDir = vi.fn();
    const target = new EventTarget();
    const ic = new InputController({ target, onDirection: onDir });
    ic.attach();
    dispatchKey(target, 'KeyW', 'w');
    dispatchKey(target, 'KeyA', 'a');
    dispatchKey(target, 'KeyS', 's');
    dispatchKey(target, 'KeyD', 'd');
    expect(onDir.mock.calls.map((c) => c[0])).toEqual(['up', 'left', 'down', 'right']);
    ic.detach();
  });

  it('方向键触发对应方向', () => {
    const onDir = vi.fn();
    const target = new EventTarget();
    const ic = new InputController({ target, onDirection: onDir });
    ic.attach();
    dispatchKey(target, 'ArrowUp', 'ArrowUp');
    dispatchKey(target, 'ArrowDown', 'ArrowDown');
    dispatchKey(target, 'ArrowLeft', 'ArrowLeft');
    dispatchKey(target, 'ArrowRight', 'ArrowRight');
    expect(onDir.mock.calls.map((c) => c[0])).toEqual(['up', 'down', 'left', 'right']);
    ic.detach();
  });

  it('Space 和 P 触发 pauseToggle', () => {
    const onPause = vi.fn();
    const target = new EventTarget();
    const ic = new InputController({ target, onDirection: () => {}, onPauseToggle: onPause });
    ic.attach();
    dispatchKey(target, 'Space', ' ');
    dispatchKey(target, 'KeyP', 'p');
    expect(onPause).toHaveBeenCalledTimes(2);
    ic.detach();
  });

  it('ESC 触发 onPauseRequest（不切换）', () => {
    const onPauseReq = vi.fn();
    const target = new EventTarget();
    const ic = new InputController({ target, onDirection: () => {}, onPauseRequest: onPauseReq });
    ic.attach();
    dispatchKey(target, 'Escape', 'Escape');
    expect(onPauseReq).toHaveBeenCalledOnce();
    ic.detach();
  });

  it('R 触发 onReset', () => {
    const onReset = vi.fn();
    const target = new EventTarget();
    const ic = new InputController({ target, onDirection: () => {}, onReset });
    ic.attach();
    dispatchKey(target, 'KeyR', 'r');
    expect(onReset).toHaveBeenCalledOnce();
    ic.detach();
  });

  it('detach 后不再响应键', () => {
    const onDir = vi.fn();
    const target = new EventTarget();
    const ic = new InputController({ target, onDirection: onDir });
    ic.attach();
    ic.detach();
    dispatchKey(target, 'KeyW', 'w');
    expect(onDir).not.toHaveBeenCalled();
  });

  it('未识别的键被忽略', () => {
    const onDir = vi.fn();
    const onPause = vi.fn();
    const target = new EventTarget();
    const ic = new InputController({ target, onDirection: onDir, onPauseToggle: onPause });
    ic.attach();
    dispatchKey(target, 'KeyX', 'x');
    dispatchKey(target, 'Enter', 'Enter');
    expect(onDir).not.toHaveBeenCalled();
    expect(onPause).not.toHaveBeenCalled();
    ic.detach();
  });
});
```

- [ ] **步骤 8.2：运行测试验证失败**

```bash
pnpm test -- tests/game/InputController.test.ts
```

预期：FAIL。

- [ ] **步骤 8.3：实现 `src/game/core/InputController.ts`**

```ts
import type { Dir } from '@/game/types';

export interface InputControllerOptions {
  target: EventTarget;
  onDirection: (dir: Dir) => void;
  onPauseToggle?: () => void;
  onPauseRequest?: () => void;
  onReset?: () => void;
}

const DIR_BY_CODE: Record<string, Dir> = {
  KeyW: 'up', ArrowUp: 'up',
  KeyS: 'down', ArrowDown: 'down',
  KeyA: 'left', ArrowLeft: 'left',
  KeyD: 'right', ArrowRight: 'right',
};

export class InputController {
  private opts: InputControllerOptions;
  private listener: (e: Event) => void;
  private attached = false;

  constructor(opts: InputControllerOptions) {
    this.opts = opts;
    this.listener = (e) => this.handle(e as KeyboardEvent);
  }

  attach(): void {
    if (this.attached) return;
    this.opts.target.addEventListener('keydown', this.listener);
    this.attached = true;
  }

  detach(): void {
    if (!this.attached) return;
    this.opts.target.removeEventListener('keydown', this.listener);
    this.attached = false;
  }

  private handle(e: KeyboardEvent): void {
    const dir = DIR_BY_CODE[e.code];
    if (dir) {
      this.opts.onDirection(dir);
      return;
    }
    if (e.code === 'Space' || e.code === 'KeyP') {
      this.opts.onPauseToggle?.();
      return;
    }
    if (e.code === 'Escape') {
      this.opts.onPauseRequest?.();
      return;
    }
    if (e.code === 'KeyR') {
      this.opts.onReset?.();
      return;
    }
  }
}
```

- [ ] **步骤 8.4：运行测试验证通过**

```bash
pnpm test -- tests/game/InputController.test.ts
```

预期：7 个测试全部 PASS

- [ ] **步骤 8.5：Commit**

```bash
git add src/game/core/InputController.ts tests/game/InputController.test.ts
git commit -m "feat(game): 实现 InputController（键盘到 Dir 指令）+ 单测"
```

---
