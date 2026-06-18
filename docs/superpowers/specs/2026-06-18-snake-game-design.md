# 动森风格贪吃蛇 · 设计规格

- **状态**：已批准（待写实现计划）
- **创建日期**：2026-06-18
- **作者**：opencode brainstorming session
- **关联文档**：
  - 设计语言来源：`.opencode/skills/animal-island-vue-style/SKILL.md`
  - 实现计划：待 writing-plans 阶段产出

---

## 1. 项目定位

### 1.1 一句话定义

一款基于 Web、单机运行、采用《集合啦！动物森友会》视觉风格的贪吃蛇游戏，提供「自由散步」和「每日挑战」两种模式，包含 5 个主题岛屿、图鉴、成就、称号等元系统，桌面端优先并自适应到移动端。

### 1.2 核心叙事

玩家扮演一只在无人岛上散步的小狸，把掉落的水果收集成一串带回家。蛇身渐变棕色、戴叶子帽，吃到的食物会被记录到 NookPhone 风格的图鉴里。

### 1.3 完成度目标

- 玩家能畅玩 5 局以上不腻
- 5 个岛屿视觉差异显著、每岛动效与配色独立打磨
- 图鉴 / 成就 / 称号能支撑长期目标
- 桌面端 60fps 稳定，中端手机浏览器流畅可玩
- 视觉与官方 animal-island-vue 组件库风格统一，截图能让人认出「动森风」

### 1.4 决策汇总

| 维度 | 选择 | 关键含义 |
|---|---|---|
| 画面形态 | 居中方形棋盘 22×22 | HUD 在画面外，棋盘是视觉主体 |
| 玩法定位 | 自由模式 + 每日挑战 | 双模式共用引擎，规则层不同 |
| 节奏 | 动森节奏（6 格/秒起步） | 三档难度 闲庭/慢跑/狂奔 |
| 关卡 | 5 个岛屿（春樱/夏海/秋枫/冬雪/化石） | 每岛独立打磨色板/食物/装饰 |
| 素材策略 | 代码绘制 + 关键素材 AI 生成 | 23 张 SVG/PNG + 1 BGM + 8 SFX |
| 平台 | 桌面优先，移动端可玩 | 键盘主战场，竖屏自适应 |
| 排行榜 | 不做 | 自由模式仅本地最高分；纯单机 |
| 分享功能 | 仅每日挑战支持图片导出 | html2canvas 生成结算图 |

---

## 2. 技术栈

| 层 | 选型 | 说明 |
|---|---|---|
| 框架 | Vue 3 + TypeScript + `<script setup>` | 与 animal-island-vue 同栈 |
| 构建 | Vite 5+ | 快速 HMR |
| UI 库 | animal-island-vue | 已有 24 组件，复用 design tokens |
| 渲染 | Canvas 2D（游戏区） + Vue 组件（HUD/菜单） | 不引入 Pixi/Phaser |
| 状态 | Pinia | 全局存档、设置、进度 |
| 路由 | Vue Router 4 | Home / Game / Dex / Settings |
| 音频 | Howler.js | BGM 循环 + SFX 池化 |
| 持久化 | localStorage | Progress JSON 序列化，可导出 |
| 图片导出 | html2canvas | 仅每日挑战结算分享 |
| 样式 | Less | 与组件库一致 |
| 测试 | Vitest + @vue/test-utils | 内核单测 + 关键组件测试 |
| 包管理 | pnpm | |
| 代码质量 | ESLint + Prettier + vue-tsc | |

**显式不引入**：Pixi.js / Phaser（贪吃蛇逻辑简单，会拖累细腻渲染）、Tailwind（与 animal-island-vue 的 Less 体系冲突）、任何 React 相关。

---

## 3. 架构总览

```
+-----------------------------------------------------+
|  Vue 层 (UI / 路由 / 状态)                          |
|  - HomeView / GameView / DexView / SettingsView    |
|  - animal-island-vue 组件                          |
|  - Pinia: gameStore / progressStore / settingsStore |
+----------------+------------------------------------+
                 | 仅 GameCanvas.vue 与下层交互
                 v
+-----------------------------------------------------+
|  Game 内核 (纯 TS / 无 Vue 依赖 / 可单测)          |
|  +----------+  +------------+  +---------------+  |
|  |  Core    |  |   Render   |  |     Audio     |  |
|  | Snake    |  | Renderer   |  | AudioManager  |  |
|  | Board    |  | Layers x5  |  |   (Howler)    |  |
|  | Food     |  | ThemePack  |  +---------------+  |
|  | Obstacle |  +------------+                      |
|  | GameLoop |                                       |
|  | Input    |  +------------+                      |
|  | Rng      |  | Levels     |  islands.ts 数据驱动 |
|  | EventBus |  | Modes      |                      |
|  +----------+  +------------+                      |
+-----------------------------------------------------+
```

### 3.1 核心架构原则

1. **`src/game/` 完全脱离 Vue**：纯函数 + 类，可独立单测，未来想换框架不需要改逻辑。
2. **Vue 层只做装载器**：`GameCanvas.vue` 创建 canvas、传递输入、显示 HUD，**不参与游戏逻辑**。
3. **数据驱动关卡**：5 个岛屿 = 5 份 JSON 配置 + 5 套主题 token，新增岛屿不改引擎代码。
4. **EventBus 解耦渲染与逻辑**：核心层 emit `eat / die / level-up / unlock`，渲染层和 Vue 层订阅触发动效与持久化。
5. **隔离与清晰**：每个文件单一职责。Snake 不知道 Board，Board 不知道 Renderer，Renderer 不知道 Vue。

### 3.2 模块边界

