import { describe, it, expect } from 'vitest';
import { checkTitles } from '@/game/titles';

function makeProgress(overrides: Partial<any> = {}) {
  return {
    dex: { fossils: [], titles: [] },
    meteorEatenTotal: 0,
    unlockedIslands: ['spring'],
    ...overrides,
  };
}

function makeDied(overrides: Partial<any> = {}) {
  return {
    score: 0,
    island: 'spring',
    comboCount: 0,
    length: 3,
    ...overrides,
  };
}

describe('checkTitles', () => {
  it('should always unlock rookie', () => {
    const result = checkTitles({
      progress: makeProgress(),
      justDiedWith: makeDied(),
    });
    expect(result).toContain('rookie');
  });

  it('should unlock gourmet when combo >= 10', () => {
    const result = checkTitles({
      progress: makeProgress(),
      justDiedWith: makeDied({ comboCount: 10 }),
    });
    expect(result).toContain('gourmet');
  });

  it('should unlock long_dragon when length >= 50', () => {
    const result = checkTitles({
      progress: makeProgress(),
      justDiedWith: makeDied({ length: 50 }),
    });
    expect(result).toContain('long_dragon');
  });

  it('should unlock spring_visitor on spring with score >= 100', () => {
    const result = checkTitles({
      progress: makeProgress(),
      justDiedWith: makeDied({ score: 100, island: 'spring' }),
    });
    expect(result).toContain('spring_visitor');
  });

  it('should NOT return already-unlocked titles', () => {
    const result = checkTitles({
      progress: makeProgress({ dex: { fossils: [], titles: ['rookie'] } }),
      justDiedWith: makeDied(),
    });
    expect(result).not.toContain('rookie');
  });

  it('should unlock traveler when all 5 islands unlocked', () => {
    const result = checkTitles({
      progress: makeProgress({ unlockedIslands: ['spring', 'summer', 'autumn', 'winter', 'fossil'] }),
      justDiedWith: makeDied(),
    });
    expect(result).toContain('traveler');
  });
});
