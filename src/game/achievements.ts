import type { AchievementId, FoodKind, IslandId, GameState } from '@/game/types';
import { FOSSIL_KINDS } from '@/game/types';

export interface AchievementCheckInput {
  state: GameState;
  progress: {
    achievements: AchievementId[];
    dex: { fossils: FoodKind[] };
    meteorEatenTotal: number;
    consecutiveDailyDays: number;
  };
}

export function checkAchievements(input: AchievementCheckInput): AchievementId[] {
  const { state, progress } = input;
  const already = new Set(progress.achievements);
  const unlocked: AchievementId[] = [];

  const checks: [AchievementId, () => boolean][] = [
    ['gourmet',          () => state.comboCount >= 10],
    ['long_dragon',      () => state.snake.body.length >= 50],
    ['meteor_hunter',    () => progress.meteorEatenTotal >= 10],
    ['paleontologist',   () => FOSSIL_KINDS.every(f => progress.dex.fossils.includes(f))],
    ['spring_clear',     () => state.island === 'spring' && state.score >= 100],
    ['summer_clear',     () => state.island === 'summer' && state.score >= 150],
    ['autumn_clear',      () => state.island === 'autumn' && state.score >= 200],
    ['winter_clear',      () => state.island === 'winter' && state.score >= 250],
    ['fossil_clear',      () => state.island === 'fossil' && state.score >= 300],
    ['daily_warrior',     () => progress.consecutiveDailyDays >= 7],
  ];

  for (const [id, fn] of checks) {
    if (!already.has(id) && fn()) {
      unlocked.push(id);
    }
  }
  return unlocked;
}

export function getRelatedTitle(achievement: AchievementId): string | null {
  const map: Partial<Record<AchievementId, string>> = {
    gourmet: 'gourmet',
    long_dragon: 'long_dragon',
    meteor_hunter: 'meteor_hunter',
    paleontologist: 'paleontologist',
    spring_clear: 'spring_visitor',
    summer_clear: 'summer_visitor',
    autumn_clear: 'autumn_visitor',
    winter_clear: 'winter_visitor',
    fossil_clear: 'paleontologist',
    daily_warrior: 'daily_warrior',
  };
  return map[achievement] ?? null;
}
