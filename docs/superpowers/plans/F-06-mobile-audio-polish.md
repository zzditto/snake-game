# 阶段 4 · 移动端 + 音频 + 打磨 实现计划

> **面向 AI 代理的工作者：** 使用 superpowers:subagent-driven-development 或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法跟踪进度。

**目标：** 手机流畅可玩、有声效背景音乐、交互细节打磨到位——包括移动端 DPad/滑动手势、响应式布局、失焦暂停、Howler.js 音频系统、PauseModal、加载页、PWA manifest。

**架构：** `src/game/audio/AudioManager.ts` 为 Howler.js 封装（纯 TS，不依赖 Vue）；Vue 层新增移动端控件（DPad/SwipeArea/加载页）；InputController 扩展触屏事件；GameLoop 添加 visibility 监听。

**技术栈：** Howler.js（新增） / TypeScript / Vue 3.4+ / Pinia / Less / Vite PWA Plugin（新增）

**前置条件：** 阶段 1-3 全部完成，游戏核心玩法、视觉、元系统均已打通。

**关联规格：** `docs/superpowers/specs/2026-06-18-snake-game-design.md` §9-10, §15.3

**验收标准：**
- iPhone / Android 浏览器流畅可玩，中端手机 ≥ 50fps
- BGM 循环播放不卡顿，8 种 SFX 正确触发
- 移动端 DPad + 滑动手势正常工作
- 页面失焦/切换标签页时自动暂停
- 暂停弹窗可用（含继续/返回主菜单）
- 响应式布局在桌面/平板/手机竖屏/手机横屏均正常
- 首屏加载有动画，< 3s
- PWA manifest 可安装到主屏幕
- 所有测试通过，typecheck + lint 零错误

---

## 文件结构

### 创建的文件

- `src/game/audio/AudioManager.ts` — Howler.js 封装（BGM 循环 + SFX 池化）
- `src/components/DPad.vue` — 移动端方向键（上下左右 + 暂停）
- `src/components/SwipeArea.vue` — 滑动手势检测区域
- `src/components/PauseModal.vue` — 暂停弹窗（继续 / 返回主菜单）
- `src/components/LoadingScreen.vue` — 启动加载页 + sprite 预加载进度条
- `public/manifest.json` — PWA manifest
- `public/icons/icon-192.png` — PWA 图标（代码生成占位）
- `public/icons/icon-512.png` — PWA 图标（代码生成占位）

### 修改的文件

- `src/game/core/GameLoop.ts` — 添加失焦/visibility 自动暂停
- `src/game/core/InputController.ts` — 扩展触屏/滑动事件支持
- `src/game/GameSession.ts` — 通过 EventBus 暴露 SFX 事件（eat/fossil/meteor/die/pause 等）
- `src/stores/settings.ts` — 扩展 bgmVolume/sfxVolume 字段
- `src/views/SettingsView.vue` — 接入 store 持久化音量
- `src/views/GameView.vue` — 集成 DPad + SwipeArea + PauseModal + AudioManager + LoadingScreen
- `src/components/GameCanvas.vue` — 传递 InputController 触屏事件
- `src/components/GameHUD.vue` — 暂停按钮改为打开 PauseModal
- `src/views/HomeView.vue` — 响应式微调
- `index.html` — 添加 PWA manifest 链接 + theme-color meta
- `vite.config.ts` — 添加 VitePWA 插件
- `package.json` — 新增 howler.js、@types/howler、vite-plugin-pwa

---

## 任务 39：Howler.js 安装 + AudioManager 创建

**文件：**

- 修改：`package.json`（pnpm add howler.js @types/howler）
- 创建：`src/game/audio/AudioManager.ts`

**职责：** 封装 Howler.js 提供 `playBgm()`、`playSfx()`、`setBgmVolume()`、`setSfxVolume()` 等接口。BGM 自动循环，SFX 池化防止重叠。音频文件不存在时静默降级（不报错）。

- [ ] **步骤 39.1：安装依赖**

```bash
pnpm add howler @types/howler
```

- [ ] **步骤 39.2：创建 `src/game/audio/AudioManager.ts`**

