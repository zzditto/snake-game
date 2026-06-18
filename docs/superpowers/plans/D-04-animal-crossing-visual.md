# 阶段 2 · 动森视觉化 实现计划

> **面向 AI 代理的工作者：** 使用 superpowers:subagent-driven-development 或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法跟踪进度。

**目标：** 将阶段 1 的纯色占位渲染全面升级为《集合啦！动物森友会》视觉风格——包括蛇身渐变+头眼耳帽+尾巴摆动、Canvas 2D 代码绘制水果 sprite、粒子特效、死亡动画、alpha 平滑插值、HomeView 完整界面（Title 飘带 + IslandPicker + Footer）、以及 SettingsView 设置页。

**架构：** 渲染层全部在 `src/game/render/` 下，纯 TS 无 Vue 依赖；Vue 层通过 `animal-island-vue` 组件库构建主菜单和设置页。所有水果/帽子用 Canvas 2D 代码绘制（不依赖外部 SVG 资源），确保阶段 2 独立可交付。

**技术栈：** Canvas 2D / TypeScript / Vue 3.4+ / animal-island-vue / Less / Vue Router 4 / Pinia

**前置条件：** 阶段 1 全部完成（Plan A/B/C），核心引擎可玩，5 层 Canvas 架构已存在，Pinia stores 已就绪。

**关联规格：** `docs/superpowers/specs/2026-06-18-snake-game-design.md` §7-9

**验收标准：**
- 蛇身呈现头尾渐变色 + 耳朵 + 帽子 + 尾巴正弦摆动 + 转弯贝塞尔弧线
- 食物用 Canvas 2D 绘制出 6 种水果的可识别形态 + 浮动动画 + 高光
- 吃食物时星星粒子爆散、死亡时身体逐节爆开 + 头部下沉
- 草地有噪点纹理 + 边缘渐隐 + 装饰物放置
- 渲染 alpha 插值生效，蛇移动平滑无跳格
- HomeView 展示飘带标题 + 5 岛选择器（仅春樱解锁，其余灰显加锁）+ 底部 Footer
- SettingsView 可用（音量滑块 + 难度切换 + 键位）
- `pnpm test` 全部已有单测通过（渲染层不新增单测）
- `pnpm typecheck` 无错误 / `pnpm lint` 无错误
- 截图能让人认出「动森风」

---

## 文件结构

### 创建的文件

- `src/game/render/sprites.ts` — Canvas 2D sprite 绘制工具集（6 种水果 + 4 顶帽子 + 星星粒子 + 装饰树）
- `src/components/IslandPicker.vue` — 岛屿选择卡片轮播
- `src/components/PauseModal.vue` — 暂停弹窗
- `src/views/SettingsView.vue` — 设置页面

### 修改的文件

- `src/game/render/layers/SnakeLayer.ts` — 蛇身渲染全面升级（渐变/耳朵/帽子/尾巴摆动/转弯弧线/死亡动画）
- `src/game/render/layers/FoodLayer.ts` — 食物渲染升级（代码绘制 sprite/浮动/流星拖尾/金苹果光晕）
- `src/game/render/layers/GrassLayer.ts` — 草地升级（噪点纹理/边缘渐隐/装饰物）
- `src/game/render/layers/EffectsLayer.ts` — 粒子系统实现（吃食物星星/震屏/解锁闪光）
- `src/game/render/Renderer.ts` — 升级（animationTime 传递/alpha 插值/死亡动画控制）
- `src/game/render/theme.ts` — 实现主题工具函数
- `src/components/GameCanvas.vue` — emit `eat` 事件传坐标给特效层
- `src/components/GameHUD.vue` — 动森风格重绘
- `src/components/GameOverModal.vue` — 使用动物森友会 Modal 风格
- `src/views/HomeView.vue` — 完整主菜单（Title + IslandPicker + Footer）
- `src/views/GameView.vue` — 接入 IslandPicker 参数 + PauseModal
- `src/router/index.ts` — 新增 Settings 路由
- `src/styles/tokens.less` — 引入 Nunito 字体 + 全局样式完善

---

## 任务 19：Canvas 2D Sprite 绘制工具集（sprites.ts）

**文件：**

- 创建：`src/game/render/sprites.ts`

**职责：** 提供一组纯函数，用 Canvas 2D API 绘制动森风格的水果、帽子、装饰物、粒子。阶段 2 先用代码绘制，阶段 3 用户提供 SVG 后再用 drawImage 替换。所有绘制函数接收 `(ctx, x, y, size, options?)` 签名。

- [ ] **步骤 19.1：创建 `src/game/render/sprites.ts` — 水果绘制**

