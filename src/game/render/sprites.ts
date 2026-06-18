// sprites.ts — Canvas 2D 代码绘制的动森风水果/帽子/粒子 sprite
// 所有函数签名为 (ctx, x, y, size, options?) ，x/y 为中心点

export interface SpriteOptions {
  scale?: number;
  rotation?: number;
  alpha?: number;
}

/** 红苹果+绿叶，动森圆润风 */
export function drawApple(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const r = size * 0.42;
  ctx.save();
  ctx.translate(x, y);
  const grad = ctx.createRadialGradient(-r * 0.15, -r * 0.2, r * 0.1, 0, 0, r);
  grad.addColorStop(0, '#ff5a5a');
  grad.addColorStop(0.7, '#e63946');
  grad.addColorStop(1, '#b71c1c');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#794f27';
  ctx.lineWidth = Math.max(1.5, size * 0.06);
  ctx.stroke();
  ctx.fillStyle = '#b71c1c';
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.85, r * 0.2, r * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#5a8a3c';
  ctx.lineWidth = Math.max(1, size * 0.04);
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.88);
  ctx.quadraticCurveTo(r * 0.3, -r * 1.2, r * 0.2, -r * 1.3);
  ctx.stroke();
  ctx.fillStyle = '#6fba2c';
  ctx.beginPath();
  ctx.ellipse(r * 0.25, -r * 1.3, r * 0.2, r * 0.35, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#4a7a1e';
  ctx.lineWidth = Math.max(0.8, size * 0.03);
  ctx.stroke();
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
  drawCherryBody(ctx, -r * 0.6, r * 0.15, r);
  drawCherryBody(ctx, r * 0.6, r * 0.15, r);
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
  ctx.ellipse(0, r * 0.05, r, r * 1.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#794f27';
  ctx.lineWidth = Math.max(1.5, size * 0.06);
  ctx.stroke();
  ctx.strokeStyle = '#d48090';
  ctx.lineWidth = Math.max(0.8, size * 0.03);
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.8);
  ctx.quadraticCurveTo(r * 0.05, -r * 0.1, -r * 0.02, r * 0.9);
  ctx.stroke();
  ctx.fillStyle = '#6fba2c';
  ctx.beginPath();
  ctx.ellipse(r * 0.15, -r * 1.1, r * 0.2, r * 0.35, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#4a7a1e';
  ctx.lineWidth = Math.max(0.8, size * 0.03);
  ctx.stroke();
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
  ctx.fillStyle = '#6fba2c';
  ctx.beginPath();
  ctx.ellipse(0, -r * 1.1, r * 0.18, r * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
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
  ctx.fillStyle = '#9a5a08';
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.88, r * 0.2, r * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#6fba2c';
  ctx.beginPath();
  ctx.ellipse(0, -r * 1.1, r * 0.15, r * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5, r * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }
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
  const glowGrad = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 1.6);
  glowGrad.addColorStop(0, 'rgba(120, 80, 220, 0.4)');
  glowGrad.addColorStop(0.5, 'rgba(100, 60, 200, 0.15)');
  glowGrad.addColorStop(1, 'rgba(80, 40, 180, 0)');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
  ctx.fill();
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
  ctx.fillStyle = 'rgba(40,20,80,0.4)';
  ctx.beginPath(); ctx.arc(r * 0.3, -r * 0.3, r * 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(-r * 0.35, r * 0.2, r * 0.08, 0, Math.PI * 2); ctx.fill();
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
  ctx.fillStyle = '#6fba2c';
  ctx.beginPath();
  ctx.ellipse(0, -r * 1.1, r * 0.18, r * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
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
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const tipX = Math.cos(a) * r;
    const tipY = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(tipX, tipY);
    else ctx.lineTo(tipX, tipY);
    const midA = a + Math.PI / 5;
    ctx.lineTo(Math.cos(midA) * r * 0.4, Math.sin(midA) * r * 0.4);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#794f27';
  ctx.lineWidth = Math.max(1.2, size * 0.05);
  ctx.stroke();
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
  ctx.fillStyle = '#8b6914';
  ctx.fillRect(-size * 0.08, size * 0.05, size * 0.16, size * 0.4);
  ctx.strokeStyle = '#5a3a1a';
  ctx.lineWidth = Math.max(0.8, size * 0.03);
  ctx.strokeRect(-size * 0.08, size * 0.05, size * 0.16, size * 0.4);
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
    default:
      if (kind.startsWith('fossil')) {
        drawFossilPlaceholder(ctx, x, y, size);
      } else {
        drawApple(ctx, x, y, size);
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
  ctx.fillStyle = '#794f27';
  ctx.font = `${r * 1.2}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', 0, 1);
  ctx.restore();
}
