/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { checkAchievements } from '@/game/achievements';

function makeState(overrides: Partial<any> = {}) {
  return {
    comboCount: 0,
    score: 0,
    island: 'spring',
    snake: { body: new Array(3).fill({ x: 5, y: 5 }) },
    foods: [],
    obstacles: [],
    tickCount: 0,
    startedAt: 0,
    mode: 'free',
    ...overrides,
  } as any;
}

function makeProgress(overrides: Partial<any> = {}) {
  return {
    achievements: [],
    dex: { fossils: [] },
    meteorEatenTotal: 0,
    consecutiveDailyDays: 0,
    ...overrides,
  };
}

describe('checkAchievements', () => {
  it('should unlock gourmet when combo >= 10', () => {
    const result = checkAchievements({
      state: makeState({ comboCount: 10 }),
      progress: makeProgress(),
    });
    expect(result).toContain('gourmet');
  });

  it('should NOT unlock gourmet when combo < 10', () => {
    const result = checkAchievements({
      state: makeState({ comboCount: 9 }),
      progress: makeProgress(),
    });
    expect(result).not.toContain('gourmet');
  });

  it('should unlock long_dragon when body length >= 50', () => {
    const result = checkAchievements({
      state: makeState({ snake: { body: new Array(50).fill({ x: 0, y: 0 }) } }),
      progress: makeProgress(),
    });
    expect(result).toContain('long_dragon');
  });

  it('should unlock meteor_hunter when meteorEatenTotal >= 10', () => {
    const result = checkAchievements({
      state: makeState(),
      progress: makeProgress({ meteorEatenTotal: 10 }),
    });
    expect(result).toContain('meteor_hunter');
  });

  it('should unlock paleontologist when all fossils collected', () => {
    const result = checkAchievements({
      state: makeState(),
      progress: makeProgress({
        dex: { fossils: ['fossil_trilobite', 'fossil_dino', 'fossil_ammonite', 'fossil_shell', 'fossil_amber'] },
      }),
    });
    expect(result).toContain('paleontologist');
  });

  it('should unlock spring_clear when score >= 100 on spring', () => {
    const result = checkAchievements({
      state: makeState({ score: 100, island: 'spring' }),
      progress: makeProgress(),
    });
    expect(result).toContain('spring_clear');
  });

  it('should NOT return already-unlocked achievements', () => {
    const result = checkAchievements({
      state: makeState({ comboCount: 10 }),
      progress: makeProgress({ achievements: ['gourmet'] }),
    });
    expect(result).not.toContain('gourmet');
  });

  it('should unlock daily_warrior when consecutiveDailyDays >= 7', () => {
    const result = checkAchievements({
      state: makeState(),
      progress: makeProgress({ consecutiveDailyDays: 7 }),
    });
    expect(result).toContain('daily_warrior');
  });
});
