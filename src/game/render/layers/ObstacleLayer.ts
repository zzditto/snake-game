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
  const cx = x + cellW / 2;
  const cy = y + cellH / 2;
  const r = Math.min(cellW, cellH) * 0.35;

  ctx.fillStyle = '#a08060';
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.15, r * 0.85, r * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#5a3a1a';
  ctx.lineWidth = Math.max(1.5, cellW * 0.05);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(90,58,26,0.3)';
  ctx.lineWidth = Math.max(0.5, cellW * 0.02);
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.15, r * 0.3 * i, r * 0.2 * i, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.2, cy - r * 0.05, r * 0.2, r * 0.1, -0.4, 0, Math.PI * 2);
  ctx.fill();
}