```typescript
import { Howl, Howler } from 'howler';

type SfxKind =
  | 'eat' | 'eat_fossil' | 'eat_meteor'
  | 'die' | 'unlock' | 'pause'
  | 'page' | 'meteor_spawn';

interface SfxDef {
  key: SfxKind;
  src: string;
  volume?: number;
}

const SFX_LIST: SfxDef[] = [
  { key: 'eat',           src: 'audio/sfx_eat.ogg',           volume: 0.6 },
  { key: 'eat_fossil',    src: 'audio/sfx_eat_fossil.ogg',    volume: 0.7 },
  { key: 'eat_meteor',    src: 'audio/sfx_eat_meteor.ogg',    volume: 0.7 },
  { key: 'die',           src: 'audio/sfx_die.ogg',           volume: 0.8 },
  { key: 'unlock',        src: 'audio/sfx_unlock.ogg',        volume: 0.8 },
  { key: 'pause',         src: 'audio/sfx_pause.ogg',         volume: 0.5 },
  { key: 'page',          src: 'audio/sfx_page.ogg',          volume: 0.4 },
  { key: 'meteor_spawn',  src: 'audio/sfx_meteor_spawn.ogg',  volume: 0.5 },
];

export class AudioManager {
  private bgm: Howl | null = null;
  private sfxMap = new Map<SfxKind, Howl>();
  private bgmVolume = 0.5;
  private sfxVolume = 0.7;
  private bgmLoaded = false;
  private sfxLoadedCount = 0;
  private sfxTotalCount = 0;

  constructor() {
    this.sfxTotalCount = SFX_LIST.length;
  }

  /** 加载 BGM（延迟加载，避免阻塞） */
  loadBgm(src: string = 'audio/bgm_main.ogg'): void {
    this.bgm = new Howl({
      src: [src],
      loop: true,
      volume: this.bgmVolume,
      html5: true,        // 使用 HTML5 Audio 流式播放
      onload: () => { this.bgmLoaded = true; },
      onloaderror: () => { /* 静默降级 */ },
    });
  }

  /** 预加载所有 SFX */
  loadAllSfx(): void {
    for (const def of SFX_LIST) {
      const howl = new Howl({
        src: [def.src],
        volume: def.volume ?? this.sfxVolume,
        html5: false,
        onload: () => { this.sfxLoadedCount++; },
        onloaderror: () => { /* 静默降级 */ },
      });
      this.sfxMap.set(def.key, howl);
    }
  }

  /** 获取加载进度 0~1 */
  getLoadProgress(): number {
    const bgmWeight = 0.3;
    const sfxWeight = 0.7;
    const bgmProgress = this.bgmLoaded ? 1 : 0;
    const sfxProgress = this.sfxTotalCount > 0
      ? this.sfxLoadedCount / this.sfxTotalCount
      : 1;
    return bgmProgress * bgmWeight + sfxProgress * sfxWeight;
  }

  /** 播放/恢复 BGM */
  playBgm(): void {
    if (!this.bgm) return;
    if (!this.bgm.playing()) this.bgm.play();
  }

  /** 暂停 BGM */
  pauseBgm(): void {
    this.bgm?.pause();
  }

  /** 停止 BGM */
  stopBgm(): void {
    this.bgm?.stop();
    this.bgmLoaded = false;
  }

  /** 设置 BGM 音量 0~1 */
  setBgmVolume(v: number): void {
    this.bgmVolume = v;
    this.bgm?.volume(v);
  }

  /** 设置 SFX 音量 0~1 */
  setSfxVolume(v: number): void {
    this.sfxVolume = v;
    for (const howl of this.sfxMap.values()) {
      howl.volume(v);
    }
  }

  /** 播放音效 */
  playSfx(key: SfxKind): void {
    const howl = this.sfxMap.get(key);
    if (!howl) return;
    // 池化：获取空闲实例或创建新实例
    const id = howl.play();
    if (id && howl.volume() !== this.sfxVolume * (SFX_LIST.find(s => s.key === key)?.volume ?? 1)) {
      howl.volume(this.sfxVolume * (SFX_LIST.find(s => s.key === key)?.volume ?? 1), id);
    }
  }

  /** 销毁所有音频资源 */
  destroy(): void {
    this.stopBgm();
    for (const howl of this.sfxMap.values()) {
      howl.unload();
    }
    this.sfxMap.clear();
    this.bgm = null;
  }

  get isBgmPlaying(): boolean {
    return this.bgm?.playing() ?? false;
  }
}
```