| 模块 | 输入 | 输出 | 依赖 |
|---|---|---|---|
| `core/Snake` | 方向指令 | 蛇身位置数组、生长状态 | 无 |
| `core/Board` | 棋盘尺寸、蛇位置 | 食物位置、碰撞判定 | Rng |
| `core/Food` | 概率表、当前空格 | 食物实例 | Rng |
| `core/GameLoop` | tick 回调、render 回调 | RAF 句柄 | 无 |
| `core/InputController` | DOM 事件 | 标准化方向指令 | 无 |
| `render/Renderer` | GameState 快照 | Canvas 像素 | core/* (只读) |
| `audio/AudioManager` | 事件名 | 声音播放 | Howler |
| `modes/*` | GameState | 规则判定结果 | core/* |
| Vue 层 | 用户操作 | 路由切换、Pinia 状态 | 全部 game/ 模块 |


---

## 4. 目录结构

```
snake-game/
├── public/
│   ├── audio/                    # BGM + SFX
│   └── sprites/                  # AI 生成 SVG/PNG，按子目录归类
│       ├── fruits/
│       ├── fossils/
│       ├── decorations/
│       └── hats/
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── router/index.ts
│   ├── stores/
│   │   ├── game.ts               # 当前对局快照（暂停恢复用）
│   │   ├── progress.ts           # 解锁/最高分/图鉴/成就
│   │   └── settings.ts           # 音量/难度/控制方式
│   ├── views/
│   │   ├── HomeView.vue
│   │   ├── GameView.vue
│   │   ├── DexView.vue
│   │   └── SettingsView.vue
│   ├── game/                     # 纯 TS 内核（无 Vue 依赖）
│   │   ├── core/
│   │   │   ├── Snake.ts
│   │   │   ├── Board.ts
│   │   │   ├── Food.ts
│   │   │   ├── Obstacle.ts
│   │   │   ├── GameLoop.ts
│   │   │   ├── InputController.ts
│   │   │   ├── Rng.ts
│   │   │   └── EventBus.ts
│   │   ├── render/
│   │   │   ├── Renderer.ts
│   │   │   ├── layers/
│   │   │   │   ├── GrassLayer.ts
│   │   │   │   ├── FoodLayer.ts
│   │   │   │   ├── ObstacleLayer.ts
│   │   │   │   ├── SnakeLayer.ts
│   │   │   │   └── EffectsLayer.ts
│   │   │   ├── theme.ts
│   │   │   └── sprites.ts
│   │   ├── audio/AudioManager.ts
│   │   ├── levels/islands.ts
│   │   ├── modes/
│   │   │   ├── FreeMode.ts
│   │   │   └── DailyMode.ts
│   │   ├── achievements.ts
│   │   ├── titles.ts
│   │   └── types.ts
│   ├── components/
│   │   ├── GameCanvas.vue
│   │   ├── GameHUD.vue
│   │   ├── PauseModal.vue
│   │   ├── GameOverModal.vue
│   │   ├── DailyShareCard.vue
│   │   ├── IslandPicker.vue
│   │   ├── ModeSwitcher.vue
│   │   ├── DPad.vue
│   │   ├── SwipeArea.vue
│   │   └── DexCard.vue
│   └── styles/tokens.less
├── tests/
│   └── game/
│       ├── Snake.test.ts
│       ├── Board.test.ts
│       ├── Food.test.ts
│       ├── Rng.test.ts
│       ├── FreeMode.test.ts
│       └── DailyMode.test.ts
├── docs/superpowers/specs/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── .eslintrc.cjs
├── .prettierrc
└── package.json
```

**关键约束**：

- `src/game/` 内的文件**禁止** import 任何 Vue / Pinia / Vue Router 模块
- 公共类型集中在 `src/game/types.ts`，所有模块从此处 import
- Vue 组件文件保持单一职责：超过 300 行需评估拆分
- 任何对 localStorage 的读写都必须经过 `progress.ts` / `settings.ts` 两个 store，不允许散落

---

## 5. 核心数据模型

### 5.1 基础类型（types.ts）

```ts
export interface Cell { x: number; y: number; }

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

export type AchievementId =
  | 'gourmet'
  | 'long_dragon'
  | 'meteor_hunter'
  | 'paleontologist'
  | 'spring_clear' | 'summer_clear' | 'autumn_clear'
  | 'winter_clear'  | 'fossil_clear'
  | 'daily_warrior'
  | 'traveler';

export type TitleId =
  | 'rookie' | 'gourmet' | 'long_dragon' | 'meteor_hunter'
  | 'paleontologist' | 'spring_visitor' | 'summer_visitor'
  | 'autumn_visitor' | 'winter_visitor' | 'traveler';
```

### 5.2 蛇身

```ts
export interface SnakeState {
  body: Cell[];           // [head, ..., tail]，循环数组实现
  direction: Dir;
  pendingDirection: Dir;  // 下一 tick 才生效，防穿身
  growthQueue: number;    // 待生长格数；每 tick 跳过删尾巴一次
  alive: boolean;
  invincibleUntil?: number; // 金苹果效果失效时间戳
}
```

**关键设计决策**：

1. **循环数组实现**：头尾增删 O(1)，比链表性能更好。
2. **growthQueue 而非立即变长**：吃食物时不立即生长一节，后续每 tick 跳过删除尾巴一次，视觉更平滑。
3. **pendingDirection**：解决经典 bug——一帧内连续按 ↑→ 撞身。当前 tick 只接受第一个非反向键存入 pending，下一 tick 才生效。
4. **invincibleUntil**：金苹果无敌期间忽略撞身/撞障判定，但仍受边界限制。

### 5.3 食物

```ts
export interface Food {
  cell: Cell;
  kind: FoodKind;
  spawnedAt: number;
  expiresAt?: number;    // 流星 10s 过期，化石不过期
  score: number;
}
```

**食物分值表**：

| Kind | 分值 | 说明 |
|---|---|---|
| 普通水果（9 种） | 1 | 标准 |
| meteor 流星 | 5 | 限时 10 秒 |
| golden 金苹果 | 3 | 吃后无敌 3 秒 |
| fossil_* 化石 | 10 | 触发图鉴录入 + 全屏闪光 |

### 5.4 岛屿与主题

```ts
export interface Island {
  id: IslandId;
  name: string;
  unlockScore: number;     // 累计分数解锁阈值；春樱 = 0
  unlockSpecial?: 'all_fossils';
  theme: ThemeTokens;
  bgmKey: string;
  fruitWeights: Partial<Record<FoodKind, number>>;
  decorations: DecorationDef[];
  ambientParticles?: 'cherry_blossom' | 'maple_leaf' | 'snow' | 'sand';
}

export interface DecorationDef {
  spriteKey: string;
  density: number;
  zone: 'border' | 'corner' | 'scattered';
}

export interface ThemeTokens {
  grassA: string; grassB: string;
  grassNoise: string; vignette: string;
  snakeHead: string;
  snakeBodyStart: string; snakeBodyEnd: string;
  hatSprite: string;
  accent: string;
}
```

### 5.5 模式

```ts
export interface GameMode {
  id: ModeId;
  shouldSpawnObstacles: boolean;
  rngSeed?: number;
  obstacleDensity?: number;
  onTickHook?: (state: GameState) => void;
}
```

### 5.6 进度（持久化）

```ts
export interface Progress {
  version: 1;
  highScore: Record<IslandId, number>;
  cumulativeScore: number;
  unlockedIslands: IslandId[];
  dex: {
    fruits: FoodKind[];
    fossils: FoodKind[];
    titles: TitleId[];
  };
  achievements: AchievementId[];
  dailyHistory: Array<{
    date: string;
    score: number;
    seed: number;
    island: IslandId;
    length: number;
  }>;
  meteorEatenTotal: number;
  consecutiveDailyDays: number;
  lastDailyDate?: string;
}
```

**localStorage Keys**：

- `snake-game.progress` — Progress JSON
- `snake-game.settings` — Settings JSON
- `snake-game.version` — schema 版本号，未来升级迁移用

**导出 / 导入**：DexView 顶部按钮，下载/上传 JSON 文件。

---

## 6. 游戏循环

### 6.1 固定步长 + RAF 渲染插值

```ts
const TICK_MS_BY_DIFFICULTY = {
  casual: 1000 / 4,
  normal: 1000 / 6,
  hard:   1000 / 10,
};

let acc = 0, lastT = performance.now();
function frame(now: number) {
  acc += now - lastT; lastT = now;
  while (acc >= currentTickMs) {
    update();
    acc -= currentTickMs;
  }
  const alpha = acc / currentTickMs;
  render(alpha);
  requestAnimationFrame(frame);
}
```

**关键点**：

- **逻辑步长固定**：保证不同帧率下手感一致
- **渲染插值**：60fps 下蛇移动 alpha 从 0 平滑到 1，看起来不会跳格
- **每吃 5 个食物**：currentTickMs 乘以 0.95，封顶在 1000/12（12 格/秒）
- **失焦自动暂停**：visibilitychange + window.blur 同时监听
- **暂停状态不积累 acc**：恢复时不会一次性触发多个 update

### 6.2 单 tick 内的 update 顺序

1. 应用 pendingDirection 到 direction
2. 计算新蛇头位置
3. 判定边界碰撞 → 死亡
4. 判定撞身（除非 invincible）→ 死亡
5. 判定撞障（除非 invincible）→ 死亡
6. 判定吃食物 → growthQueue++、更新分数、emit eat 事件
7. 更新蛇身：unshift 新头；若 growthQueue > 0 则 growthQueue--、否则 pop 尾
8. 移除过期食物（meteor）
9. 食物生成判定（按概率刷新）
10. 触发 mode.onTickHook

---

## 7. 渲染分层

5 层 Canvas 自下而上叠加，每层独立 OffscreenCanvas，按需重绘：

| 层 | 内容 | 重绘时机 |
|---|---|---|
| 1. Grass | 双色棋盘 + 噪点 + 边缘渐隐 + 装饰物 | 仅切岛或尺寸变化时 |
| 2. Food | 食物 + 浮动动画 + 高光 | 每帧 |
| 3. Obstacle | 树桩/栅栏/传送门 | 仅每日挑战、生成时 |
| 4. Snake | 蛇身渐变 pill + 头部 + 尾巴摆动 | 每帧（用插值 alpha） |
| 5. Effects | 粒子、震屏、流星拖尾、环境粒子 | 每帧 |

### 7.1 蛇身绘制细节

- 每节 14px 圆角 pill，snakeBodyStart 到 snakeBodyEnd 头尾渐变
- 头部独立绘制：圆头 + 双圆眼（每 3-5s 眨眼一次）+ 三角耳 + 帽子（按主题切换 sprite）
- 转弯处用三次贝塞尔曲线连接相邻两节，避免硬拐角
- 尾巴正弦摆动：offsetY = sin(t * 2 + i * 0.5) * 1.5
- 死亡动画：身体逐节爆开为水果粒子向四周飞散，头部留在原地下沉

### 7.2 食物绘制细节

- 每种食物对应 public/sprites/ 下的 SVG/PNG，canvas 用 drawImage 叠加
- 漂浮动画：y += sin(t * 1.5) * 2
- 高光：右上 30 度椭圆白色 alpha 0.4
- 流星：从屏幕外抛物线落下 0.5s 进入棋盘，拖尾用 lineGradient 渐变
- 金苹果：金色边缘 + 旋转光晕（缓慢旋转的放射状渐变）
- 化石：低饱和度 + 微微浮土特效

### 7.3 性能预算

- 22x22 棋盘 = 484 格，每格按需更新
- 蛇平均长度小于 30 节，单层绘制对象小于 100
- Sprite 全部预加载到 ImageBitmap 缓存，避免运行时解码
- 目标：桌面 60fps；中端手机（iPhone 12 / 骁龙 765）至少 50fps

---

## 8. 5 个岛屿数据

### 8.1 岛屿配置总览

| 岛 | 解锁条件 | 草地双色 | 装饰 | 食物概率 | 环境特效 |
|---|---|---|---|---|---|
| **春樱岛** | 默认 | #e8f4d6 / #dcecc4 嫩绿 | 樱花树、粉花丛 | apple 40 / cherry 35 / peach 20 / meteor 5 | 飘落樱花瓣 |
| **夏海岛** | 累计 200 分 | #d4ecf2 / #c0e0e8 海青 | 椰子树、贝壳、沙地 | coconut 35 / watermelon 30 / orange 25 / meteor 5 / golden 5 | 海浪声 + 鸥鸣 SFX |
| **秋枫岛** | 累计 600 分 | #f4e4c4 / #ecd4a4 麦黄 | 枫树、稻草、南瓜 | persimmon 35 / chestnut 30 / pear 25 / fossil 5 / meteor 5 | 飘落枫叶 |
| **冬雪岛** | 累计 1200 分 | #eef2f6 / #dde4ec 雪白 | 雪人、松树、冰晶 | apple 30 / fossil 20 / meteor 10 / golden 10 / 通用 30 | 飘雪 + 蛇身留足印 |
| **化石岛** | 集齐 5 件化石 | #d4c4a8 / #b8a888 沙土 | 化石坑、考古标记 | fossil 50 / meteor 25 / golden 25 | 沙尘环境粒子 |

### 8.2 化石系统

5 种化石：trilobite（三叶虫）、dino（恐龙脚印）、ammonite（菊石）、shell（贝壳化石）、amber（琥珀）。

- 每岛随机出现化石（按 fruitWeights 中的 fossil 总权重，再均分到 5 种）
- 每种化石只需拾到一次即录入图鉴，重复拾取仅得分
- 集齐 5 种 → 解锁化石岛 + 触发 paleontologist 成就 + 解锁同名称号

### 8.3 称号系统（10 个）

| Title | 解锁条件 |
|---|---|
| rookie 新手 | 完成首局游戏 |
| gourmet 美食家 | 单局连吃 10 个不撞墙 |
| long_dragon 长龙 | 单局长度 ≥ 50 |
| meteor_hunter 流星猎人 | 累计吃 10 颗流星 |
| paleontologist 化石学家 | 集齐 5 种化石 |
| spring_visitor 春之访客 | 在春樱岛单局得分 ≥ 100 |
| summer_visitor 夏之访客 | 在夏海岛单局得分 ≥ 150 |
| autumn_visitor 秋之访客 | 在秋枫岛单局得分 ≥ 200 |
| winter_visitor 冬之访客 | 在冬雪岛单局得分 ≥ 250 |
| traveler 旅者 | 解锁全部 5 岛 |

### 8.4 成就系统（10 个）

成就 ID 与上方称号 ID 一一对应（除 rookie 替换为 daily_warrior）。每个成就解锁时：

- 全屏闪光 0.4s
- 顶部弹出 Tooltip island 形态浮窗，显示 "成就解锁：xxx"
- 解锁同名称号（部分成就）
- progress.achievements 写入 + 持久化

### 8.5 每日挑战机制

- **种子**：seed = parseInt(YYYYMMDD)，全球玩家每天同一张地图
- **岛屿**：seed % 5 决定当日岛屿
- **障碍**：obstacleDensity = 0.03，约 14 个障碍随机分布在棋盘上（不在初始蛇身周围 3 格内）
- **难度**：固定 normal（慢跑）
- **历史记录**：dailyHistory 保留最近 30 天
- **连续天数**：consecutiveDailyDays，连续 7 天解锁 daily_warrior 成就
- **分享图**：结算页用 html2canvas 把 DailyShareCard 组件导出为 PNG

---

## 9. UI 与界面流转

```
[启动] -> HomeView
           |
   +-------+--------+----------+
   v       v        v          v
[自由]  [挑战]   [图鉴]     [设置]
   |       |        |
   v       v        +-> DexView (水果/化石/称号 三 Tab)
[选岛]  [今日挑战]
   |       |           SettingsView
   +--+----+            (音量/难度/控制方式/导出存档)
      v
   GameView
   |
   +- GameCanvas（Canvas 5 层）
   +- GameHUD（顶部分数飘带 + 长度 + 当前岛 + 暂停）
   +- DPad / SwipeArea（移动端，桌面端隐藏）
   +- PauseModal（按 ESC / P / 暂停按钮）
   +- GameOverModal（死亡时）
       +- 自由模式：基础结算
       +- 每日模式：DailyShareCard + 导出按钮
```

### 9.1 HomeView（主菜单）

使用 animal-island-vue 的：

- **Title**：飘带横幅 "动森贪吃蛇"，accent 色 = 当前选中岛屿主色
- **IslandPicker**（自定义，基于 Card pattern）：横向滚动 5 张 Card，未解锁灰色 + 锁图标 + 解锁条件提示
- **ModeSwitcher**（自定义）：两个大按钮 "自由散步" / "今日挑战"
- **Button**：图鉴 / 设置 / 关于
- **Footer**：sea / tree 装饰（按当前选中岛切换）
- **Time**：右上显示岛上时间（取本地时间）

### 9.2 GameView（游戏主场景）

布局（桌面端）：

```
+------------------------------------------------+
| [HUD]  分数飘带   长度 XX   春樱岛   [暂停按钮] |
+------------------------------------------------+
|                                                |
|                                                |
|             [Canvas 22x22 棋盘]                |
|                                                |
|                                                |
+------------------------------------------------+
```

布局（移动端竖屏）：

```
+--------------------+
| [HUD]              |
+--------------------+
|                    |
|   [Canvas 棋盘]    |
|                    |
+--------------------+
|     [DPad]         |
+--------------------+
```

### 9.3 GameOverModal 内容

- 当前岛屿插画（来自 sprites/decorations/）
- 本局分数（大字 48px）+ 历史最高（小字 14px）
- 长度、连击数、新解锁内容（化石 / 称号高亮显示）
- 按钮：再来一局 / 切换岛屿 / 返回主菜单
- **每日模式额外**：DailyShareCard（420x560，可导出 PNG）+ "保存图片" 按钮

### 9.4 DexView（图鉴）

- 顶部 Tabs：水果 / 化石 / 称号
- 内容区：DexCard 网格，未解锁灰色 + 问号
- 顶部右侧按钮：导出 JSON / 导入 JSON
- 底部统计：已解锁 X / 总数 Y

### 9.5 SettingsView

- BGM 音量 Slider（0-100，默认 50）
- SFX 音量 Slider（0-100，默认 70）
- 难度 Radio：闲庭 / 慢跑 / 狂奔
- 控制方式 Checkbox：键盘（默认开）/ 触屏 DPad（移动端默认开）/ 滑动手势
- 危险区：清空存档按钮（带 Modal 二次确认）

---

## 10. 输入控制

### 10.1 桌面端

| 键 | 动作 |
|---|---|
| W / ArrowUp | 向上 |
| S / ArrowDown | 向下 |
| A / ArrowLeft | 向左 |
| D / ArrowRight | 向右 |
| Space / P | 暂停切换 |
| ESC | 暂停（不切换，仅打开） |
| R | 死亡后重开（GameOverModal 打开时生效） |

### 10.2 移动端

- **DPad**：屏幕下方 1/3 区域，半透明（opacity 0.5），按下 0.9
- **滑动手势**：DPad 区域之外，任意方向滑动 ≥ 30px 触发
- 横竖屏：监听 orientationchange，重新布局；横屏时 DPad 移到右下角

### 10.3 反穿身保护规则

```ts
function tryQueueDirection(input: Dir) {
  if (isOpposite(input, snake.direction)) return; // 忽略反向
  snake.pendingDirection = input;                 // 后来覆盖前者也无所谓
}
function applyPendingDirection() {                // tick 开始时调用
  if (!isOpposite(snake.pendingDirection, snake.direction)) {
    snake.direction = snake.pendingDirection;
  }
}
```

**核心保证**：无论一帧内按多少次键，下一 tick 最多执行一次方向变更，且永不反向。

---

## 11. 测试策略

| 层 | 工具 | 覆盖范围 |
|---|---|---|
| 游戏内核 | Vitest 单测 | Snake 移动/碰撞/生长、Board 食物生成、Rng 种子复现、Mode 规则 |
| 渲染 | 不写自动化测试 | 视觉调整靠眼睛 + 截图比对 |
| Vue 组件 | Vitest + @vue/test-utils | HomeView 解锁逻辑、Settings 持久化、HUD 显示 |
| E2E | 不做 | 范围内不必要 |

### 11.1 必须在阶段 1 完成的单测清单

**Snake.test.ts**：

- 初始 3 节蛇朝右，正确移动一格
- 转向后下一 tick 朝新方向
- pendingDirection 被反向键覆盖时被忽略
- 一帧内连续按 ↑→ 不会撞身
- 撞墙触发 alive = false
- 撞自己触发 alive = false
- growthQueue > 0 时尾巴不删，长度 +1
- invincible 期间撞身不死

**Board.test.ts**：

- 食物总是生成在空格上
- 蛇填满棋盘时不生成新食物（不死循环）
- 种子相同时生成位置序列相同

**Food.test.ts**：

- fruitWeights 总和归一化后概率正确
- meteor 在 spawnedAt + 10000 后被标记过期
- 化石不过期

**Rng.test.ts**：

- 相同种子产生相同序列（mulberry32 固定算法）
- 不同种子产生不同序列

**FreeMode.test.ts**：

- shouldSpawnObstacles = false
- 死亡时累计分数 +本局
- 累计分数到达阈值解锁岛屿

**DailyMode.test.ts**：

- seed 由日期生成，同日跑两次结果相同
- 障碍生成不与初始蛇身周围 3 格重叠
- dailyHistory 按日期去重，仅保留每日最高分

### 11.2 Vue 组件测试（阶段 2-3）

- HomeView：未解锁岛屿被点击不进入 Game，显示提示
- IslandPicker：解锁状态变化时 UI 更新
- DexView：导出 JSON 内容正确、导入后恢复 progress
- SettingsView：滑块改变 BGM 音量时 AudioManager 收到通知

---

## 12. 分阶段交付计划

> 每个阶段都是**完整可玩**版本，不是 demo 半成品。每阶段结束 commit + tag。

### 阶段 1 · 核心引擎可玩（约 3-4 工作日）

**目标**：键盘能玩、能吃、能死、能重开。视觉先用纯色色块。

任务：

- [ ] Vite + Vue 3 + TS + Pinia + Router + ESLint + Prettier 骨架
- [ ] 安装并配置 animal-island-vue
- [ ] 实现 src/game/core/ 全部模块
- [ ] 单测覆盖 Snake / Board / Food / Rng / FreeMode / DailyMode
- [ ] Renderer v1：纯色矩形蛇 + 苹果（验证 5 层 Canvas 架构）
- [ ] GameView + GameCanvas + GameHUD（基础）
- [ ] 死亡 → GameOverModal → 重开
- [ ] HomeView 极简版（一个开始按钮直接进春樱岛）

**验收**：能连续畅玩 5 分钟无 bug；单测通过。

### 阶段 2 · 动森视觉化（约 4-5 工作日）

**目标**：截图能让人认出动森风。

任务：

- [ ] 5 层 Canvas 渲染分离 + OffscreenCanvas
- [ ] 主题系统接入（春樱主题 token 完整）
- [ ] 蛇身完整版：渐变 + 头眼耳帽 + 尾巴摆动 + 转弯弧度 + 死亡动画
- [ ] 食物完整版：接入 6 种水果 SVG（你提供）+ 浮动 + 高光
- [ ] 粒子系统：吃食物星星 + 震屏 + 解锁闪光
- [ ] HomeView 完整：飘带标题 + IslandPicker（5 张但只解锁春樱）+ Footer
- [ ] SettingsView 完整：音量 / 难度 / 键位
- [ ] 渲染 alpha 插值正确

**验收**：视觉风格统一、动效细腻、Lighthouse Performance ≥ 80。

### 阶段 3 · 关卡与玩法深度（约 5-6 工作日）

**目标**：5 个岛屿 + 自由/挑战双模式 + 元系统打通。

任务：

- [ ] 5 个岛屿数据 + 5 套主题 token + 解锁逻辑
- [ ] 食物概率表（每岛独立）+ 流星 / 金苹果 / 化石生成
- [ ] DailyMode 完整：日期种子 + 障碍生成 + 历史记录
- [ ] DailyShareCard 组件 + html2canvas 导出
- [ ] DexView 完整：水果 / 化石 / 称号 三 Tab + 导出导入
- [ ] 成就系统：10 个成就 + 解锁动画 + 称号联动
- [ ] localStorage 存档（progress + settings）
- [ ] 5 个岛屿装饰物 SVG 接入（你提供）+ 环境粒子（樱花/枫叶/雪）
- [ ] 5 顶帽子 sprite 切换

**验收**：5 个岛屿手感都打磨过、图鉴成就跑通、每日挑战分享图美观。

### 阶段 4 · 移动端 + 音频 + 打磨（约 3-4 工作日）

**目标**：手机能玩、有声音、整体打磨。

任务：

- [ ] DPad 组件 + SwipeArea 滑动手势
- [ ] 响应式布局（桌面 / 平板 / 手机竖屏）
- [ ] 失焦 / 页面隐藏自动暂停
- [ ] AudioManager 接入：1 BGM 循环 + 8 SFX
- [ ] 视觉/动效全面 review 与微调
- [ ] 性能 profile：中端手机确保 ≥ 50fps
- [ ] 加载页 + sprite 预加载进度条
- [ ] PWA manifest（不强制 SW，仅图标和主题色）

**验收**：iPhone / Android 浏览器流畅可玩；BGM 不卡顿；首屏加载 < 3s。

### 阶段 5 · 可选扩展（按需，不在主线）

- PWA 离线
- 录像回放（记录 seed + 输入序列）
- 长按加速模式
- 双人本地对战
- 主题编辑器
- 冬雪雪地脚印（5 秒淡出）
- 化石岛专属沙尘暴事件

**总周期估计**：阶段 1-4 共约 **15-19 个工作日**。每阶段结束都有可玩交付物，可中途暂停。

---

## 13. 风险与应对

| 风险 | 影响 | 应对 |
|---|---|---|
| AI 出图风格不统一 | 视觉割裂 | 阶段 1-2 先用纯代码占位，你出图后逐个替换；提示词包统一 base style + negative prompt |
| 移动端性能 | 中端手机可能掉帧 | 阶段 4 强制 profile；OffscreenCanvas 分层 + ImageBitmap 预加载已是优化方案；必要时降级到单 Canvas |
| 5 岛打磨投入超工期 | 阶段 3 延期 | 优先保证春樱、夏海、秋枫；冬雪和化石岛的"打磨增量"可放在阶段 3 末尾或阶段 5 前段 |
| 音频版权 | 选错素材有侵权风险 | 仅使用 CC0 / Pixabay License 资源；提交清单时附许可证链接给你确认 |
| Howler.js 体积 | 增加约 25KB gzipped | 可接受（首屏总目标 < 1MB） |
| html2canvas 在某些浏览器渲染异常 | 分享图失败 | 阶段 3 在主流浏览器测试；失败时降级到截图提示用户手动截屏 |
| localStorage 配额溢出 | 老数据丢失 | dailyHistory 限制 30 天 + 容量监控告警；版本字段支持迁移 |

---

## 14. 待确认细节（已锁定，列于此处便于回溯）

- **棋盘大小**：22 × 22
- **自由模式排行榜**：不做（仅本地最高分）
- **每日挑战分享**：通过 html2canvas 导出 PNG

---

## 15. 素材清单（你的待办）

### 15.1 图形素材规格（统一要求）

- **格式**：SVG 优先，PNG 透明背景 (256x256 或 512x512) 兜底
- **画布**：正方形，主体居中占 70-80%，四周留白
- **风格**：扁平 + 厚描边（2-3px 深棕 #794f27）+ 局部高光，**禁止**写实/像素风/3D 渲染感
- **主色板限定**（仅作物体本身的颜色，背景永远透明）：
  - 薄荷青 #19c8b9
  - 暖棕 #794f27 / #a87749
  - 奶油 #f8f8f0
  - 苹果红 #e63946
  - 樱花粉 #ffb6c1
  - 叶绿 #6fba2c
- **命名**：英文小写 + 下划线，如 apple.svg、fossil_trilobite.svg
- **存放**：public/sprites/{fruits|fossils|decorations|hats}/

### 15.2 完整素材清单（共 23 项）

#### A. 水果类（6 项，阶段 2 必需）

| # | 文件名 | 描述 | 用途 |
|---|---|---|---|
| 1 | apple.svg | 红苹果，单片绿叶 | 春樱/冬雪通用 |
| 2 | cherry.svg | 双颗樱桃，连蒂 | 春樱主推 |
| 3 | peach.svg | 粉桃，单片叶 | 春樱主推 |
| 4 | pear.svg | 黄绿梨，葫芦形 | 秋枫主推 |
| 5 | orange.svg | 橙色橘子，顶部凹陷 | 夏海主推 |
| 6 | coconut.svg | 棕褐椰子，三个黑点 | 夏海主推 |

#### B. 特殊食物（3 项，阶段 3 必需）

| # | 文件名 | 描述 | 用途 |
|---|---|---|---|
| 7 | watermelon.svg | 切开的西瓜片，带籽 | 夏海主推 |
| 8 | golden_apple.svg | 金色苹果 + 光晕环 | 全岛稀有 |
| 9 | meteor.svg | 蓝紫流星，无拖尾静态版 | 全岛限时 |

#### C. 化石（5 项，阶段 3 必需）

| # | 文件名 | 描述 | 用途 |
|---|---|---|---|
| 10 | fossil_trilobite.svg | 三叶虫剪影，米黄底 | 化石岛 + 全岛 |
| 11 | fossil_dino.svg | 恐龙脚印，三趾 | 化石岛 + 全岛 |
| 12 | fossil_ammonite.svg | 菊石螺旋纹 | 化石岛 + 全岛 |
| 13 | fossil_shell.svg | 扇贝化石 | 化石岛 + 全岛 |
| 14 | fossil_amber.svg | 琥珀，内含小昆虫 | 化石岛 + 全岛 |

#### D. 装饰物（5 项，阶段 2-3）

| # | 文件名 | 描述 | 用途 |
|---|---|---|---|
| 15 | cherry_tree.svg | 樱花树（粉花满枝） | 春樱岛装饰 |
| 16 | coconut_tree.svg | 椰子树（细高斜杆 + 椰果） | 夏海岛装饰 |
| 17 | maple_tree.svg | 枫树（红黄叶） | 秋枫岛装饰 |
| 18 | pine_tree.svg | 松树（雪覆盖三角形） | 冬雪岛装饰 |
| 19 | fossil_pit.svg | 化石坑（圆形挖坑 + 标记杆） | 化石岛装饰 |

#### E. 蛇头帽子（4 项，阶段 2-3）

| # | 文件名 | 描述 | 用途 |
|---|---|---|---|
| 20 | hat_cherry_blossom.svg | 樱花瓣冠，5 瓣 | 春樱岛 + 化石岛复用 |
| 21 | hat_shell.svg | 贝壳头饰 | 夏海岛 |
| 22 | hat_maple_leaf.svg | 枫叶头饰 | 秋枫岛 |
| 23 | hat_snow.svg | 雪团头饰，绒球 | 冬雪岛 |

### 15.3 音频素材（共 9 项，由 AI 助手筛选你拍板）

| # | 文件名 | 描述 | 触发时机 |
|---|---|---|---|
| 1 | bgm_main.ogg/mp3 | 主循环 BGM，温柔木琴/钢琴，2-3 分钟无缝循环 | 进入 Game 后循环播放 |
| 2 | sfx_eat.ogg | 吃水果音，清脆 pop | 吃普通水果 |
| 3 | sfx_eat_fossil.ogg | 吃化石音，铃声短 | 吃化石 |
| 4 | sfx_eat_meteor.ogg | 吃流星音，叮咚拉长 | 吃流星 |
| 5 | sfx_die.ogg | 死亡音，下沉短和弦 | 撞墙 / 撞身 |
| 6 | sfx_unlock.ogg | 解锁音，上扬铃响 | 解锁岛 / 成就 / 称号 |
| 7 | sfx_page.ogg | 翻页音，纸张轻响 | 切换菜单 / Modal 开关 |
| 8 | sfx_pause.ogg | 暂停音，闷响 | 暂停 / 恢复 |
| 9 | sfx_meteor_spawn.ogg | 流星出现音，呼啸短促 | 流星生成时 |

**采购渠道**：

- freesound.org（CC0 优先）
- Pixabay Sounds（Pixabay License）
- OpenGameArt.org（CC0 / CC-BY）

执行流程：阶段 4 开始时，AI 助手会列出候选清单（每个 SFX 给 2-3 个候选链接 + 时长 + 许可证），你听过后挑一个。

---

## 16. AI 出图提示词包

### 16.1 通用规则

所有提示词使用以下 base style 与 negative prompt 作为前缀/后缀，确保风格统一。

**Base style（每个 prompt 末尾追加）**：

```
flat design illustration, cute and cozy mobile game asset,
in the style of Animal Crossing New Horizons,
solid 2-3px dark brown outline (#794f27),
single soft white highlight on upper-right,
no shading complexity, no gradient background,
centered subject, transparent background,
512x512 vector style, warm friendly mood, soft rounded shapes
```

**Negative prompt（所有图通用）**：

```
realistic, photorealistic, 3d render, photo, pixel art,
dark mood, glossy, complex shading, multiple highlights,
gradient background, sky, ground, scenery,
text, watermark, signature, logo, frame, border,
multiple objects, scattered elements
```

**推荐工具与参数**：

- **Midjourney**：v6 或更新，--ar 1:1 --style raw --s 50（降低风格化避免油腻）
- **DALL-E 3**：直接用下方 prompt
- **Stable Diffusion**：建议用 SDXL + animecore/flat illustration LoRA，guidance 7-8，steps 30
- **生成后**：必须在 Photoshop / GIMP 中扣干净背景，导出 PNG 透明 + 用 vectormagic 或 SVG-edit 转 SVG（可选）

### 16.2 水果类提示词（6 项）

#### apple.svg

```
A cute red apple with a single small green leaf on top,
glossy red body with simple round shape, 
flat design illustration, cute and cozy mobile game asset,
in the style of Animal Crossing New Horizons,
solid 2-3px dark brown outline (#794f27),
single soft white highlight on upper-right,
no shading complexity, no gradient background,
centered subject, transparent background,
512x512 vector style, warm friendly mood, soft rounded shapes
```

#### cherry.svg

```
Two cute red cherries connected by green stems forming a Y shape,
each cherry round with single white highlight,
[base style ...]
```

#### peach.svg

```
A cute pink peach with a small green leaf, 
soft round body with subtle vertical groove down the middle,
[base style ...]
```

#### pear.svg

```
A cute yellow-green pear with classic gourd shape, 
single small leaf on top, soft round bottom,
[base style ...]
```

#### orange.svg

```
A cute orange citrus fruit, perfectly round, 
small dimple on top with a single tiny green leaf,
[base style ...]
```

#### coconut.svg

```
A cute brown coconut, round and fuzzy,
three small dark dots arranged in a triangle on the front (the coconut eyes),
[base style ...]
```

### 16.3 特殊食物提示词（3 项）

#### watermelon.svg

```
A cute slice of watermelon, triangular shape,
red flesh with several small black seeds, thin green rind,
[base style ...]
```

#### golden_apple.svg

```
A cute golden apple with shiny gold body and a green leaf,
small sparkle stars (4-pointed) around it suggesting a glowing aura,
metallic gold color (#ffd700), but flat illustration not 3d,
[base style ...]
```

#### meteor.svg

```
A cute small meteor or shooting star, round rocky body in deep blue-purple,
small crater dots on surface, soft glow halo around it,
no tail (the tail is rendered separately in code),
colors: deep purple #5b3aa5 with cyan highlights,
[base style ...]
```

### 16.4 化石提示词（5 项）

化石统一基底色：米黄 #d4c4a8，剪影色：深棕 #794f27。

#### fossil_trilobite.svg

```
A cute fossil of a trilobite, oval segmented shell silhouette,
embedded in a beige circular stone disc background,
silhouette in dark brown #794f27, stone disc in #d4c4a8 to #b8a888 flat color,
[base style ...]
```

#### fossil_dino.svg

```
A cute dinosaur footprint fossil, three-toed bird-like print silhouette,
embedded in a beige circular stone disc,
silhouette in dark brown, stone disc in flat beige #d4c4a8,
[base style ...]
```

#### fossil_ammonite.svg

```
A cute ammonite fossil, classic spiral shell shape with internal chambers,
embedded in a beige circular stone disc,
silhouette in dark brown, stone disc in flat beige #d4c4a8,
[base style ...]
```

#### fossil_shell.svg

```
A cute scallop shell fossil, fan-shaped with radial ridges,
embedded in a beige circular stone disc,
silhouette in dark brown, stone disc in flat beige,
[base style ...]
```

#### fossil_amber.svg

```
A cute amber fossil, irregular blob of translucent honey-orange resin,
with a tiny dark insect silhouette trapped inside,
amber body in #f4a460 flat with single highlight,
[base style ...]
```

### 16.5 装饰物提示词（5 项）

装饰物画布略大（推荐 768x768），主体可不居中（用于场景边缘）。

#### cherry_tree.svg

```
A cute small cherry blossom tree, full pink blooms covering the canopy,
short brown trunk, isometric front-facing view, no ground or shadow,
canopy color: soft pink #ffc1d8 with #ff9eb8 accents,
trunk: warm brown #794f27,
flat design illustration, Animal Crossing style,
solid 2-3px dark brown outline, transparent background,
no realism, no 3d, single white highlight on canopy
```

#### coconut_tree.svg

```
A cute coconut palm tree, slender curved trunk leaning slightly,
five long curved palm leaves spreading from the top,
2-3 brown coconuts clustered under the leaves,
trunk: warm tan #c8a878, leaves: leaf green #6fba2c,
[base style adapted]
```

#### maple_tree.svg

```
A cute small maple tree in autumn, canopy filled with red and yellow leaves,
short brown trunk, isometric front-facing view,
canopy: mix of red #d94b3a and yellow-orange #f4a020,
trunk: warm brown #794f27,
[base style adapted]
```

#### pine_tree.svg

```
A cute snow-covered pine tree, three triangular green tiers stacking up,
soft white snow caps on each tier, narrow brown trunk at base,
green color: pine green #2d5a3d, snow: cream #f8f8f0,
[base style adapted]
```

#### fossil_pit.svg

```
A cute archaeological dig site, circular sandy pit with darker brown rim,
small wooden marker stake with white flag on the rim,
view from slight top-down angle, no ground around it,
pit colors: sand #d4c4a8 to #a89060, marker: brown wood,
[base style adapted]
```

### 16.6 蛇头帽子提示词（4 项）

帽子尺寸推荐 256x256，因为会贴在蛇头上较小。

#### hat_cherry_blossom.svg

```
A cute tiny crown made of 5 cherry blossom petals arranged in a circle,
each petal soft pink #ffb6c1 with white center, tiny yellow stamen dots,
top-down view, no head underneath, transparent background,
[base style adapted, 256x256]
```

#### hat_shell.svg

```
A cute tiny pink scallop shell hat, fan shape with radial ridges,
worn on top so we see it from front-three-quarter angle,
soft pink #ffc8b8 with white highlight, no head underneath,
[base style adapted, 256x256]
```

#### hat_maple_leaf.svg

```
A cute tiny red maple leaf hat, classic 5-point maple shape,
red-orange color #d94b3a with darker veins,
front-three-quarter angle, no head underneath,
[base style adapted, 256x256]
```

#### hat_snow.svg

```
A cute tiny white pompom snow hat, small round cream-colored fluffy ball,
with subtle blue-white highlights, slight droop on top,
no head underneath, transparent background,
[base style adapted, 256x256]
```

### 16.7 出图工作流建议

1. **批量先出 6 个水果**（最多用），统一风格作为基准
2. **挑出最满意的 2-3 张**，把它们的视觉特征写进后续 prompt（"in the same style as my reference apple"）
3. **每张图至少出 4 张候选**，用 Midjourney 的 V/U 操作放大优选
4. **统一后处理**：
   - Photoshop 自动选择 → 反选 → 删除背景
   - 用 Image Trace（Illustrator）或 vectormagic.com 转 SVG
   - 检查描边宽度是否一致（不一致就用 Stroke 重画）
5. **风格不一致时回炉**：宁可重出，也不要用风格割裂的图

---

## 17. 文档结束语

### 17.1 你的待办（按时间顺序）

| 时机 | 你需要做的 |
|---|---|
| 阶段 1 之前 | 审查并批准本规格文档 |
| 阶段 2 开始时 | 提供 6 个水果 SVG（apple/cherry/peach/pear/orange/coconut） |
| 阶段 2 中段 | 提供 1 个装饰（cherry_tree）+ 1 顶帽子（hat_cherry_blossom） |
| 阶段 3 开始时 | 提供其余 3 项特殊食物（watermelon/golden_apple/meteor）+ 5 项化石 |
| 阶段 3 中段 | 提供其余 4 项装饰（coconut/maple/pine_tree, fossil_pit）+ 3 顶帽子 |
| 阶段 4 开始时 | 听 AI 助手筛选的 BGM + 8 SFX 候选，每项挑一个 |

### 17.2 AI 助手的待办

完整由助手承担，不需要你介入：

- 项目脚手架与配置
- src/game/ 全部内核代码与单测
- src/ 下 Vue 组件与样式
- 在你提供素材前用纯代码占位（确保流程不被卡住）
- 阶段间 commit + tag
- 阶段验收时附演示 GIF / 截图

### 17.3 后续

本规格批准后，下一步执行 writing-plans 技能产出实现计划，将阶段 1 拆解为可独立执行的任务卡。

---

**文档结束**
