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

    const floatY = Math.sin(animTime * 1.5 + f.cell.x * 0.7 + f.cell.y * 0.3) * cellH * 0.12;
    const x = baseX;
    const y = baseY + floatY;

    if (f.kind === 'meteor') {
      drawMeteorTrail(ctx, x, y, size, animTime);
    }

    drawFoodSprite(ctx, f.kind, x, y, size, animTime);

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
  const angle = time * 0.8;
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