> **注意**：音频文件目前不存在，需用户提供后才有效果。AudioManager 设计为在文件缺失时静默降级。

- [ ] **步骤 39.3：运行 typecheck + test**

```bash
pnpm typecheck && pnpm test
```

- [ ] **步骤 39.4：Commit**

```bash
git add src/game/audio/AudioManager.ts package.json pnpm-lock.yaml
git commit -m "feat(audio): Howler.js 安装 + AudioManager 创建（BGM循环+SFX池化）"
```

---

## 任务 40：AudioManager 集成到 GameView

**文件：**

- 修改：`src/views/GameView.vue`
- 修改：`src/components/GameCanvas.vue`
- 修改：`src/game/GameSession.ts`（如有需要扩展 EventBus 事件）

**职责：** 在 GameView 挂载时创建 AudioManager、开始 BGM、在切换页面时销毁。GameCanvas 在游戏事件（eat/die/pause）发生时触发 SFX。

- [ ] **步骤 40.1：GameView 中集成 AudioManager**

在 `src/views/GameView.vue` 中：

```typescript
import { AudioManager } from '@/game/audio/AudioManager';
import { onMounted, onBeforeUnmount } from 'vue';

let audio: AudioManager | null = null;

onMounted(() => {
  audio = new AudioManager();
  audio.loadBgm();
  audio.loadAllSfx();
  audio.playBgm();
  const settings = useSettingsStore();
  if (settings.bgmVolume !== undefined) audio.setBgmVolume(settings.bgmVolume / 100);
  if (settings.sfxVolume !== undefined) audio.setSfxVolume(settings.sfxVolume / 100);
});

onBeforeUnmount(() => {
  audio?.destroy();
  audio = null;
});
```

- [ ] **步骤 40.2：GameCanvas 触发 SFX**

在 `src/components/GameCanvas.vue` 中，通过 EventBus 监听游戏事件并调用 AudioManager：

由于 `src/components/` 不是 `src/game/`（后者不能 import Vue），但 `GameCanvas.vue` 是 Vue 组件，可以直接使用 AudioManager。

```typescript
// 在 initGame() 中添加 SFX 订阅
session.bus.on('eat', (p) => {
  // 已有的 emit eat 逻辑...
  const sfxKey = FOSSIL_KINDS.includes(p.food.kind as FoodKind)
    ? 'eat_fossil' : p.food.kind === 'meteor' ? 'eat_meteor' : 'eat';
  // 触发 SFX...
});
session.bus.on('die', () => { /* sfx_die */ });
```

由于 AudioManager 实例由 GameView 持有，需要通过 emit 或 provide/inject 传递。推荐方案：GameView 通过 provide 提供 AudioManager 引用，GameCanvas 通过 inject 获取。

```typescript
// GameView.vue
import { provide } from 'vue';
provide('audio', audio);

// GameCanvas.vue
import { inject } from 'vue';
const audio = inject<AudioManager>('audio');
```

- [ ] **步骤 40.3：运行 typecheck + test**

```bash
pnpm typecheck && pnpm test
```

- [ ] **步骤 40.4：Commit**

```bash
git add src/views/GameView.vue src/components/GameCanvas.vue
git commit -m "feat(audio): AudioManager 集成到 GameView + SFX 事件触发"
```

---

## 任务 41：Settings 扩展 + 音量持久化

**文件：**

- 修改：`src/stores/settings.ts`
- 修改：`src/views/SettingsView.vue`

**职责：** settings store 新增 bgmVolume/sfxVolume 字段并持久化到 localStorage；SettingsView 滑块连接到 store。

- [ ] **步骤 41.1：扩展 `src/stores/settings.ts`**