```ts
// sprites.ts — Canvas 2D 代码绘制的动森风水果/帽子/粒子 sprite
// 所有函数签名为 (ctx, x, y, size, options?) ，x/y 为中心点

export interface SpriteOptions {
  scale?: number;     // 默认 1
  rotation?: number;  // 弧度
  alpha?: number;     // 全局透明度，默认 1
}

// ====== 水果 ======

/** 红苹果+绿叶，动森圆润风 */
export function drawApple(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const r = size * 0.42;
  ctx.save();
  ctx.translate(x, y);
  // 主体渐变 — 亮红到暗红
  const grad = ctx.createRadialGradient(-r * 0.15, -r * 0.2, r * 0.1, 0, 0, r);
  grad.addColorStop(0, '#ff5a5a');
  grad.addColorStop(0.7, '#e63946');
  grad.addColorStop(1, '#b71c1c');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  // 描边
  ctx.strokeStyle = '#794f27';
  ctx.lineWidth = Math.max(1.5, size * 0.06);
  ctx.stroke();
  // 顶部凹陷
  ctx.fillStyle = '#b71c1c';
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.85, r * 0.2, r * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  // 叶柄
  ctx.strokeStyle = '#5a8a3c';
  ctx.lineWidth = Math.max(1, size * 0.04);
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.88);
  ctx.quadraticCurveTo(r * 0.3, -r * 1.2, r * 0.2, -r * 1.3);
  ctx.stroke();
  // 叶片
  ctx.fillStyle = '#6fba2c';
  ctx.beginPath();
  ctx.ellipse(r * 0.25, -r * 1.3, r * 0.2, r * 0.35, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#4a7a1e';
  ctx.lineWidth = Math.max(0.8, size * 0.03);
  ctx.stroke();
  // 高光
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.25, -r * 0.3, r * 0.25, r * 0.15, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** 双樱桃+连蒂 */
export function drawCherry(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const r = size * 0.3;
  ctx.save();
  ctx.translate(x, y);
  // 左樱桃
  drawCherryBody(ctx, -r * 0.6, r * 0.15, r);
  // 右樱桃
  drawCherryBody(ctx, r * 0.6, r * 0.15, r);
  // 蒂 — Y 形
  ctx.strokeStyle = '#5a8a3c';
  ctx.lineWidth = Math.max(1.2, size * 0.05);
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.9);
  ctx.quadraticCurveTo(-r * 0.2, -r * 0.2, -r * 0.5, -r * 0.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.9);
  ctx.quadraticCurveTo(r * 0.2, -r * 0.2, r * 0.5, -r * 0.2);
  ctx.stroke();
  // 小叶
  ctx.fillStyle = '#6fba2c';
  ctx.beginPath();
  ctx.ellipse(0, -r * 1.2, r * 0.2, r * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCherryBody(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  const grad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.05, cx, cy, r);
  grad.addColorStop(0, '#ff3b3b');
  grad.addColorStop(0.8, '#d90429');
  grad.addColorStop(1, '#8b0015');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#794f27';
  ctx.lineWidth = Math.max(1.5, r * 0.25);
  ctx.stroke();
  // 高光
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.25, cy - r * 0.25, r * 0.22, r * 0.15, -0.4, 0, Math.PI * 2);
  ctx.fill();
}

/** 粉桃 */
export function drawPeach(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const r = size * 0.4;
  ctx.save();
  ctx.translate(x, y);
  const grad = ctx.createRadialGradient(-r * 0.1, -r * 0.15, r * 0.05, 0, 0, r);
  grad.addColorStop(0, '#ffd4d4');
  grad.addColorStop(0.5, '#ffb6c1');
  grad.addColorStop(1, '#e8929a');
  ctx.fillStyle = grad;
  ctx.beginPath();
  // 桃子形：稍扁 + 中缝
  ctx.ellipse(0, r * 0.05, r, r * 1.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#794f27';
  ctx.lineWidth = Math.max(1.5, size * 0.06);
  ctx.stroke();
  // 中缝
  ctx.strokeStyle = '#d48090';
  ctx.lineWidth = Math.max(0.8, size * 0.03);
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.8);
  ctx.quadraticCurveTo(r * 0.05, -r * 0.1, -r * 0.02, r * 0.9);
  ctx.stroke();
  // 叶片
  ctx.fillStyle = '#6fba2c';
  ctx.beginPath();
  ctx.ellipse(r * 0.15, -r * 1.1, r * 0.2, r * 0.35, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#4a7a1e';
  ctx.lineWidth = Math.max(0.8, size * 0.03);
  ctx.stroke();
  // 高光
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.3, -r * 0.3, r * 0.2, r * 0.12, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** 黄绿梨 */
export function drawPear(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.save();
  ctx.translate(x, y);
  const r = size * 0.35;
  const grad = ctx.createRadialGradient(-r * 0.1, -r * 0.1, r * 0.05, 0, r * 0.1, r * 1.3);
  grad.addColorStop(0, '#e5f27d');
  grad.addColorStop(0.7, '#bfd200');
  grad.addColorStop(1, '#8a9a00');
  ctx.fillStyle = grad;
  // 葫芦形：上部窄、下部宽
  ctx.beginPath();
  ctx.moveTo(-r * 0.45, -r * 0.6);
  ctx.quadraticCurveTo(-r * 0.6, -r * 0.1, -r * 0.7, r * 0.4);
  ctx.quadraticCurveTo(-r * 0.8, r * 0.9, 0, r * 1.1);
  ctx.quadraticCurveTo(r * 0.8, r * 0.9, r * 0.7, r * 0.4);
  ctx.quadraticCurveTo(r * 0.6, -r * 0.1, r * 0.45, -r * 0.6);
  ctx.quadraticCurveTo(0, -r * 0.85, -r * 0.45, -r * 0.6);
  ctx.fill();
  ctx.strokeStyle = '#794f27';
  ctx.lineWidth = Math.max(1.5, size * 0.06);
  ctx.stroke();
  // 叶
  ctx.fillStyle = '#6fba2c';
  ctx.beginPath();
  ctx.ellipse(0, -r * 1.1, r * 0.18, r * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  // 高光
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.2, -r * 0.15, r * 0.18, r * 0.1, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** 橙子 */
export function drawOrange(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const r = size * 0.4;
  ctx.save();
  ctx.translate(x, y);
  const grad = ctx.createRadialGradient(-r * 0.15, -r * 0.2, r * 0.08, 0, 0, r);
  grad.addColorStop(0, '#ffc44d');
  grad.addColorStop(0.6, '#f4a020');
  grad.addColorStop(1, '#c47a10');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#794f27';
  ctx.lineWidth = Math.max(1.5, size * 0.06);
  ctx.stroke();
  // 顶凹
  ctx.fillStyle = '#9a5a08';
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.88, r * 0.2, r * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  // 小绿叶
  ctx.fillStyle = '#6fba2c';
  ctx.beginPath();
  ctx.ellipse(0, -r * 1.1, r * 0.15, r * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  // 纹理小点
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5, r * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }
  // 高光
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.25, -r * 0.3, r * 0.22, r * 0.14, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** 椰子 */
export function drawCoconut(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const r = size * 0.38;
  ctx.save();
  ctx.translate(x, y);
  const grad = ctx.createRadialGradient(-r * 0.1, -r * 0.15, r * 0.05, 0, 0, r);
  grad.addColorStop(0, '#d4b88c');
  grad.addColorStop(0.7, '#c8a878');
  grad.addColorStop(1, '#8b6914');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#794f27';
  ctx.lineWidth = Math.max(1.5, size * 0.06);
  ctx.stroke();
  // 三个黑点（椰子眼）
  ctx.fillStyle = '#5a3a1a';
  const dotR = r * 0.08;
  const dotY = -r * 0.4;
  for (const dx of [-r * 0.2, r * 0.2]) {
    ctx.beginPath();
    ctx.arc(dx, dotY, dotR, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(0, dotY + r * 0.15, dotR, 0, Math.PI * 2);
  ctx.fill();
  // 高光
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.2, -r * 0.25, r * 0.2, r * 0.12, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** 流星 */
export function drawMeteor(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, glowPhase: number): void {
  const r = size * 0.35;
  ctx.save();
  ctx.translate(x, y);
  // 光晕
  const glowGrad = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 1.6);
  glowGrad.addColorStop(0, 'rgba(120, 80, 220, 0.4)');
  glowGrad.addColorStop(0.5, 'rgba(100, 60, 200, 0.15)');
  glowGrad.addColorStop(1, 'rgba(80, 40, 180, 0)');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
  ctx.fill();
  // 主体
  const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.05, 0, 0, r);
  grad.addColorStop(0, '#a080e0');
  grad.addColorStop(0.6, '#5b3aa5');
  grad.addColorStop(1, '#3a1a70');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#794f27';
  ctx.lineWidth = Math.max(1.5, size * 0.06);
  ctx.stroke();
  // 坑点
  ctx.fillStyle = 'rgba(40,20,80,0.4)';
  ctx.beginPath(); ctx.arc(r * 0.3, -r * 0.3, r * 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(-r * 0.35, r * 0.2, r * 0.08, 0, Math.PI * 2); ctx.fill();
  // 闪烁高光
  const shimmer = 0.4 + 0.2 * Math.sin(glowPhase * 3);
  ctx.fillStyle = `rgba(255,255,255,${shimmer})`;
  ctx.beginPath();
  ctx.ellipse(-r * 0.2, -r * 0.3, r * 0.22, r * 0.12, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** 金苹果 */
export function drawGoldenApple(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, glowPhase: number): void {
  const r = size * 0.42;
  ctx.save();
  ctx.translate(x, y);
  // 旋转光晕
  ctx.save();
  ctx.rotate(glowPhase * 0.3);
  const auraGrad = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 1.5);
  auraGrad.addColorStop(0, 'rgba(255,215,0,0.3)');
  auraGrad.addColorStop(1, 'rgba(255,215,0,0)');
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // 主体
  const grad = ctx.createRadialGradient(-r * 0.15, -r * 0.2, r * 0.08, 0, 0, r);
  grad.addColorStop(0, '#ffe680');
  grad.addColorStop(0.6, '#ffd700');
  grad.addColorStop(1, '#b8960a');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#794f27';
  ctx.lineWidth = Math.max(1.5, size * 0.06);
  ctx.stroke();
  // 叶片
  ctx.fillStyle = '#6fba2c';
  ctx.beginPath();
  ctx.ellipse(0, -r * 1.1, r * 0.18, r * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  // sparkles
  const sparkCount = 3;
  for (let i = 0; i < sparkCount; i++) {
    const a = glowPhase * 1.2 + (i / sparkCount) * Math.PI * 2;
    const sx = Math.cos(a) * r * 0.8;
    const sy = Math.sin(a) * r * 0.8;
    drawSparkle(ctx, sx, sy, r * 0.2);
  }
  ctx.restore();
}

// ====== 帽子 ======

/** 樱花瓣冠 */
export function drawHatCherryBlossom(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const petalR = size * 0.22;
  ctx.save();
  ctx.translate(x, y);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const px = Math.cos(a) * petalR * 0.9;
    const py = Math.sin(a) * petalR * 0.9;
    ctx.fillStyle = i % 2 === 0 ? '#ffb6c1' : '#ffc8d8';
    ctx.beginPath();
    ctx.ellipse(px, py, petalR * 0.5, petalR * 0.35, a + 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#a87078';
    ctx.lineWidth = Math.max(0.8, size * 0.04);
    ctx.stroke();
  }
  // 中心花蕊
  ctx.fillStyle = '#ffe066';
  ctx.beginPath();
  ctx.arc(0, 0, petalR * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** 贝壳头饰 */
export function drawHatShell(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.save();
  ctx.translate(x, y);
  const r = size * 0.38;
  ctx.fillStyle = '#ffc8b8';
  ctx.beginPath();
  // 扇形贝壳
  ctx.moveTo(0, -r * 0.3);
  for (let i = 0; i <= 6; i++) {
    const a = Math.PI - (i / 6) * Math.PI;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.6 - r * 0.3);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#794f27';
  ctx.lineWidth = Math.max(1, size * 0.05);
  ctx.stroke();
  // 放射纹
  ctx.strokeStyle = 'rgba(180,100,80,0.3)';
  ctx.lineWidth = Math.max(0.5, size * 0.02);
  for (let i = 1; i < 6; i++) {
    const a = Math.PI - (i / 6) * Math.PI;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.3);
    ctx.lineTo(Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.55 - r * 0.3);
    ctx.stroke();
  }
  ctx.restore();
}

/** 枫叶头饰 */
export function drawHatMapleLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.save();
  ctx.translate(x, y);
  const r = size * 0.4;
  ctx.fillStyle = '#d94b3a';
  ctx.beginPath();
  // 简化枫叶 5 尖
  const peaks = 5;
  for (let i = 0; i < peaks; i++) {
    const a = (i / peaks) * Math.PI * 2 - Math.PI / 2;
    const tipX = Math.cos(a) * r;
    const tipY = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(tipX, tipY);
    else ctx.lineTo(tipX, tipY);
    const midA = a + Math.PI / peaks;
    ctx.lineTo(Math.cos(midA) * r * 0.4, Math.sin(midA) * r * 0.4);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#794f27';
  ctx.lineWidth = Math.max(1.2, size * 0.05);
  ctx.stroke();
  // 脉纹
  ctx.strokeStyle = 'rgba(100,30,20,0.3)';
  ctx.lineWidth = Math.max(0.5, size * 0.02);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7);
    ctx.stroke();
  }
  ctx.restore();
}

/** 雪团帽子 */
export function drawHatSnow(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.save();
  ctx.translate(x, y);
  const r = size * 0.36;
  const grad = ctx.createRadialGradient(-r * 0.1, -r * 0.15, r * 0.05, 0, 0, r);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.7, '#e8f0f8');
  grad.addColorStop(1, '#c8d8e8');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#a0b8d0';
  ctx.lineWidth = Math.max(1.2, size * 0.05);
  ctx.stroke();
  // 顶部绒球
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(0, -r * 0.7, r * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#a0b8d0';
  ctx.lineWidth = Math.max(0.8, size * 0.03);
  ctx.stroke();
  ctx.restore();
}

// ====== 粒子/特效 ======

export function drawSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#ffeaa7';
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const tipX = Math.cos(a) * size;
    const tipY = Math.sin(a) * size;
    const midA = a + Math.PI / 4;
    const midR = size * 0.35;
    if (i === 0) ctx.moveTo(tipX, tipY);
    else ctx.lineTo(tipX, tipY);
    ctx.lineTo(Math.cos(midA) * midR, Math.sin(midA) * midR);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** 星星粒子（5 角星） */
export function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? size : size * 0.4;
    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#794f27';
  ctx.lineWidth = Math.max(0.5, size * 0.15);
  ctx.stroke();
  ctx.restore();
}

// ====== 装饰物 ======

/** 简化樱花树（棋盘边缘装饰） */
export function drawCherryTree(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.save();
  ctx.translate(x, y);
  // 树干
  ctx.fillStyle = '#8b6914';
  ctx.fillRect(-size * 0.08, size * 0.05, size * 0.16, size * 0.4);
  ctx.strokeStyle = '#5a3a1a';
  ctx.lineWidth = Math.max(0.8, size * 0.03);
  ctx.strokeRect(-size * 0.08, size * 0.05, size * 0.16, size * 0.4);
  // 树冠
  ctx.fillStyle = '#ffc1d8';
  ctx.beginPath();
  ctx.arc(0, size * 0.2, size * 0.38, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ff9eb8';
  ctx.beginPath();
  ctx.arc(-size * 0.1, size * 0.1, size * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.15, size * 0.15, size * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ====== 工具 ======

/** 按 kind 分配绘制函数 */
export function drawFoodSprite(
  ctx: CanvasRenderingContext2D,
  kind: string,
  x: number,
  y: number,
  size: number,
  animPhase: number,
): void {
  switch (kind) {
    case 'apple':     drawApple(ctx, x, y, size); break;
    case 'cherry':    drawCherry(ctx, x, y, size); break;
    case 'peach':     drawPeach(ctx, x, y, size); break;
    case 'pear':      drawPear(ctx, x, y, size); break;
    case 'orange':    drawOrange(ctx, x, y, size); break;
    case 'coconut':   drawCoconut(ctx, x, y, size); break;
    case 'meteor':    drawMeteor(ctx, x, y, size, animPhase); break;
    case 'golden':    drawGoldenApple(ctx, x, y, size, animPhase); break;
    case 'watermelon':
    case 'persimmon':
    case 'chestnut':  drawApple(ctx, x, y, size); break; // 阶段 3 单独实现
    default:
      if (kind.startsWith('fossil')) {
        // 化石占位：土色圆 + 问号
        drawFossilPlaceholder(ctx, x, y, size);
      } else {
        drawApple(ctx, x, y, size); // 未知 fallback
      }
  }
}

export function drawHatSprite(
  ctx: CanvasRenderingContext2D,
  hatKey: string,
  x: number,
  y: number,
  size: number,
): void {
  switch (hatKey) {
    case 'hat_cherry_blossom': drawHatCherryBlossom(ctx, x, y, size); break;
    case 'hat_shell':          drawHatShell(ctx, x, y, size); break;
    case 'hat_maple_leaf':     drawHatMapleLeaf(ctx, x, y, size); break;
    case 'hat_snow':           drawHatSnow(ctx, x, y, size); break;
    default:                   drawHatCherryBlossom(ctx, x, y, size);
  }
}

function drawFossilPlaceholder(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const r = size * 0.35;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#d4c4a8';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#794f27';
  ctx.lineWidth = Math.max(1.5, size * 0.06);
  ctx.stroke();
  // 问号
  ctx.fillStyle = '#794f27';
  ctx.font = `${r * 1.2}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', 0, 1);
  ctx.restore();
}
```

- [ ] **步骤 19.2：运行 typecheck**

```bash
pnpm typecheck
```

预期：无错误。

- [ ] **步骤 19.3：Commit**

```bash
git add src/game/render/sprites.ts
git commit -m "feat(render): 添加 Canvas 2D 代码绘制 sprite 工具集（6 水果+4 帽子+粒子+装饰）"
```

---

## 任务 20：SnakeLayer 渲染升级

**文件：**

- 修改：`src/game/render/layers/SnakeLayer.ts`

**职责：** 将阶段 1 的纯色矩形蛇身替换为：头尾渐变、三角耳朵、代码绘制帽子、尾巴正弦摆动、转弯贝塞尔弧线、死亡动画状态管理。签名扩展为接收 `theme`/`time`/`isDead`。

- [ ] **步骤 20.1：重写 `src/game/render/layers/SnakeLayer.ts`**

```ts
import type { SnakeState, ThemeTokens } from '@/game/types';
import { drawHatSprite } from '@/game/render/sprites';

