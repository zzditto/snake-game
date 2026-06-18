import { describe, it, expect } from 'vitest';
import { createDailyMode, todayDateString } from '@/game/modes/DailyMode';

describe('DailyMode', () => {
  it('id = daily, shouldSpawnObstacles = true', () => {
    const mode = createDailyMode('2026-06-18');
    expect(mode.id).toBe('daily');
    expect(mode.shouldSpawnObstacles).toBe(true);
  });

  it('相同日期生成相同种子', () => {
    const a = createDailyMode('2026-06-18');
    const b = createDailyMode('2026-06-18');
    expect(a.rngSeed).toBe(b.rngSeed);
  });

  it('不同日期生成不同种子', () => {
    const a = createDailyMode('2026-06-18');
    const b = createDailyMode('2026-06-19');
    expect(a.rngSeed).not.toBe(b.rngSeed);
  });

  it('obstacleDensity 默认 0.03', () => {
    const mode = createDailyMode('2026-06-18');
    expect(mode.obstacleDensity).toBe(0.03);
  });

  it('todayDateString 返回 YYYY-MM-DD 格式', () => {
    const s = todayDateString();
    expect(s).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