```typescript
interface SettingsState {
  difficulty: DifficultyId;
  bgmVolume: number;      // 0-100
  sfxVolume: number;      // 0-100
  touchEnabled: boolean;  // 触屏 DPad 启用
}

function load(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SettingsState;
  } catch { /* ignore */ }
  return { difficulty: 'normal', bgmVolume: 50, sfxVolume: 70, touchEnabled: true };
}

// actions 新增：
setBgmVolume(v: number) { this.bgmVolume = v; save(this.$state); },
setSfxVolume(v: number) { this.sfxVolume = v; save(this.$state); },
```

- [ ] **步骤 41.2：更新 `src/views/SettingsView.vue`**

将局部 ref 替换为 settings store：

```typescript
import { useSettingsStore } from '@/stores/settings';
const settings = useSettingsStore();

// 模板中改为 v-model.number="settings.bgmVolume" 等
```

- [ ] **步骤 41.3：运行 typecheck + test**

```bash
pnpm typecheck && pnpm test
```

- [ ] **步骤 41.4：Commit**

```bash
git add src/stores/settings.ts src/views/SettingsView.vue
git commit -m "feat(store): settings 扩展音量字段 + SettingsView 持久化连接"
```

---

## 任务 42：DPad 组件

**文件：**

- 创建：`src/components/DPad.vue`

**职责：** 移动端方向键控件——上下左右四键 + 中间暂停键。只在触屏设备上显示（通过 media query 控制）。按下时调用 GameCanvas 上的方法改变方向。

- [ ] **步骤 42.1：创建 `src/components/DPad.vue`**

```vue
<template>
  <div class="dpad">
    <div class="dpad-row">
      <button class="dpad-btn" @touchstart.prevent="$emit('dir', 'up')" @mousedown.prevent="$emit('dir', 'up')">▲</button>
    </div>
    <div class="dpad-row mid-row">
      <button class="dpad-btn" @touchstart.prevent="$emit('dir', 'left')" @mousedown.prevent="$emit('dir', 'left')">◀</button>
      <button class="dpad-btn pause-btn" @touchstart.prevent="$emit('pause')" @mousedown.prevent="$emit('pause')">⏸</button>
      <button class="dpad-btn" @touchstart.prevent="$emit('dir', 'right')" @mousedown.prevent="$emit('dir', 'right')">▶</button>
    </div>
    <div class="dpad-row">
      <button class="dpad-btn" @touchstart.prevent="$emit('dir', 'down')" @mousedown.prevent="$emit('dir', 'down')">▼</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Dir } from '@/game/types';
defineEmits<{ dir: [dir: Dir]; pause: [] }>();
</script>

<style lang="less" scoped>
.dpad {
  display: none;                                   // 桌面端隐藏
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 12px;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}
.dpad-row { display: flex; gap: 2px; }
.mid-row { gap: 12px; }
.dpad-btn {
  width: 56px; height: 56px;
  border: 2px solid rgba(121, 79, 39, 0.3);
  border-radius: 14px;
  background: rgba(247, 243, 223, 0.7);
  color: #794f27;
  font-size: 22px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 0.1s;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  &:active { background: rgba(25, 200, 185, 0.3); }
}
.pause-btn { font-size: 16px; width: 48px; height: 48px; }

@media (pointer: coarse) {
  .dpad { display: flex; }
}
</style>
```

- [ ] **步骤 42.2：运行 typecheck + test**

```bash
pnpm typecheck && pnpm test
```

- [ ] **步骤 42.3：Commit**

```bash
git add src/components/DPad.vue
git commit -m "feat(ui): DPad 移动端方向键组件"
```

---

## 任务 43：滑动手势 SwipeArea

**文件：**

- 创建：`src/components/SwipeArea.vue`

**职责：** 在 Canvas 区域上叠加透明层，检测滑动方向（需 ≥ 30px 才触发），转换为 Dir 指令。

- [ ] **步骤 43.1：创建 `src/components/SwipeArea.vue`**

