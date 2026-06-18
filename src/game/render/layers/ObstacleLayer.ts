import type { Cell } from '@/game/types';

export function drawObstacleLayer(
  ctx: CanvasRenderingContext2D,
  _obstacles: readonly Cell[],
  _cellW: number,
  _cellH: number,
): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}