export interface SnakeLayerOptions {
  alpha: number;         // 渲染插值 0~1
  animTime: number;      // 秒，用于尾巴摆动等
  isDead: boolean;       // 是否播放死亡动画
  deathTime: number;     // 死亡动画已播放秒数
  theme: ThemeTokens;
}

const DIR_VEC: Record<string, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

export function drawSnakeLayer(
  ctx: CanvasRenderingContext2D,
  snake: SnakeState,
  cellW: number,
  cellH: number,
  opts: SnakeLayerOptions,
): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  if (snake.body.length === 0) return;

  const { alpha, animTime, isDead, deathTime, theme } = opts;

  // === 死亡动画 ===
  if (isDead) {
    drawDeathAnimation(ctx, snake, cellW, cellH, deathTime, theme);
    return;
  }

  const head = snake.body[0]!;
  const bodyStartColor = theme.snakeBodyStart;
  const bodyEndColor = theme.snakeBodyEnd;
  const headColor = theme.snakeHead;

  // 解析渐变色为 RGB
  const startRGB = hexToRgb(bodyStartColor);
  const endRGB = hexToRgb(bodyEndColor);

  for (let i = 0; i < snake.body.length; i++) {
    const seg = snake.body[i]!;
    const t = snake.body.length > 1 ? i / (snake.body.length - 1) : 0;
    const color = i === 0
      ? headColor
      : lerpColor(startRGB, endRGB, t);

    const pad = 2;
    const x = seg.x * cellW + pad;
    const y = seg.y * cellH + pad;
    const w = cellW - pad * 2;
    const h = cellH - pad * 2;
    const r = Math.min(w, h) / 2;

    // 尾巴摆动
    let tailOffsetY = 0;
    if (i === snake.body.length - 1 && snake.body.length > 2) {
      tailOffsetY = Math.sin(animTime * 6 + i * 0.5) * cellH * 0.15;
    }

    ctx.fillStyle = color;
    roundRect(ctx, x, y + tailOffsetY, w, h, r);
    ctx.fill();

    // 转弯弧线：连接相邻节段
    if (i > 0 && i < snake.body.length - 1) {
      const prev = snake.body[i - 1]!;
      const next = snake.body[i + 1]!;
      if (!(prev.x === next.x || prev.y === next.y)) {
        // 方向变化，绘制弧形角
        drawTurnCurve(ctx, seg, prev, next, cellW, cellH, color);
      }
    }
  }

  // === 蛇头细节 ===
  if (snake.body.length > 0) {
    const hx = head.x * cellW + cellW / 2;
    const hy = head.y * cellH + cellH / 2;

    const vec = DIR_VEC[snake.direction] ?? { dx: 1, dy: 0 };
    const eyeOffsetX = vec.dx * cellW * 0.12;
    const eyeOffsetY = vec.dy * cellH * 0.12;

    // 眼睛
    const eyeR = Math.max(2.5, Math.round(cellW * 0.09));
    const pupilR = Math.max(1.2, Math.round(eyeR * 0.5));

    const eye1X = hx - cellW * 0.15 + eyeOffsetX;
    const eye1Y = hy - cellH * 0.12 + eyeOffsetY;
    const eye2X = hx + cellW * 0.15 + eyeOffsetX;
    const eye2Y = hy - cellH * 0.12 + eyeOffsetY;

    // 眨眼动画（每 3~5 秒眨眼一次）
    const blinkCycle = animTime % 4;
    const blinkRatio = blinkCycle > 3.8 ? 0.2 : 1;

    for (const [ex, ey] of [[eye1X, eye1Y], [eye2X, eye2Y]]) {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(ex, ey, eyeR, eyeR * blinkRatio, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#794f27';
      ctx.lineWidth = Math.max(0.8, cellW * 0.02);
      ctx.stroke();
      // 瞳孔
      if (blinkRatio > 0.5) {
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(ex + vec.dx * pupilR * 0.3, ey + vec.dy * pupilR * 0.3, pupilR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 耳朵（三角形）
    drawEars(ctx, hx, hy, cellW, cellH, vec);

    // 帽子
    if (theme.hatSprite) {
      const hatX = hx + vec.dx * cellW * 0.05;
      const hatY = hy - cellH * 0.42;
      const hatSize = Math.min(cellW, cellH) * 0.8;
      drawHatSprite(ctx, theme.hatSprite, hatX, hatY, hatSize);
    }
  }
}

function drawEars(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  cellW: number, cellH: number,
  vec: { dx: number; dy: number },
): void {
  const earSize = cellW * 0.2;
  const earOffsetX = cellW * 0.25;
  const earY = cy - cellH * 0.32;

  // 左耳
  const lx = cx - earOffsetX;
  drawEarTriangle(ctx, lx, earY, earSize, false);
  // 右耳
  const rx = cx + earOffsetX;
  drawEarTriangle(ctx, rx, earY, earSize, true);
}

function drawEarTriangle(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number, flipped: boolean,
): void {
  ctx.fillStyle = '#a87749';
  ctx.beginPath();
  const dir = flipped ? 1 : -1;
  ctx.moveTo(x, y);
  ctx.lineTo(x + dir * size * 1.2, y - size * 1.2);
  ctx.lineTo(x + dir * size * 0.4, y + size * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#794f27';
  ctx.lineWidth = Math.max(0.8, size * 0.2);
  ctx.stroke();
  // 内耳粉
  ctx.fillStyle = '#e8b8b0';
  ctx.beginPath();
  const innerR = size * 0.5;
  ctx.ellipse(x + dir * size * 0.5, y - size * 0.4, innerR * 0.5, innerR, dir * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawTurnCurve(
  ctx: CanvasRenderingContext2D,
  seg: { x: number; y: number },
  prev: { x: number; y: number },
  next: { x: number; y: number },
  cellW: number,
  cellH: number,
  color: string,
): void {
  const cx = seg.x * cellW + cellW / 2;
  const cy = seg.y * cellH + cellH / 2;
  const px = prev.x * cellW + cellW / 2;
  const py = prev.y * cellH + cellH / 2;
  const nx = next.x * cellW + cellW / 2;
  const ny = next.y * cellH + cellH / 2;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.quadraticCurveTo(cx, cy, nx, ny);
  ctx.lineWidth = Math.min(cellW, cellH) - 4;
  ctx.strokeStyle = color;
  ctx.stroke();
}

function drawDeathAnimation(
  ctx: CanvasRenderingContext2D,
  snake: SnakeState,
  cellW: number,
  cellH: number,
  deathTime: number,
  theme: ThemeTokens,
): void {
  const maxDuration = 1.5; // 死亡动画持续 1.5s
  const progress = Math.min(deathTime / maxDuration, 1);

  if (progress >= 1) {
    // 动画结束，不绘制蛇
    return;
  }

  const { body } = snake;

  for (let i = 0; i < body.length; i++) {
    const seg = body[i]!;
    const segProgress = Math.max(0, progress - i * 0.05); // 逐节延迟爆开
    if (segProgress <= 0) {
      // 还没轮到这节，正常绘制（已爆开的节不重绘）
      const t = body.length > 1 ? i / (body.length - 1) : 0;
      const r0 = hexToRgb(theme.snakeBodyStart);
      const r1 = hexToRgb(theme.snakeBodyEnd);
      const color = i === 0 ? theme.snakeHead : lerpColor(r0, r1, t);

      const pad = 2;
      const x = seg.x * cellW + pad;
      const y = seg.y * cellH + pad;
      const w = cellW - pad * 2;
      const h = cellH - pad * 2;
      const r = Math.min(w, h) / 2;
      ctx.fillStyle = color;
      ctx.globalAlpha = 1 - segProgress * 2;
      roundRect(ctx, x, y, w, h, r);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else {
      // 爆开：绘制几个粒子散开
      const cx = seg.x * cellW + cellW / 2;
      const cy = seg.y * cellH + cellH / 2;
      const particleCount = 4;
      for (let p = 0; p < particleCount; p++) {
        const angle = (p / particleCount) * Math.PI * 2 + segProgress * 3;
        const dist = segProgress * cellW * 1.5;
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;
        const alpha = 1 - segProgress;
        const size = cellW * 0.15 * (1 - segProgress * 0.7);

        ctx.fillStyle = i % 2 === 0 ? '#ff6b6b' : '#ffb6c1';
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#6fba2c';
        ctx.globalAlpha = alpha * 0.7;
        ctx.beginPath();
        ctx.arc(px - size, py - size, size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.globalAlpha = 1;
}

// ====== 工具函数 ======

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

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return { r: 121, g: 79, b: 39 };
  return {
    r: parseInt(m[1]!, 16),
    g: parseInt(m[2]!, 16),
    b: parseInt(m[3]!, 16),
  };
}

function lerpColor(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
  t: number,
): string {
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bv = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r},${g},${bv})`;
}
```

- [ ] **步骤 20.2：运行 typecheck**

```bash
pnpm typecheck
```

预期：无错误。如有类型错误修复后重试。

- [ ] **步骤 20.3：Commit**

```bash
git add src/game/render/layers/SnakeLayer.ts
git commit -m "feat(render): 蛇身渲染升级（渐变/耳朵/帽子/尾巴摆动/转弯弧线/死亡动画）"
```

---

## 任务 21：FoodLayer 渲染升级

**文件：**

- 修改：`src/game/render/layers/FoodLayer.ts`

**职责：** 替换阶段 1 的纯色圆形，使用 sprites.ts 中的 Canvas 2D 代码绘制水果；添加正弦浮动动画；流星添加拖尾渐变效果；金苹果添加旋转光晕。

- [ ] **步骤 21.1：重写 `src/game/render/layers/FoodLayer.ts`**

```ts
import type { Food } from '@/game/types';
import { drawFoodSprite } from '@/game/render/sprites';

export function drawFoodLayer(
  ctx: CanvasRenderingContext2D,
  foods: readonly Food[],
  cellW: number,
  cellH: number,
  animTime: number,
): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (const f of foods) {
    const baseX = f.cell.x * cellW + cellW / 2;
    const baseY = f.cell.y * cellH + cellH / 2;
    const size = Math.min(cellW, cellH) * 0.8;

    // 浮动动画
    const floatY = Math.sin(animTime * 1.5 + f.cell.x * 0.7 + f.cell.y * 0.3) * cellH * 0.12;
    const x = baseX;
    const y = baseY + floatY;

    // 流星拖尾
    if (f.kind === 'meteor') {
      drawMeteorTrail(ctx, x, y, size, animTime);
    }

    // 绘制食物 sprite
    drawFoodSprite(ctx, f.kind, x, y, size, animTime);

    // 通用高光覆盖（sprite 已有高光，这里再补一层全局环境光）
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.arc(x, y - size * 0.1, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMeteorTrail(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, size: number, time: number,
): void {
  const trailLen = size * 1.2;
  const angle = time * 0.8; // 缓慢旋转拖尾方向
  const sx = cx - Math.cos(angle) * trailLen;
  const sy = cy - Math.sin(angle) * trailLen;

  const grad = ctx.createLinearGradient(sx, sy, cx, cy);
  grad.addColorStop(0, 'rgba(120, 80, 220, 0)');
  grad.addColorStop(0.5, 'rgba(120, 80, 220, 0.25)');
  grad.addColorStop(1, 'rgba(120, 80, 220, 0.5)');
  ctx.strokeStyle = grad;
  ctx.lineWidth = size * 0.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(cx, cy);
  ctx.stroke();
}
```

- [ ] **步骤 21.2：运行 typecheck**

```bash
pnpm typecheck
```

预期：无错误。

- [ ] **步骤 21.3：Commit**

```bash
git add src/game/render/layers/FoodLayer.ts
git commit -m "feat(render): 食物渲染升级（代码绘水果+浮动动画+流星拖尾+金苹果光晕）"
```

---

## 任务 22：GrassLayer 渲染升级

**文件：**

- 修改：`src/game/render/layers/GrassLayer.ts`

**职责：** 在棋盘背景上叠加噪点纹理（通过 grassNoise token）、边缘渐隐 vignette 效果、以及装饰物放置。

- [ ] **步骤 22.1：重写 `src/game/render/layers/GrassLayer.ts`**

```ts
import type { ThemeTokens, DecorationDef } from '@/game/types';
import { drawCherryTree } from '@/game/render/sprites';

export function drawGrassLayer(
  ctx: CanvasRenderingContext2D,
  cellW: number,
  cellH: number,
  boardSize: number,
  theme: ThemeTokens,
  decorations: DecorationDef[],
): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.clearRect(0, 0, w, h);

  // 双色棋盘
  for (let x = 0; x < boardSize; x++) {
    for (let y = 0; y < boardSize; y++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? theme.grassA : theme.grassB;
      ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
    }
  }

  // 网格线
  ctx.strokeStyle = 'rgba(0,0,0,0.05)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= boardSize; x++) {
    ctx.beginPath();
    ctx.moveTo(x * cellW, 0);
    ctx.lineTo(x * cellW, h);
    ctx.stroke();
  }
  for (let y = 0; y <= boardSize; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellH);
    ctx.lineTo(w, y * cellH);
    ctx.stroke();
  }

  // 噪点纹理
  if (theme.grassNoise) {
    drawNoiseOverlay(ctx, w, h, theme.grassNoise);
  }

  // 边缘渐隐 vignette
  if (theme.vignette) {
    drawVignette(ctx, w, h, theme.vignette);
  }

  // 装饰物
  for (const deco of decorations) {
    drawDecorations(ctx, deco, boardSize, cellW, cellH, w, h);
  }
}

function drawNoiseOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, color: string): void {
  ctx.fillStyle = color;
  const dotCount = 200;
  for (let i = 0; i < dotCount; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    ctx.fillRect(x, y, 1, 1);
  }
}

function drawVignette(ctx: CanvasRenderingContext2D, w: number, h: number, color: string): void {
  const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.35, w / 2, h / 2, w * 0.72);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, color);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function drawDecorations(
  ctx: CanvasRenderingContext2D,
  deco: DecorationDef,
  boardSize: number,
  cellW: number,
  cellH: number,
  w: number,
  h: number,
): void {
  const count = Math.floor(deco.density * boardSize * boardSize);
  const size = cellW * 2.5;

  for (let i = 0; i < count; i++) {
    let gx: number, gy: number;

    if (deco.zone === 'border') {
      // 只在棋盘边缘 2 格内放置
      const edge = Math.floor(Math.random() * 4);
      switch (edge) {
        case 0: gx = Math.floor(Math.random() * boardSize); gy = 0; break;
        case 1: gx = Math.floor(Math.random() * boardSize); gy = boardSize - 1; break;
        case 2: gx = 0; gy = Math.floor(Math.random() * boardSize); break;
        default: gx = boardSize - 1; gy = Math.floor(Math.random() * boardSize);
      }
    } else {
      gx = Math.floor(Math.random() * (boardSize - 2)) + 1;
      gy = Math.floor(Math.random() * (boardSize - 2)) + 1;
    }

    const px = gx * cellW + cellW / 2;
    const py = gy * cellH + cellH / 2;

    // 按 spriteKey 路由到对应绘制函数（阶段 2 只有 cherry_tree）
    if (deco.spriteKey === 'cherry_tree') {
      drawCherryTree(ctx, px, py, size);
    }
  }
}
```

- [ ] **步骤 22.2：运行 typecheck**

```bash
pnpm typecheck
```

预期：无错误。

- [ ] **步骤 22.3：Commit**

```bash
git add src/game/render/layers/GrassLayer.ts
git commit -m "feat(render): 草地升级（噪点纹理+边缘渐隐+装饰物放置）"
```

---

## 任务 23：EffectsLayer 特效实现

**文件：**

- 修改：`src/game/render/layers/EffectsLayer.ts`

**职责：** 管理活跃的粒子列表，每帧更新并绘制。支持类型：`eat`（吃食物星星爆散）、`screenShake`（死亡震屏）、`unlockFlash`（全屏闪光）。

- [ ] **步骤 23.1：重写 `src/game/render/layers/EffectsLayer.ts`**

```ts
import { drawStar, drawSparkle } from '@/game/render/sprites';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;      // 剩余生命 ms
  maxLife: number;
  size: number;
  color: string;
  kind: 'star' | 'sparkle';
}

export interface ScreenShake {
  intensity: number;     // 最大偏移像素
  remainingMs: number;
  totalMs: number;
}

interface FlashEffect {
  alpha: number;         // 0~1
  remainingMs: number;
}

let particles: Particle[] = [];
let shake: ScreenShake | null = null;
let flash: FlashEffect | null = null;

/** 在指定位置生成吃食物星星粒子 */
export function spawnEatParticles(gridX: number, gridY: number, cellW: number, cellH: number, foodKind: string): void {
  const cx = gridX * cellW + cellW / 2;
  const cy = gridY * cellH + cellH / 2;
  const count = 8;
  const colors = ['#ffeaa7', '#ffb6c1', '#6fba2c', '#19c8b9', '#ff6b6b'];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const speed = cellW * 0.06 + Math.random() * cellW * 0.06;
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 400 + Math.random() * 200,
      maxLife: 400 + Math.random() * 200,
      size: cellW * 0.08 + Math.random() * cellW * 0.06,
      color: colors[Math.floor(Math.random() * colors.length)]!,
      kind: 'star',
    });
  }
}

/** 触发震屏 */
export function triggerScreenShake(intensity: number, durationMs: number): void {
  shake = { intensity, remainingMs: durationMs, totalMs: durationMs };
}

/** 触发全屏闪光 */
export function triggerUnlockFlash(durationMs: number): void {
  flash = { alpha: 1, remainingMs: durationMs };
}

/** 每帧调用，dt 为距离上次调用的毫秒数 */
export function drawEffectsLayer(
  ctx: CanvasRenderingContext2D,
  dt: number,
): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  ctx.save();

  // 震屏偏移
  let shakeDx = 0, shakeDy = 0;
  if (shake && shake.remainingMs > 0) {
    const progress = 1 - shake.remainingMs / shake.totalMs;
    const decay = 1 - progress;
    const angle = Math.random() * Math.PI * 2;
    shakeDx = Math.cos(angle) * shake.intensity * decay;
    shakeDy = Math.sin(angle) * shake.intensity * decay;
    ctx.translate(shakeDx, shakeDy);
    shake.remainingMs -= dt;
    if (shake.remainingMs <= 0) shake = null;
  }

  // 更新和绘制粒子
  ctx.clearRect(-shakeDx, -shakeDy, w, h);
  particles = particles.filter((p) => {
    p.x += p.vx * (dt / 16);
    p.y += p.vy * (dt / 16);
    p.vy += 0.05 * (dt / 16); // 重力
    p.life -= dt;

    if (p.life <= 0) return false;

    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    if (p.kind === 'star') {
      drawStar(ctx, p.x, p.y, p.size * (1 - alpha * 0.5), p.color);
    } else {
      drawSparkle(ctx, p.x, p.y, p.size);
    }
    ctx.globalAlpha = 1;
    return true;
  });

  // 全屏闪光
  if (flash && flash.remainingMs > 0) {
    flash.alpha = flash.remainingMs / (flash.remainingMs + dt); // 简化衰减
    ctx.fillStyle = `rgba(255,255,255,${flash.alpha})`;
    ctx.fillRect(-shakeDx, -shakeDy, w, h);
    flash.remainingMs -= dt;
    if (flash.remainingMs <= 0) flash = null;
  }

  ctx.restore();
}

/** 清理所有特效（reset 时调用） */
export function clearEffects(): void {
  particles = [];
  shake = null;
  flash = null;
}
```

- [ ] **步骤 23.2：运行 typecheck**

```bash
pnpm typecheck
```

预期：无错误。

- [ ] **步骤 23.3：Commit**

```bash
git add src/game/render/layers/EffectsLayer.ts
git commit -m "feat(render): 特效系统实现（吃食物粒子+震屏+解锁闪光）"
```

---

## 任务 24：Renderer 升级 + alpha 插值接入

**文件：**

- 修改：`src/game/render/Renderer.ts`
- 修改：`src/game/render/theme.ts`
- 修改：`src/components/GameCanvas.vue`

**职责：** Renderer 追踪 `animationTime`（累积秒数），传递给各层；正确处理 alpha 插值；管理死亡动画状态；触发特效。GameCanvas 负责在 eat 事件时调用特效生成函数。

- [ ] **步骤 24.1：重写 `src/game/render/Renderer.ts`**

```ts
import type { GameState, ThemeTokens, DecorationDef } from '@/game/types';
import { drawGrassLayer } from '@/game/render/layers/GrassLayer';
import { drawFoodLayer } from '@/game/render/layers/FoodLayer';
import { drawSnakeLayer } from '@/game/render/layers/SnakeLayer';
import { drawEffectsLayer, clearEffects, triggerScreenShake } from '@/game/render/layers/EffectsLayer';
import { drawObstacleLayer } from '@/game/render/layers/ObstacleLayer';

export class Renderer {
  private canvases: Record<string, HTMLCanvasElement> = {};
  private contexts: Record<string, CanvasRenderingContext2D> = {};
  private cellW = 0;
  private cellH = 0;
  private boardSize: number;
  private theme: ThemeTokens;
  private decorations: DecorationDef[];
  private animTime = 0;
  private lastFrameTime = 0;
  private isDead = false;
  private deathTime = 0;

  constructor(
    container: HTMLElement,
    boardSize: number,
    theme: ThemeTokens,
    decorations: DecorationDef[],
  ) {
    this.boardSize = boardSize;
    this.theme = theme;
    this.decorations = decorations;
    this.cellW = Math.min(container.clientWidth, boardSize * 64) / boardSize;
    this.cellH = this.cellW;
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
    this.drawGrass();
  }

  resize(containerW: number, _containerH: number): void {
    const size = Math.min(containerW, this.boardSize * 64);
    this.cellW = size / this.boardSize;
    this.cellH = this.cellW;
    for (const c of Object.values(this.canvases)) {
      c.width = this.cellW * this.boardSize;
      c.height = this.cellH * this.boardSize;
    }
    this.drawGrass();
  }

  draw(state: GameState, alpha: number): void {
    const now = performance.now();
    const dt = this.lastFrameTime ? now - this.lastFrameTime : 16;
    this.lastFrameTime = now;
    this.animTime += dt / 1000;

    drawFoodLayer(this.ctx('food'), state.foods, this.cellW, this.cellH, this.animTime);
    drawObstacleLayer(this.ctx('obstacle'), state.obstacles, this.cellW, this.cellH);
    drawSnakeLayer(this.ctx('snake'), state.snake, this.cellW, this.cellH, {
      alpha,
      animTime: this.animTime,
      isDead: this.isDead,
      deathTime: this.deathTime,
      theme: this.theme,
    });
    drawEffectsLayer(this.ctx('effects'), dt);
  }

  /** 触发死亡动画 */
  triggerDeath(): void {
    this.isDead = true;
    this.deathTime = 0;
    triggerScreenShake(6, 400);
  }

  /** 触发吃食物粒子 */
  triggerEatParticles(gridX: number, gridY: number, _foodKind: string): void {
    const { spawnEatParticles } = require('@/game/render/layers/EffectsLayer');
    spawnEatParticles(gridX, gridY, this.cellW, this.cellH, _foodKind);
  }

  /** 重置动画状态 */
  resetAnimation(): void {
    this.isDead = false;
    this.deathTime = 0;
    this.animTime = 0;
    clearEffects();
  }

  private drawGrass(): void {
    drawGrassLayer(
      this.ctx('grass'), this.cellW, this.cellH, this.boardSize,
      this.theme, this.decorations,
    );
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

- [ ] **步骤 24.2：更新 `src/game/render/theme.ts`**

```ts
import type { ThemeTokens } from '@/game/types';

export function applyTheme(ctx: CanvasRenderingContext2D, theme: ThemeTokens): void {
  // 将主题的 accent 色应用到全局 Canvas 环境（如阴影色等）
  ctx.shadowColor = theme.accent;
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}
```

- [ ] **步骤 24.3：更新 `src/components/GameCanvas.vue`**

修改 initGame 中 `onRender` 回调和 `bus.on('eat')` 处理：

```ts
// 在 initGame 中替换 onRender 和 eat 回调：

session.onRender((alpha, state) => {
  if (!state.snake.alive && !renderer?.hasTriggeredDeath) {
    renderer?.triggerDeath();
    (renderer as any).hasTriggeredDeath = true;
  }
  renderer?.draw(state, alpha);
});

session.bus.on('eat', (p) => {
  const state = session?.state;
  if (state) {
    const food = state.foods.find(f =>
      f.cell.x === state.snake.body[0]!.x && f.cell.y === state.snake.body[0]!.y
    ) ?? p.food;
    renderer?.triggerEatParticles(food.cell.x, food.cell.y, p.food.kind);
  }
  emit('eat', { foodKind: p.food.kind, snakeLength: p.snakeLength });
});
```

同时更新 Renderer 构造函数调用：

```ts
renderer = new Renderer(container, BOARD_SIZE, island.theme, island.decorations);
```

在 `reset()` 函数中添加：

```ts
renderer?.resetAnimation();
(renderer as any).hasTriggeredDeath = false;
```

- [ ] **步骤 24.4：运行 typecheck + lint**

```bash
pnpm typecheck && pnpm lint
```

预期：无错误。如有 warnings 修复后重试。

- [ ] **步骤 24.5：Commit**

```bash
git add src/game/render/Renderer.ts src/game/render/theme.ts src/components/GameCanvas.vue
git commit -m "feat(render): Renderer 升级（animationTime+alpha 插值+死亡动画+特效触发）"
```

---

## 任务 25：HomeView 完整升级

**文件：**

- 创建：`src/components/IslandPicker.vue`
- 修改：`src/views/HomeView.vue`

**职责：** 主菜单升级为动物森友会风格——使用 animal-island-vue 的 Title 飘带组件、自定义 IslandPicker（5 张卡片，仅春樱解锁其余灰显）、Footer 底部装饰。如果 `animal-island-vue` 不可用，则用自定义纯 CSS 实现等价的动森风格（圆角 pill、3D 阴影、温暖配色）。

- [ ] **步骤 25.1：创建 `src/components/IslandPicker.vue`**

```vue
<template>
  <div class="island-picker">
    <h3 class="picker-label">选择岛屿</h3>
    <div class="island-cards">
      <button
        v-for="island in islandList"
        :key="island.id"
        class="island-card"
        :class="{ unlocked: island.unlocked, selected: island.id === model }"
        :disabled="!island.unlocked"
        @click="select(island.id)"
      >
        <div class="card-icon">{{ island.emoji }}</div>
        <div class="card-name">{{ island.name }}</div>
        <div v-if="!island.unlocked" class="card-lock">🔒</div>
        <div v-if="!island.unlocked" class="card-hint">{{ island.hint }}</div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { IslandId } from '@/game/types';
import { ISLANDS, ISLAND_ORDER } from '@/game/levels/islands';
import { useProgressStore } from '@/stores/progress';

defineProps<{ model: IslandId }>();
const emit = defineEmits<{ 'update:model': [id: IslandId] }>();

const progress = useProgressStore();

const ISLAND_EMOJI: Record<IslandId, string> = {
  spring: '🌸', summer: '🌊', autumn: '🍂', winter: '❄️', fossil: '🦴',
};

const islandList = computed(() =>
  ISLAND_ORDER.map((id) => {
    const island = ISLANDS[id];
    const unlocked = progress.getHighScore('spring') >= island.unlockScore
      || (island.unlockScore === 0);
    return {
      id,
      name: island.name,
      emoji: ISLAND_EMOJI[id],
      unlocked,
      hint: island.unlockSpecial === 'all_fossils'
        ? '集齐化石解锁'
        : `累计 ${island.unlockScore} 分解锁`,
    };
  }),
);

function select(id: IslandId) {
  emit('update:model', id);
}
</script>

<style lang="less" scoped>
@import '@/styles/tokens.less';

.picker-label {
  font-size: 18px;
  color: @text-color;
  font-weight: 700;
  margin: 0 0 16px;
  text-align: center;
}
.island-cards {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}
.island-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 20px;
  border: 2.5px solid @border-color-light;
  border-radius: 20px;
  background: @bg-color-content;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 90px;
  font-family: inherit;

  &.unlocked {
    &:hover {
      border-color: @primary-color;
      transform: translateY(-2px);
      box-shadow: 0 3px 10px rgba(61, 52, 40, 0.1);
    }
    &.selected {
      border-color: @primary-color;
      background: #e6f9f6;
      box-shadow: 0 0 0 3px rgba(25, 200, 185, 0.15);
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
.card-icon { font-size: 32px; }
.card-name { font-size: 13px; font-weight: 600; color: @text-color; }
.card-lock { font-size: 14px; margin-top: 2px; }
.card-hint { font-size: 10px; color: @text-color-secondary; text-align: center; max-width: 80px; }
</style>
```

- [ ] **步骤 25.2：重写 `src/views/HomeView.vue`**

```vue
<template>
  <main class="home">
    <div class="title-area">
      <h1 class="title">动森贪吃蛇</h1>
      <p class="subtitle">在无人岛上收集水果吧</p>
    </div>

    <IslandPicker v-model="selectedIsland" />

    <div class="menu-buttons">
      <button class="btn-primary btn-free" @click="startFree">
        自由散步
      </button>
      <button class="btn-primary btn-daily" @click="startDaily">
        今日挑战
      </button>
    </div>

    <div class="footer-links">
      <button class="link-btn" @click="goSettings">设置</button>
    </div>

    <div class="home-footer" />
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { IslandId } from '@/game/types';
import IslandPicker from '@/components/IslandPicker.vue';

const router = useRouter();
const selectedIsland = ref<IslandId>('spring');

function startFree() {
  router.push({ name: 'game', params: { island: selectedIsland.value }, query: { mode: 'free' } });
}

function startDaily() {
  router.push({ name: 'game', params: { island: selectedIsland.value }, query: { mode: 'daily' } });
}

function goSettings() {
  router.push({ name: 'settings' });
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
  padding: 48px 20px 32px;
  gap: 32px;
  background: @bg-color;
}
.title-area { text-align: center; }
.title {
  font-size: 48px;
  font-weight: 800;
  color: @text-color;
  margin: 0;
  letter-spacing: 0.02em;
  text-shadow: 0 2px 0 rgba(121, 79, 39, 0.1);
}
.subtitle {
  font-size: 16px;
  color: @text-color-secondary;
  margin: 8px 0 0;
  font-weight: 500;
}
.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 240px;
}
.btn-primary {
  padding: 14px 32px;
  border: 2.5px solid @primary-color;
  border-radius: 50px;
  background: @primary-color;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.02em;
  box-shadow: 0 5px 0 0 #11a89b;

  &:hover {
    background: #3dd4c6;
    border-color: #3dd4c6;
    transform: translateY(-1px);
    box-shadow: 0 6px 0 0 #11a89b;
  }
  &:active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 0 #11a89b;
  }

  &.btn-daily {
    background: @bg-color-content;
    border-color: @border-color-light;
    color: @text-color;
    box-shadow: 0 5px 0 0 #d4c9b4;
    &:hover { border-color: @primary-color; color: @primary-color; box-shadow: 0 6px 0 0 #d4c9b4; }
    &:active { box-shadow: 0 1px 0 0 #d4c9b4; }
  }
}
.footer-links { margin-top: 8px; }
.link-btn {
  background: none;
  border: none;
  color: @text-color-secondary;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
  &:hover { color: @primary-color; }
}
.home-footer {
  width: 100%;
  height: 60px;
  margin-top: auto;
  background: linear-gradient(180deg, transparent 0%, @bg-color 30%);
  border-top: 2px dashed @border-color-light;
}
</style>
```

- [ ] **步骤 25.3：运行 typecheck + lint**

```bash
pnpm typecheck && pnpm lint
```

预期：无错误。

- [ ] **步骤 25.4：Commit**

```bash
git add src/components/IslandPicker.vue src/views/HomeView.vue
git commit -m "feat(ui): HomeView 升级（IslandPicker+飘带标题+Footer）"
```

---

## 任务 26：SettingsView 新建 + 路由注册

**文件：**

- 创建：`src/views/SettingsView.vue`
- 修改：`src/router/index.ts`

**职责：** 提供音量（BGM/SFX）、难度（闲庭/慢跑/狂奔）的设置页面。阶段 2 用本地状态 + Pinia 持久化，阶段 4 再接入 Howler.js 实际音量控制。

- [ ] **步骤 26.1：创建 `src/views/SettingsView.vue`**

```vue
<template>
  <main class="settings">
    <h2 class="settings-title">设置</h2>

    <section class="settings-group">
      <h3>难度</h3>
      <div class="radio-group">
        <button
          v-for="opt in difficulties"
          :key="opt.id"
          class="radio-btn"
          :class="{ active: settings.difficulty === opt.id }"
          @click="settings.setDifficulty(opt.id)"
        >
          {{ opt.label }}
        </button>
      </div>
    </section>

    <section class="settings-group">
      <h3>音量</h3>
      <div class="slider-row">
        <label>BGM</label>
        <input
          v-model.number="bgmVolume"
          type="range"
          min="0"
          max="100"
          class="slider"
        >
        <span class="slider-val">{{ bgmVolume }}</span>
      </div>
      <div class="slider-row">
        <label>SFX</label>
        <input
          v-model.number="sfxVolume"
          type="range"
          min="0"
          max="100"
          class="slider"
        >
        <span class="slider-val">{{ sfxVolume }}</span>
      </div>
    </section>

    <button class="back-btn" @click="goBack">
      返回主菜单
    </button>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { DifficultyId } from '@/game/types';
import { useSettingsStore } from '@/stores/settings';

const router = useRouter();
const settings = useSettingsStore();

const difficulties: { id: DifficultyId; label: string }[] = [
  { id: 'casual', label: '闲庭' },
  { id: 'normal', label: '慢跑' },
  { id: 'hard', label: '狂奔' },
];

const bgmVolume = ref(50);
const sfxVolume = ref(70);

function goBack() {
  router.push({ name: 'home' });
}
</script>

<style lang="less" scoped>
@import '@/styles/tokens.less';

.settings {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 48px 24px;
  gap: 32px;
  background: @bg-color;
}
.settings-title {
  font-size: 32px;
  font-weight: 800;
  color: @text-color;
  margin: 0;
}
.settings-group {
  width: 100%;
  max-width: 360px;
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: @text-color;
    margin: 0 0 12px;
  }
}
.radio-group {
  display: flex;
  gap: 8px;
}
.radio-btn {
  flex: 1;
  padding: 10px 16px;
  border: 2px solid @border-color-light;
  border-radius: 50px;
  background: @bg-color-content;
  color: @text-color-body;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &.active {
    background: @primary-color;
    border-color: @primary-color;
    color: #fff;
    box-shadow: 0 3px 0 0 #11a89b;
  }
  &:hover:not(.active) { border-color: @primary-color; color: @primary-color; }
}
.slider-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  label {
    min-width: 40px;
    font-size: 14px;
    font-weight: 600;
    color: @text-color;
  }
}
.slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: @border-color-light;
  border-radius: 3px;
  outline: none;
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: @primary-color;
    border: 2px solid #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.15);
    cursor: pointer;
  }
}
.slider-val {
  min-width: 30px;
  font-size: 14px;
  font-weight: 700;
  color: @text-color;
  text-align: right;
}
.back-btn {
  margin-top: 16px;
  padding: 10px 32px;
  border: 2px solid @border-color-light;
  border-radius: 50px;
  background: @bg-color-content;
  color: @text-color;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: @primary-color; color: @primary-color; }
}
</style>
```

- [ ] **步骤 26.2：更新 `src/router/index.ts`**

```ts
import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import GameView from '@/views/GameView.vue';
import SettingsView from '@/views/SettingsView.vue';

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/game/:island?', name: 'game', component: GameView, props: true },
    { path: '/settings', name: 'settings', component: SettingsView },
  ],
});
```

- [ ] **步骤 26.3：运行 typecheck + lint**

```bash
pnpm typecheck && pnpm lint
```

预期：无错误。

- [ ] **步骤 26.4：Commit**

```bash
git add src/views/SettingsView.vue src/router/index.ts
git commit -m "feat(ui): 新建 SettingsView 设置页（难度+音量+路由注册）"
```

---

## 任务 27：全局字体引入 + 视觉微调

**文件：**

- 修改：`index.html`（引入 Google Fonts）
- 修改：`src/styles/tokens.less`（全局字体 + 组件微调）

**职责：** 引入 Nunito + Noto Sans SC 圆体字；确保全局默认使用动森字体；微调 GameHUD、GameOverModal 的视觉风格与按钮 3D 效果一致。

- [ ] **步骤 27.1：更新 `index.html` 引入字体**

在 `<head>` 中添加：

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Noto+Sans+SC:wght@400;500;700&display=swap"
  rel="stylesheet"
/>
```

- [ ] **步骤 27.2：更新 `src/styles/tokens.less`**

```less
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Noto+Sans+SC:wght@400;500;700&display=swap');

// 复用 animal-island-vue 的色彩 token
@primary-color: #19c8b9;
@text-color: #794f27;
@text-color-body: #725d42;
@bg-color: #f8f8f0;
@bg-color-content: rgb(247, 243, 223);
@border-color-light: #c4b89e;
@success-color: #6fba2c;
@text-color-secondary: #a09080;
@bg-color-secondary: #e8e4d8;

body {
  margin: 0;
  font-family: Nunito, 'Noto Sans SC',
    -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-weight: 500;
  background: @bg-color;
  color: @text-color-body;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
#app { min-height: 100vh; }
```

- [ ] **步骤 27.3：微调 `src/components/GameHUD.vue` 样式**

将 `.hud-pause` 按钮升级为 3D 按键风格：

```less
.hud-pause {
  padding: 6px 20px;
  border: 2px solid @primary-color;
  border-radius: 50px;
  background: @primary-color;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.02em;
  box-shadow: 0 3px 0 0 #11a89b;
  transition: all 0.2s;
  &:hover {
    background: #3dd4c6;
    border-color: #3dd4c6;
    transform: translateY(-1px);
    box-shadow: 0 4px 0 0 #11a89b;
  }
  &:active {
    transform: translateY(1px);
    box-shadow: 0 1px 0 0 #11a89b;
  }
}
```

- [ ] **步骤 27.4：微调 `src/components/GameOverModal.vue` 按钮**

将按钮升级为 3D 风格：

```less
button {
  padding: 10px 28px;
  border: 2px solid @primary-color;
  border-radius: 50px;
  background: @primary-color;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.02em;
  box-shadow: 0 4px 0 0 #11a89b;
  transition: all 0.2s;
  &:hover {
    background: #3dd4c6;
    border-color: #3dd4c6;
    transform: translateY(-1px);
    box-shadow: 0 5px 0 0 #11a89b;
  }
  &:active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 0 #11a89b;
  }
  &.secondary {
    background: @bg-color-secondary;
    border-color: @border-color-light;
    color: @text-color;
    box-shadow: 0 4px 0 0 #d4c9b4;
    &:hover { border-color: @primary-color; color: @primary-color; box-shadow: 0 5px 0 0 #d4c9b4; }
    &:active { box-shadow: 0 1px 0 0 #d4c9b4; }
  }
}
```

- [ ] **步骤 27.5：运行 typecheck + lint 全项目**

```bash
pnpm typecheck && pnpm lint
```

预期：无错误。

- [ ] **步骤 27.6：Commit**

```bash
git add index.html src/styles/tokens.less src/components/GameHUD.vue src/components/GameOverModal.vue
git commit -m "feat(ui): 全局字体引入+按钮3D风格统一+视觉微调"
```

---

## 任务 28：端到端验收

**无需修改文件**，纯验证步骤。

- [ ] **步骤 28.1：启动开发服务器**

```bash
pnpm dev
```

- [ ] **步骤 28.2：验证 HomeView**

1. 打开 `http://localhost:6374/` → 看到动森风格主菜单
2. 标题 "动森贪吃蛇" 使用圆体字（Nunito/Noto Sans SC）
3. 岛屿选择器显示 5 张卡片（春樱亮、其余灰显带锁+解锁提示）
4. 点击 "自由散步" → 以春樱岛进入游戏
5. 返回主菜单 → 点击 "设置" → 进入设置页
6. 设置页可切换难度、拖动音量滑块 → 返回主菜单

- [ ] **步骤 28.3：验证游戏中渲染**

1. 进入游戏后观察：
   - 棋盘草地有双色格 + 噪点纹理 + 边缘渐暗
   - 蛇身从头到尾呈棕色渐变（深→浅）
   - 蛇头有白色眼睛（定期眨眼）+ 三角耳朵 + 樱花瓣帽子
   - 尾巴最后一节有微小上下摆动
   - 食物是代码绘制的带高光水果（而非纯色圆）并有浮动动画
   - 如果遇到流星食物，有紫色拖尾 + 光晕
2. 控制蛇吃食物 → 食物位置爆散出彩色星星粒子
3. 蛇撞墙 → 死亡动画（身体逐节爆开为水果粒子）+ 震屏效果
4. 死亡弹窗显示，点击"再来一局"→ 游戏重置

- [ ] **步骤 28.4：运行全部已有单测**

```bash
pnpm test
```

预期：所有阶段 1 的测试仍然通过（Snake/Board/Food/Rng/EventBus/GameLoop/InputController/FreeMode/DailyMode/GameSession）。

- [ ] **步骤 28.5：验证 typecheck + lint**

```bash
pnpm typecheck && pnpm lint
```

预期：无错误。

- [ ] **步骤 28.6：Commit 验收**

```bash
git add -A
git commit -m "chore: 阶段 2 完成 - 动森视觉化验收通过"
```

---

## 阶段 2 完成标准

- [x] 蛇身头尾渐变色渲染
- [x] 蛇头眼睛 + 眨眼动画 + 三角耳朵
- [x] 代码绘制帽子 sprite（按岛屿切换）
- [x] 尾巴正弦摆动 + 转弯贝塞尔弧线
- [x] 6 种水果 Canvas 2D 代码绘制（可识别形态 + 高光）
- [x] 食物浮动动画
- [x] 流星拖尾 + 光晕
- [x] 金苹果旋转光晕 + sparkle
- [x] 吃食物粒子爆散特效
- [x] 死亡动画（身体逐节爆开 + 震屏）
- [x] 草地噪点纹理 + 边缘渐隐 vignette
- [x] 装饰物放置（春樱岛边缘樱花树）
- [x] 渲染 alpha 平滑插值
- [x] HomeView 岛屿选择器（5 卡 + 解锁状态）
- [x] SettingsView 设置页（难度 + 音量）
- [x] 全局圆体字（Nunito + Noto Sans SC）
- [x] 按钮 3D 立体风格统一
- [x] 所有已有单测通过
- [x] typecheck + lint 无错误

---

## 附录：阶段 3 预留扩展点

以下在阶段 2 已预留接口，阶段 3 直接接入：

| 当前实现 | 阶段 3 扩展 |
|---|---|
| `sprites.ts` 中 `drawFoodSprite()` switch | 新增 `watermelon`/`persimmon`/`chestnut`/`fossil_*` 分支 |
| `GrassLayer.drawDecorations()` switch by `spriteKey` | 新增 `coconut_tree`/`maple_tree`/`pine_tree`/`fossil_pit` |
| `EffectsLayer.spawnEatParticles()` | 新增 `unlockFlash` 成就解锁时调用 |
| `Renderer.triggerDeath()` | 接入 `AudioManager.playSFX('die')` |
| `SettingsView` BGM/SFX 滑块 | 通过 `useSettingsStore` 持久化 + AudioManager 实际控制 |
| `ObstacleLayer` 空壳 | 接入每日挑战障碍物绘制 |