```vue
<template>
  <div
    ref="areaRef"
    class="swipe-area"
    @touchstart="onStart"
    @touchmove.prevent="onMove"
    @touchend="onEnd"
    @mousedown="onStartMouse"
    @mousemove.prevent="onMoveMouse"
    @mouseup="onEnd"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Dir } from '@/game/types';

const emit = defineEmits<{ swipe: [dir: Dir] }>();

const startX = ref(0);
const startY = ref(0);
const active = ref(false);

function onStart(e: TouchEvent) {
  startX.value = e.touches[0]!.clientX;
  startY.value = e.touches[0]!.clientY;
  active.value = true;
}
function onMove(e: TouchEvent) {
  if (!active.value) return;
  const dx = e.touches[0]!.clientX - startX.value;
  const dy = e.touches[0]!.clientY - startY.value;
  if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
  active.value = false;
  if (Math.abs(dx) > Math.abs(dy)) {
    emit('swipe', dx > 0 ? 'right' : 'left');
  } else {
    emit('swipe', dy > 0 ? 'down' : 'up');
  }
}
function onEnd() { active.value = false; }

function onStartMouse(e: MouseEvent) {
  startX.value = e.clientX;
  startY.value = e.clientY;
  active.value = true;
}
function onMoveMouse(e: MouseEvent) {
  if (!active.value) return;
  const dx = e.clientX - startX.value;
  const dy = e.clientY - startY.value;
  if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
  active.value = false;
  if (Math.abs(dx) > Math.abs(dy)) {
    emit('swipe', dx > 0 ? 'right' : 'left');
  } else {
    emit('swipe', dy > 0 ? 'down' : 'up');
  }
}
</script>

<style lang="less" scoped>
.swipe-area {
  display: none;
  position: absolute; inset: 0;
  z-index: 5;
}
@media (pointer: coarse) {
  .swipe-area { display: block; }
}
</style>
```

- [ ] **步骤 43.2：运行 typecheck + test**

```bash
pnpm typecheck && pnpm test
```

- [ ] **步骤 43.3：Commit**

```bash
git add src/components/SwipeArea.vue
git commit -m "feat(ui): SwipeArea 滑动手势检测组件"
```

---

## 任务 44：响应式布局

**文件：**

- 修改：`src/views/GameView.vue`
- 修改：`src/components/GameHUD.vue`
- 修改：`src/views/HomeView.vue`

**职责：** 添加媒体查询适配移动端竖屏/横屏，Canvas 尺寸自适应，HUD 在窄屏下紧凑排列。

- [ ] **步骤 44.1：GameView 响应式**

在 GameView 的 canvas-area 添加：

```less
.game-view {
  @media (max-width: 600px) {
    .canvas-area { padding: 4px; }
  }
  @media (orientation: landscape) and (max-height: 500px) {
    .canvas-area {
      max-height: 80vh;
      padding: 4px;
    }
  }
}
```

- [ ] **步骤 44.2：GameHUD 紧凑模式**

```less
@media (max-width: 600px) {
  .hud { gap: 12px; padding: 8px 12px; }
  .hud-value { font-size: 16px; }
  .hud-label { font-size: 10px; }
}
```

- [ ] **步骤 44.3：HomeView 自适应**

```less
@media (max-width: 600px) {
  .title { font-size: 32px; }
  .subtitle { font-size: 14px; }
  .menu-buttons { width: 200px; }
}
```

- [ ] **步骤 44.4：运行 typecheck + test**

- [ ] **步骤 44.5：Commit**

```bash
git add src/views/GameView.vue src/components/GameHUD.vue src/views/HomeView.vue
git commit -m "feat(ui): 响应式布局（移动端竖屏/横屏适配）"
```

---

## 任务 45：失焦自动暂停

**文件：**

- 修改：`src/game/core/GameLoop.ts`
- 修改：`src/components/GameCanvas.vue`

**职责：** 监听 `visibilitychange` 和 `pagehide` 事件，页面隐藏时自动暂停游戏，恢复时不需要自动继续（用户自行按暂停/继续）。

- [ ] **步骤 45.1：扩展 GameLoop**

添加 visibility 监听：

