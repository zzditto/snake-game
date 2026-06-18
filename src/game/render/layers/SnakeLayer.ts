import type { SnakeState, ThemeTokens } from '@/game/types';
import { drawHatSprite } from '@/game/render/sprites';

export interface SnakeLayerOptions {
  alpha: number;
  animTime: number;
  isDead: boolean;
  deathTime: number;
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

  if (isDead) {
    drawDeathAnimation(ctx, snake, cellW, cellH, deathTime, theme);
    return;
  }

  const head = snake.body[0]!;
  const bodyStartColor = theme.snakeBodyStart;
  const bodyEndColor = theme.snakeBodyEnd;
  const headColor = theme.snakeHead;

  const startRGB = hexToRgb(bodyStartColor);
  const endRGB = hexToRgb(bodyEndColor);

  for (let i = 0; i < snake.body.length; i++) {
    const seg = snake.body[i]!;
    const t = snake.body.length > 1 ? i / (snake.body.length - 1) : 0;
    const color = i === 0 ? headColor : lerpColor(startRGB, endRGB, t);

    const pad = 2;
    let x = seg.x * cellW + pad;
    let y = seg.y * cellH + pad;
    const w = cellW - pad * 2;
    const h = cellH - pad * 2;
    const r = Math.min(w, h) / 2;

    if (i === snake.body.length - 1 && snake.body.length > 2) {
      const tailOffsetY = Math.sin(animTime * 6 + i * 0.5) * cellH * 0.15;
      y += tailOffsetY;
    }

    ctx.fillStyle = color;
    roundRect(ctx, x, y, w, h, r);
    ctx.fill();

    if (i > 0 && i < snake.body.length - 1) {
      const prev = snake.body[i - 1]!;
      const next = snake.body[i + 1]!;
      if (!(prev.x === next.x || prev.y === next.y)) {
        drawTurnCurve(ctx, seg, prev, next, cellW, cellH, color);
      }
    }
  }

  // 蛇头细节
  if (snake.body.length > 0) {
    const hx = head.x * cellW + cellW / 2;
    const hy = head.y * cellH + cellH / 2;

    const vec = DIR_VEC[snake.direction] ?? { dx: 1, dy: 0 };

    const eyeR = Math.max(2.5, Math.round(cellW * 0.09));
    const pupilR = Math.max(1.2, Math.round(eyeR * 0.5));

    const eye1X = hx - cellW * 0.15 + vec.dx * cellW * 0.12;
    const eye1Y = hy - cellH * 0.12 + vec.dy * cellH * 0.12;
    const eye2X = hx + cellW * 0.15 + vec.dx * cellW * 0.12;
    const eye2Y = hy - cellH * 0.12 + vec.dy * cellH * 0.12;

    const blinkCycle = animTime % 4;
    const blinkRatio = blinkCycle > 3.8 ? 0.2 : 1;

    for (const pos of [[eye1X, eye1Y] as const, [eye2X, eye2Y] as const]) {
      const [ex, ey] = pos;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(ex, ey, eyeR, eyeR * blinkRatio, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#794f27';
      ctx.lineWidth = Math.max(0.8, cellW * 0.02);
      ctx.stroke();
      if (blinkRatio > 0.5) {
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(ex + vec.dx * pupilR * 0.3, ey + vec.dy * pupilR * 0.3, pupilR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 耳朵
    drawEars(ctx, hx, hy, cellW, cellH, vec);

    // 帽子
    if (theme.hatSprite) {
      const hatX = hx + vec.dx * cellW * 0.05;
      const hatY = hy - cellH * 0.42;
      const hatSize = Math.min(cellW, cellH) * 0.8;
      drawHatSprite(ctx, theme.hatSprite, hatX, hatY, hatSize);
    }
  }

  void alpha;
}

function drawEars(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  cellW: number, cellH: number,
  vec: { dx: number; dy: number },
): void {
  const earSize = cellW * 0.2;
  const earY = cy - cellH * 0.32;

  drawEarTriangle(ctx, cx - cellW * 0.25, earY, earSize, false);
  drawEarTriangle(ctx, cx + cellW * 0.25, earY, earSize, true);
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
  ctx.fillStyle = '#e8b8b0';
  ctx.beginPath();
  ctx.ellipse(x + dir * size * 0.5, y - size * 0.4, size * 0.35, size * 0.4, dir * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawTurnCurve(
  ctx: CanvasRenderingContext2D,
  seg: { x: number; y: number },
  prev: { x: number; y: number },
  next: { x: number; y: number },
  cellW: number, cellH: number, color: string,
): void {
  const cx = seg.x * cellW + cellW / 2;
  const cy = seg.y * cellH + cellH / 2;
  const px = prev.x * cellW + cellW / 2;
  const py = prev.y * cellH + cellH / 2;
  const nx = next.x * cellW + cellW / 2;
  const ny = next.y * cellH + cellH / 2;

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
  cellW: number, cellH: number,
  deathTime: number,
  theme: ThemeTokens,
): void {
  const maxDuration = 1.5;
  const progress = Math.min(deathTime / maxDuration, 1);

  if (progress >= 1) return;

  const { body } = snake;

  for (let i = 0; i < body.length; i++) {
    const seg = body[i]!;
    const segProgress = Math.max(0, progress - i * 0.05);

    if (segProgress <= 0) {
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
