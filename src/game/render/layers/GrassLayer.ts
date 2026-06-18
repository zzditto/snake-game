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

  for (let x = 0; x < boardSize; x++) {
    for (let y = 0; y < boardSize; y++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? theme.grassA : theme.grassB;
      ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
    }
  }

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

  if (theme.grassNoise) {
    drawNoiseOverlay(ctx, w, h, theme.grassNoise);
  }
  if (theme.vignette) {
    drawVignette(ctx, w, h, theme.vignette);
  }
  for (const deco of decorations) {
    drawDecorations(ctx, deco, boardSize, cellW, cellH, w, h);
  }
}

function drawNoiseOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, color: string): void {
  ctx.fillStyle = color;
  for (let i = 0; i < 200; i++) {
    ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
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
      const edge = Math.floor(Math.random() * 4);
      switch (edge) {
        case 0: gx = Math.floor(Math.random() * boardSize); gy = 0; break;
        case 1: gx = Math.floor(Math.random() * boardSize); gy = boardSize - 1; break;
        case 2: gx = 0; gy = Math.floor(Math.random() * boardSize); break;
        default: gx = boardSize - 1; gy = Math.floor(Math.random() * boardSize);
      }
    } else if (deco.zone === 'corner') {
      gx = Math.random() > 0.5 ? 0 : boardSize - 1;
      gy = Math.random() > 0.5 ? 0 : boardSize - 1;
    } else {
      gx = Math.floor(Math.random() * (boardSize - 2)) + 1;
      gy = Math.floor(Math.random() * (boardSize - 2)) + 1;
    }

    const px = gx * cellW + cellW / 2;
    const py = gy * cellH + cellH / 2;

    if (deco.spriteKey === 'cherry_tree') {
      drawCherryTree(ctx, px, py, size);
    }
  }
}