```typescript
private visibilityHandler: (() => void) | null = null;

private setupVisibilityPause(): void {
  this.visibilityHandler = () => {
    if (document.hidden && this.state === 'running') {
      this.pause();
      if (this.onAutoPause) this.onAutoPause();
    }
  };
  document.addEventListener('visibilitychange', this.visibilityHandler);
  window.addEventListener('pagehide', this.visibilityHandler);
}

private removeVisibilityPause(): void {
  if (this.visibilityHandler) {
    document.removeEventListener('visibilitychange', this.visibilityHandler);
    window.removeEventListener('pagehide', this.visibilityHandler);
    this.visibilityHandler = null;
  }
}
```

在 `start()` 中调用 `setupVisibilityPause()`，在 `stop()` 和 `destroy()` 中调用 `removeVisibilityPause()`。

- [ ] **步骤 45.2：GameCanvas 连接 GameLoop 回调**

```typescript
// 在构造 GameLoop 或 onRender 中设置 onAutoPause 回调
// 触发 SFX pause
```

- [ ] **步骤 45.3：运行 typecheck + test**

- [ ] **步骤 45.4：Commit**

```bash
git add src/game/core/GameLoop.ts src/components/GameCanvas.vue
git commit -m "feat(game): 失焦/页面隐藏自动暂停"
```

---

## 任务 46：PauseModal 组件

**文件：**

- 创建：`src/components/PauseModal.vue`
- 修改：`src/views/GameView.vue`
- 修改：`src/components/GameHUD.vue`

**职责：** 暂停弹窗显示"游戏暂停"标题 + 继续/返回主菜单按钮。HUD 暂停按钮改为打开 PauseModal。

- [ ] **步骤 46.1：创建 `src/components/PauseModal.vue`**

```vue
<template>
  <div v-if="visible" class="overlay" @click.self="$emit('resume')">
    <div class="modal">
      <h2>游戏暂停</h2>
      <div class="actions">
        <button class="btn-primary" @click="$emit('resume')">继续</button>
        <button class="btn-secondary" @click="$emit('home')">返回主菜单</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ visible: boolean }>();
defineEmits<{ resume: []; home: [] }>();
</script>

<style lang="less" scoped>
@import '@/styles/tokens.less';

.overlay {
  position: fixed; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  z-index: 100; animation: fadeIn .2s ease;
}
.modal {
  background: @bg-color-content;
  border: 3px solid @text-color;
  border-radius: 24px;
  padding: 40px 48px;
  text-align: center;
  min-width: 260px;
}
h2 { color: @text-color; margin: 0 0 24px; font-size: 24px; font-weight: 700; }
.actions { display: flex; flex-direction: column; gap: 12px; }
.btn-primary {
  padding: 12px 32px; border: 2px solid @primary-color; border-radius: 50px;
  background: @primary-color; color: #fff; font-size: 16px; font-weight: 600; cursor: pointer;
  box-shadow: 0 4px 0 0 #11a89b;
  &:hover { background: #3dd4c6; transform: translateY(-1px); }
  &:active { transform: translateY(1px); box-shadow: 0 1px 0 0 #11a89b; }
}
.btn-secondary {
  padding: 10px 32px; border: 2px solid @border-color-light; border-radius: 50px;
  background: @bg-color-secondary; color: @text-color; font-size: 15px; font-weight: 600; cursor: pointer;
  &:hover { border-color: @primary-color; color: @primary-color; }
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
```

- [ ] **步骤 46.2：集成到 GameView + GameHUD**

```vue
<!-- GameView.vue 模板中添加 -->
<PauseModal
  :visible="pausedVisible"
  @resume="resumeGame"
  @home="goHome"
/>
```

```typescript
// GameView.vue script
const pausedVisible = ref(false);

function togglePause() {
  if (pausedVisible.value) {
    resumeGame();
  } else {
    canvasRef.value?.pause();
    pausedVisible.value = true;
  }
}

function resumeGame() {
  pausedVisible.value = false;
  canvasRef.value?.resume();
}
```

GameHUD.vue 增加 emit `pauseToggle` 事件以支持开关式暂停。

