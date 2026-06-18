import type { TitleId } from '@/game/types';
import { FOSSIL_KINDS } from '@/game/types';

export interface TitleCheckInput {
  progress: {
    dex: { fossils: FoodKind[]; titles: TitleId[] };
    meteorEatenTotal: number;
    unlockedIslands: string[];
  };
  justDiedWith: {
    score: number;
    island: string;
    comboCount: number;
    length: number;
  };
}

import type { FoodKind } from '@/game/types';

export function checkTitles(input: TitleCheckInput): TitleId[] {
  const { progress, justDiedWith: d } = input;
  const already = new Set(progress.dex.titles);
  const unlocked: TitleId[] = [];

  const checks: [TitleId, () => boolean][] = [
    ['rookie',           () => true],
    ['gourmet',          () => d.comboCount >= 10],
    ['long_dragon',      () => d.length >= 50],
    ['meteor_hunter',    () => progress.meteorEatenTotal >= 10],
    ['paleontologist',   () => FOSSIL_KINDS.every((f: FoodKind) => progress.dex.fossils.includes(f))],
    ['spring_visitor',   () => d.island === 'spring' && d.score >= 100],
    ['summer_visitor',   () => d.island === 'summer' && d.score >= 150],
    ['autumn_visitor',    () => d.island === 'autumn' && d.score >= 200],
    ['winter_visitor',    () => d.island === 'winter' && d.score >= 250],
    ['traveler',         () => progress.unlockedIslands.length >= 5],
  ];

  for (const [id, fn] of checks) {
    if (!already.has(id) && fn()) {
      unlocked.push(id);
    }
  }
  return unlocked;
}
