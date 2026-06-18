import { describe, it, expect } from 'vitest';
import { Rng } from '@/game/core/Rng';
import { generateObstacles } from '@/game/core/Obstacle';

describe('generateObstacles', () => {
  it('should generate target count with given density', () => {
    const rng = new Rng(42);
    const size = 22;
    const obstacles = generateObstacles(rng, size, 0.03, [{ x: 10, y: 10 }]);
    const expected = Math.floor(size * size * 0.03);
    expect(obstacles.length).toBeGreaterThanOrEqual(expected - 3);
    expect(obstacles.length).toBeLessThanOrEqual(expected + 3);
  });

  it('should not place obstacles within 3 cells of avoid positions', () => {
    const rng = new Rng(42);
    const obstacles = generateObstacles(rng, 22, 0.03, [{ x: 10, y: 10 }, { x: 11, y: 10 }]);
    for (const ob of obstacles) {
      const dist = Math.max(Math.abs(ob.x - 10), Math.abs(ob.y - 10));
      expect(dist).toBeGreaterThan(3);
    }
  });

  it('should be deterministic with same seed', () => {
    const rng1 = new Rng(123);
    const rng2 = new Rng(123);
    const o1 = generateObstacles(rng1, 22, 0.03, [{ x: 10, y: 10 }]);
    const o2 = generateObstacles(rng2, 22, 0.03, [{ x: 10, y: 10 }]);
    expect(o1).toEqual(o2);
  });

  it('should return empty array when density is 0', () => {
    const rng = new Rng(42);
    const obstacles = generateObstacles(rng, 22, 0, [{ x: 10, y: 10 }]);
    expect(obstacles).toEqual([]);
  });

  it('should not place obstacles outside board bounds', () => {
    const rng = new Rng(42);
    const obstacles = generateObstacles(rng, 22, 0.03, [{ x: 10, y: 10 }]);
    for (const ob of obstacles) {
      expect(ob.x).toBeGreaterThanOrEqual(0);
      expect(ob.x).toBeLessThan(22);
      expect(ob.y).toBeGreaterThanOrEqual(0);
      expect(ob.y).toBeLessThan(22);
    }
  });
});
