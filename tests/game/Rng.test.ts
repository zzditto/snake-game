import { describe, it, expect } from 'vitest';
import { Rng } from '@/game/core/Rng';

describe('Rng', () => {
  it('相同种子产生相同序列', () => {
    const a = new Rng(12345);
    const b = new Rng(12345);
    const seqA = Array.from({ length: 10 }, () => a.next());
    const seqB = Array.from({ length: 10 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it('不同种子产生不同序列', () => {
    const a = new Rng(1);
    const b = new Rng(2);
    const seqA = Array.from({ length: 10 }, () => a.next());
    const seqB = Array.from({ length: 10 }, () => b.next());
    expect(seqA).not.toEqual(seqB);
  });

  it('next() 返回 [0, 1) 范围', () => {
    const r = new Rng(42);
    for (let i = 0; i < 1000; i++) {
      const v = r.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('intRange(min, max) 返回 [min, max) 整数', () => {
    const r = new Rng(7);
    for (let i = 0; i < 1000; i++) {
      const v = r.intRange(5, 10);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThan(10);
    }
  });

  it('pick 空数组抛出 Error', () => {
    const r = new Rng(1);
    expect(() => r.pick([])).toThrow('Rng.pick: empty array');
  });

  it('pickWeighted 总权重为 0 抛出 Error', () => {
    const r = new Rng(1);
    expect(() => r.pickWeighted({ a: 0, b: 0 })).toThrow('Rng.pickWeighted: total weight must be positive');
  });

  it('pickWeighted 按权重选取', () => {
    const r = new Rng(1);
    const counts = { a: 0, b: 0, c: 0 };
    const items = { a: 1, b: 8, c: 1 };
    for (let i = 0; i < 10_000; i++) {
      const k = r.pickWeighted(items);
      counts[k]++;
    }
    expect(counts.b).toBeGreaterThan(7000);
    expect(counts.b).toBeLessThan(8500);
  });
});
