import type { ThemeTokens } from '@/game/types';

export function drawGrassLayer(
  ctx: CanvasRenderingContext2D,
  cellW: number,
  cellH: number,
  boardSize: number,
  theme: ThemeTokens,
): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (let x = 0; x < boardSize; x++) {
    for (let y = 0; y < boardSize; y++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? theme.grassA : theme.grassB;
      ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
    }
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= boardSize; x++) {
    ctx.beginPath();
    ctx.moveTo(x * cellW, 0);
    ctx.lineTo(x * cellW, boardSize * cellH);
    ctx.stroke();
  }
  for (let y = 0; y <= boardSize; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellH);
    ctx.lineTo(boardSize * cellW, y * cellH);
    ctx.stroke();
  }
}
