import type { ThemeTokens } from '@/game/types';

export function applyTheme(ctx: CanvasRenderingContext2D, theme: ThemeTokens): void {
  ctx.shadowColor = theme.accent;
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}
