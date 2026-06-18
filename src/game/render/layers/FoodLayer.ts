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
    ctx.fillStyle = foodColor(f.kind);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
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