- [ ] **步骤 46.3：运行 typecheck + test**

- [ ] **步骤 46.4：Commit**

```bash
git add src/components/PauseModal.vue src/views/GameView.vue src/components/GameHUD.vue
git commit -m "feat(ui): PauseModal 暂停弹窗（继续/返回主菜单）"
```

---

## 任务 47：加载页 + 进度条

**文件：**

- 创建：`src/components/LoadingScreen.vue`
- 修改：`src/views/HomeView.vue` 或 `src/App.vue`

**职责：** 应用启动时显示加载动画，AudioManager 预加载 BGM+SFX 后自动消失。若 AudioManager 不可用则直接跳过。

- [ ] **步骤 47.1：创建 `src/components/LoadingScreen.vue`**

```vue
<template>
  <Transition name="fade">
    <div v-if="visible" class="loading-screen">
      <div class="loading-content">
        <div class="spinner" />
        <p class="loading-text">动森贪吃蛇</p>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{ visible: boolean; progress: number }>();
// progress: 0-100
</script>

<style lang="less" scoped>
@import '@/styles/tokens.less';

.loading-screen {
  position: fixed; inset: 0; z-index: 1000;
  display: flex; align-items: center; justify-content: center;
  background: @bg-color;
}
.loading-content { display: flex; flex-direction: column; align-items: center; gap: 24px; }
.spinner {
  width: 48px; height: 48px;
  border: 4px solid @border-color-light;
  border-top-color: @primary-color;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { font-size: 20px; font-weight: 700; color: @text-color; }
.progress-bar {
  width: 200px; height: 6px;
  background: @border-color-light;
  border-radius: 3px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: @primary-color;
  border-radius: 3px;
  transition: width 0.3s ease;
}
.fade-leave-active { transition: opacity 0.5s ease; }
.fade-leave-to { opacity: 0; }
</style>
```

- [ ] **步骤 47.2：集成到 App.vue**

在 `App.vue` 中添加 LoadingScreen，根据 AudioManager 加载状态控制显隐。

- [ ] **步骤 47.3：运行 typecheck + test**

- [ ] **步骤 47.4：Commit**

```bash
git add src/components/LoadingScreen.vue src/App.vue
git commit -m "feat(ui): 加载页 + 音频预加载进度条"
```

---

## 任务 48：PWA manifest

**文件：**

- 创建：`public/manifest.json`
- 修改：`index.html`
- 修改：`vite.config.ts`（可选：安装 vite-plugin-pwa）

**职责：** 创建 PWA manifest，包含应用名、图标、主题色；在 index.html 中注册。

- [ ] **步骤 48.1：创建 `public/manifest.json`**

```json
{
  "name": "动森贪吃蛇",
  "short_name": "贪吃蛇",
  "start_url": ".",
  "display": "standalone",
  "background_color": "#f8f8f0",
  "theme_color": "#19c8b9",
  "description": "一款采用《动物森友会》风格的贪吃蛇游戏",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **步骤 48.2：更新 `index.html`**

在 `<head>` 中添加：

```html
<meta name="theme-color" content="#19c8b9" />
<link rel="manifest" href="manifest.json" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="动森贪吃蛇" />
```

- [ ] **步骤 48.3：生成 PWA 图标**

图标文件需用户实际提供。阶段 4 先创建占位 SVG 转 PNG，或跳过实际文件（仅保留 manifest 引用）。

- [ ] **步骤 48.4：Commit**

```bash
git add public/manifest.json index.html
git commit -m "feat(pwa): PWA manifest + theme-color + apple-web-app meta"
```

---

## 任务 49：GameView 全量集成 + 视觉打磨

**文件：**

- 修改：`src/views/GameView.vue`

**职责：** 将 DPad、SwipeArea、PauseModal、LoadingScreen 全部集成进 GameView，确保移动端正确显示控件，桌面端只显示键盘提示。

- [ ] **步骤 49.1：GameView 完整布局**

```vue
<template>
  <main class="game-view">
    <GameHUD :score="score" :length="snakeLength" :island-name="islandName" @pause="togglePause" />
    <div class="canvas-area">
      <SwipeArea @swipe="onSwipe" />
      <GameCanvas ref="canvasRef" :island="island" :mode="mode" :difficulty="difficulty"
        @die="onDie" @eat="onEat" @score-change="(v) => score = v" />
    </div>
    <DPad @dir="onDir" @pause="togglePause" />
    <PauseModal :visible="pausedVisible" @resume="resumeGame" @home="goHome" />
    <GameOverModal :visible="gameOverVisible" :score="finalScore" :length="finalLength"
      :is-new-high-score="isNewHigh" :mode="mode" :island="island" :new-unlocks="newUnlocks"
      :date-str="dateStr" :accent-color="accentColor" :bg-color="bgColor"
      @retry="retry" @home="goHome" />
  </main>
