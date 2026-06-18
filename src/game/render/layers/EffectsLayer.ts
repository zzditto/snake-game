import { drawStar, drawSparkle } from '@/game/render/sprites';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  kind: 'star' | 'sparkle';
}

export interface ScreenShake {
  intensity: number;
  remainingMs: number;
  totalMs: number;
}

interface FlashEffect {
  alpha: number;
  remainingMs: number;
}

let particles: Particle[] = [];
let shake: ScreenShake | null = null;
let flash: FlashEffect | null = null;

export function spawnEatParticles(
  gridX: number,
  gridY: number,
  cellW: number,
  cellH: number,
  _foodKind: string,
): void {
  const cx = gridX * cellW + cellW / 2;
  const cy = gridY * cellH + cellH / 2;
  const count = 8;
  const colors = ['#ffeaa7', '#ffb6c1', '#6fba2c', '#19c8b9', '#ff6b6b'];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const speed = cellW * 0.06 + Math.random() * cellW * 0.06;
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 400 + Math.random() * 200,
      maxLife: 400 + Math.random() * 200,
      size: cellW * 0.08 + Math.random() * cellW * 0.06,
      color: colors[Math.floor(Math.random() * colors.length)]!,
      kind: 'star',
    });
  }
}

export function triggerScreenShake(intensity: number, durationMs: number): void {
  shake = { intensity, remainingMs: durationMs, totalMs: durationMs };
}

export function triggerUnlockFlash(durationMs: number): void {
  flash = { alpha: 1, remainingMs: durationMs };
}

export function drawEffectsLayer(
  ctx: CanvasRenderingContext2D,
  dt: number = 16,
): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  ctx.save();

  let shakeDx = 0, shakeDy = 0;
  if (shake && shake.remainingMs > 0) {
    const progress = 1 - shake.remainingMs / shake.totalMs;
    const decay = 1 - progress;
    const angle = Math.random() * Math.PI * 2;
    shakeDx = Math.cos(angle) * shake.intensity * decay;
    shakeDy = Math.sin(angle) * shake.intensity * decay;
    ctx.translate(shakeDx, shakeDy);
    shake.remainingMs -= dt;
    if (shake.remainingMs <= 0) shake = null;
  }

  ctx.clearRect(-shakeDx, -shakeDy, w, h);
  particles = particles.filter((p) => {
    p.x += p.vx * (dt / 16);
    p.y += p.vy * (dt / 16);
    p.vy += 0.05 * (dt / 16);
    p.life -= dt;
    if (p.life <= 0) return false;

    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    if (p.kind === 'star') {
      drawStar(ctx, p.x, p.y, p.size * (1 - alpha * 0.5), p.color);
    } else {
      drawSparkle(ctx, p.x, p.y, p.size);
    }
    ctx.globalAlpha = 1;
    return true;
  });

  if (flash && flash.remainingMs > 0) {
    flash.alpha = flash.remainingMs / (flash.remainingMs + dt);
    ctx.fillStyle = `rgba(255,255,255,${flash.alpha})`;
    ctx.fillRect(-shakeDx, -shakeDy, w, h);
    flash.remainingMs -= dt;
    if (flash.remainingMs <= 0) flash = null;
  }

  ctx.restore();
}

export function clearEffects(): void {
  particles = [];
  shake = null;
  flash = null;
}
