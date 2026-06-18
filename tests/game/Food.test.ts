import { describe, it, expect } from 'vitest';
import { spawnFood, isExpired } from '@/game/core/Food';
import { Rng } from '@/game/core/Rng';
import { Board } from '@/game/core/Board';
import { METEOR_LIFETIME_MS } from '@/game/types';

describe('Food', () => {
  it('spawnFood 返回的食物位置在棋盘内、不在 occupied 中', () => {
    const board = new Board(22);
    const rng = new Rng(1);
    const occ = new Set(['10,10']);
    const weights = { apple: 1, cherry: 1 } as const;
    for (let i = 0; i < 50; i++) {
      const f = spawnFood(board, rng, occ, weights, 0);
      expect(f).not.toBeNull();
      expect(board.isInside(f!.cell)).toBe(true);
      expect(occ.has(`${f!.cell.x},${f!.cell.y}`)).toBe(false);
    }
  });

  it('棋盘填满时返回 null', () => {
    const board = new Board(2);
    const rng = new Rng(1);
    const occ = new Set(['0,0', '0,1', '1,0', '1,1']);
    const f = spawnFood(board, rng, occ, { apple: 1 }, 0);
    expect(f).toBeNull();
  });

  it('普通水果分值为 1，无 expiresAt', () => {
    const board = new Board(22);
    const rng = new Rng(1);
    const f = spawnFood(board, rng, new Set(), { apple: 1 }, 1000);
    expect(f!.kind).toBe('apple');
    expect(f!.score).toBe(1);
    expect(f!.spawnedAt).toBe(1000);
    expect(f!.expiresAt).toBeUndefined();
  });

  it('meteor 分值为 5，expiresAt = spawnedAt + 10s', () => {
    const board = new Board(22);
    const rng = new Rng(1);
    const f = spawnFood(board, rng, new Set(), { meteor: 1 }, 1000);
    expect(f!.kind).toBe('meteor');
    expect(f!.score).toBe(5);
    expect(f!.expiresAt).toBe(1000 + METEOR_LIFETIME_MS);
  });

  it('化石分值为 10，无 expiresAt', () => {
    const board = new Board(22);
    const rng = new Rng(1);
    const f = spawnFood(board, rng, new Set(), { fossil_amber: 1 }, 0);
    expect(f!.kind).toBe('fossil_amber');
    expect(f!.score).toBe(10);
    expect(f!.expiresAt).toBeUndefined();
  });

  it('fruitWeights 总和归一化后概率正确（集成 Rng + Food）', () => {
    const board = new Board(22);
    const rng = new Rng(42);
    const counts: { apple: number; cherry: number } = { apple: 0, cherry: 0 };
    const weights = { apple: 3, cherry: 1 } as const;
    for (let i = 0; i < 4000; i++) {
      const occupied = new Set<string>([`0,${i % 22}`, `1,${i % 22}`]);
      const f = spawnFood(board, rng, occupied, weights, 0);
      if (f) counts[f.kind as 'apple' | 'cherry']++;
    }
    const ratio = counts.apple / counts.cherry;
    expect(ratio).toBeGreaterThan(1.5);
    expect(ratio).toBeLessThan(6);
  });

  it('isExpired: 普通水果永不过期、流星按 expiresAt 过期', () => {
    const apple = { cell: { x: 0, y: 0 }, kind: 'apple' as const, spawnedAt: 0, score: 1 };
    expect(isExpired(apple, 999_999)).toBe(false);

    const meteor = {
      cell: { x: 1, y: 1 }, kind: 'meteor' as const,
      spawnedAt: 0, expiresAt: 10_000, score: 5,
    };
    expect(isExpired(meteor, 9_999)).toBe(false);
    expect(isExpired(meteor, 10_001)).toBe(true);
  });
});