</template>
```

- [ ] **步骤 49.2：视觉打磨清单**

| 项目 | 文件 | 改动 |
|------|------|------|
| HUD 暂停按钮改为文字 toggle | GameHUD.vue | 暂停/继续文字切换 |
| 按钮 active 态响应速度 | 全局 | 确保 0.1s 内 > |
| 弹窗出现动画 | Modal | 保留现有 zoom-in |
| 移动端 Canvas 最小尺寸 | GameCanvas | 设 min-width: 280px |

- [ ] **步骤 49.3：运行 typecheck + test**

- [ ] **步骤 49.4：Commit**

```bash
git add -A
git commit -m "feat(ui): GameView 全量集成 + 视觉打磨（DPad/SwipeArea/PauseModal）"
```

---

## 任务 50：端到端验收

- [ ] **步骤 50.1：运行全部检查**

```bash
pnpm test && pnpm typecheck && pnpm lint
```

- [ ] **步骤 50.2：启动 dev server 全场景验证**

```bash
pnpm dev
```

验证清单：
1. 桌面端：完整游戏流程（eat/die/unlock）正常
2. 按 Space 暂停 → PauseModal 弹出 → 继续/返回主菜单
3. 切换浏览器标签页 → 游戏自动暂停
4. 移动端 DevTools 模拟 → DPad 可见可用
5. 滑动 Canvas 区域 → 方向改变
6. 设置页调整音量 → 刷新后保留
7. 主菜单 → 图鉴 → 返回 → 设置 → 返回

- [ ] **步骤 50.3：Commit**

```bash
git add -A
git commit -m "chore: 阶段 4 完成 - 移动端+音频+打磨验收通过"
```

---

## 阶段 4 完成标准

- [x] BGM 循环播放，8 种 SFX 按事件触发
- [x] 音量滑块持久化到 localStorage（settings store）
- [x] 移动端 DPad 方向键可用（触屏显示，桌面端隐藏）
- [x] 滑动手势（≥30px 触发方向切换）
- [x] 页面失焦/隐藏时自动暂停
- [x] PauseModal 暂停弹窗（继续/返回主菜单）
- [x] 响应式布局（竖屏/横屏均正常）
- [x] 首屏加载动画 + 进度条
- [x] PWA manifest（可安装到主屏幕）
- [x] 所有测试通过 + typecheck + lint 零错误

---

## 附录：音频资源模板

以下是用户在阶段 4 需要提供的音频文件（放在 `public/audio/` 下）：

| 文件名 | 描述 | 格式 |
|---|---|---|
| `bgm_main.ogg` | 主循环 BGM | OGG (Vorbis) |
| `sfx_eat.ogg` | 吃普通水果 | OGG |
| `sfx_eat_fossil.ogg` | 吃化石 | OGG |
| `sfx_eat_meteor.ogg` | 吃流星 | OGG |
| `sfx_die.ogg` | 死亡 | OGG |
| `sfx_unlock.ogg` | 解锁成就/岛屿 | OGG |
| `sfx_pause.ogg` | 暂停/恢复 | OGG |
| `sfx_page.ogg` | 翻页/Modal 开关 | OGG |
| `sfx_meteor_spawn.ogg` | 流星生成 | OGG |

文件缺失时 AudioManager 静默降级，不影响游戏运行。
