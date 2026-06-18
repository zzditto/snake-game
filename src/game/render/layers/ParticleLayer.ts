import type { IslandId } from '@/game/types';

interface EnvParticle {
  x: number; y: number;
  vx: number; vy: number;
  size: number; life: number;
  color: string; alpha: number;
}

let particles: EnvParticle[] = [];
let currentIsland: IslandId = 'spring';

export function initParticleLayer(islandId: IslandId): void {
  currentIsland = islandId;
  particles = [];
}

export function drawParticleLayer(
  ctx: CanvasRenderingContext2D,
  dt: number,
): void {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.clearRect(0, 0, w, h);

  const spawnRate = currentIsland === 'fossil' ? 0.3 : 1;
  if (Math.random() < spawnRate * (dt / 1000)) {
    spawnParticle(w);
  }

  particles = particles.filter(p => {
    p.x += p.vx * (dt / 16);
    p.y += p.vy * (dt / 16);
    p.life -= dt;
    if (p.life <= 0 || p.y > h + 50 || p.x < -50 || p.x > w + 50) return false;

    ctx.globalAlpha = Math.min(p.alpha, p.life / 1000);
    switch (currentIsland) {
      case 'spring':
      case 'autumn':
        drawPetal(ctx, p.x, p.y, p.size, p.color);
        break;
      case 'winter':
        drawSnow(ctx, p.x, p.y, p.size);
        break;
      case 'summer':
      case 'fossil':
        drawSand(ctx, p.x, p.y, p.size, p.color);
        break;
    }
    ctx.globalAlpha = 1;
    return true;
  });
}

function spawnParticle(w: number): void {
  const configs: Record<IslandId, { colors: string[]; sizeRange: [number, number]; vyRange: [number, number]; life: number }> = {
    spring: { colors: ['#ffc1d8', '#ffb6c1', '#ffe4ec'], sizeRange: [3, 7], vyRange: [0.3, 0.8], life: 8000 },
    summer: { colors: ['#d4c4a8', '#c8b878'], sizeRange: [1, 3], vyRange: [0.1, 0.3], life: 4000 },
    autumn: { colors: ['#d94b3a', '#f4a020', '#c85a1a'], sizeRange: [4, 9], vyRange: [0.5, 1.2], life: 7000 },
    winter: { colors: ['#fff', '#f0f4f8'], sizeRange: [2, 5], vyRange: [0.2, 0.5], life: 6000 },
    fossil: { colors: ['#c8a878', '#a89860'], sizeRange: [1, 2], vyRange: [0.05, 0.2], life: 3000 },
  };
  const cfg = configs[currentIsland];
  if (!cfg) return;
  particles.push({
    x: Math.random() * w,
    y: -10,
    vx: (Math.random() - 0.5) * 0.8,
    vy: cfg.vyRange[0] + Math.random() * (cfg.vyRange[1] - cfg.vyRange[0]),
    size: cfg.sizeRange[0] + Math.random() * (cfg.sizeRange[1] - cfg.sizeRange[0]),
    life: cfg.life * (0.8 + Math.random() * 0.4),
    color: cfg.colors[Math.floor(Math.random() * cfg.colors.length)]!,
    alpha: 0.7 + Math.random() * 0.3,
  });
}

function drawPetal(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, size, size * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawSnow(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
}

function drawSand(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(x - size * 0.5, y - size * 0.5, size, size);
}
