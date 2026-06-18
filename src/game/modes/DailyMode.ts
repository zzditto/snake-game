import type { GameMode, IslandId } from '@/game/types';
import { ISLAND_ORDER } from '@/game/levels/islands';

function dailySeed(dateStr: string): number {
  const ymd = dateStr.replace(/-/g, '');
  return parseInt(ymd, 10);
}

export function todayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function createDailyMode(dateStr: string = todayDateString()): GameMode {
  const seed = dailySeed(dateStr);
  return {
    id: 'daily',
    shouldSpawnObstacles: true,
    rngSeed: seed,
    obstacleDensity: 0.03,
  };
}

export function getDailyIsland(dateStr: string = todayDateString()): IslandId {
  const seed = dailySeed(dateStr);
  return ISLAND_ORDER[seed % ISLAND_ORDER.length]!;
}
