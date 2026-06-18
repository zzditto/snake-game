import type { GameMode } from '@/game/types';

export function createFreeMode(): GameMode {
  return {
    id: 'free',
    shouldSpawnObstacles: false,
    rngSeed: (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0,
  };
}
