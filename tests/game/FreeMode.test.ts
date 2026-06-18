import { describe, it, expect } from 'vitest';
import { createFreeMode } from '@/game/modes/FreeMode';

describe('FreeMode', () => {
  it('id = free, shouldSpawnObstacles = false', () => {
    const mode = createFreeMode();
    expect(mode.id).toBe('free');
    expect(mode.shouldSpawnObstacles).toBe(false);
  });

  it('rngSeed 不固定（每次新对局不同）', () => {
    const a = createFreeMode();
    const b = createFreeMode();
    expect(typeof a.rngSeed).toBe('number');
    expect(typeof b.rngSeed).toBe('number');
  });
});
