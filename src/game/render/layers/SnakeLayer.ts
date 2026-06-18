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
    ctx.fillStyle = i === 0 ? colorHead : colorBody;
    const x = seg.x * cellW + pad;
    const y = seg.y * cellH + pad;
    const w = cellW - pad * 2;
    const h = cellH - pad * 2;
    const r = Math.min(w, h) / 2;
    roundRect(ctx, x, y, w, h, r);
    ctx.fill();
  }

  if (snake.body.length > 0) {
    const head = snake.body[0]!;
    const cx = head.x * cellW + cellW / 2;
    const cy = head.y * cellH + cellH / 2;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx - 4, cy - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 4, cy - 3, 3, 0, Math.PI * 2);
    ctx.fill();
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
