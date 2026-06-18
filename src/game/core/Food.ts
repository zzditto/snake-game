import type { Food, FoodKind } from '@/game/types';
import { FOOD_SCORE, METEOR_LIFETIME_MS } from '@/game/types';
import type { Board } from '@/game/core/Board';
import type { Rng } from '@/game/core/Rng';

export function spawnFood(
  board: Board,
  rng: Rng,
  occupied: ReadonlySet<string>,
  weights: Partial<Record<FoodKind, number>>,
  now: number,
): Food | null {
  const cell = board.findEmptyCell(rng, occupied);
  if (!cell) return null;
  const kind = rng.pickWeighted(weights) as FoodKind;
  const food: Food = {
    cell,
    kind,
    spawnedAt: now,
    score: FOOD_SCORE[kind],
  };
  if (kind === 'meteor') {
    food.expiresAt = now + METEOR_LIFETIME_MS;
  }
  return food;
}

export function isExpired(food: Food, now: number): boolean {
  return food.expiresAt !== undefined && now >= food.expiresAt;
}
