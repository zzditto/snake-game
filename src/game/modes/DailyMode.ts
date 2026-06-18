import type { GameMode } from '@/game/types';
import { dailySeed } from '@/game/core/Rng';

export function todayDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function createDailyMode(dateStr: string = todayDateString()): GameMode {
  return {
    id: 'daily',
    shouldSpawnObstacles: true,
    rngSeed: dailySeed(dateStr),
    obstacleDensity: 0.03,
  };
}

/** 由 seed 选当日岛屿（前 4 个，化石岛排除——需特殊解锁）。 */
export function pickDailyIsland(seed: number): import('@/game/types').IslandId {
  const order: import('@/game/types').IslandId[] = ['spring', 'summer', 'autumn', 'winter'];
  return order[seed % 4]!;
}
