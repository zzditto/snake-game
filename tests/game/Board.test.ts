import { describe, it, expect } from 'vitest';
import { Board } from '@/game/core/Board';
import { Rng } from '@/game/core/Rng';
import { createSnake } from '@/game/core/Snake';

describe('Board', () => {
  it('isInside 判定边界', () => {
    const b = new Board(22);
    expect(b.isInside({ x: 0, y: 0 })).toBe(true);
    expect(b.isInside({ x: 21, y: 21 })).toBe(true);
    expect(b.isInside({ x: -1, y: 0 })).toBe(false);
    expect(b.isInside({ x: 0, y: 22 })).toBe(false);
    expect(b.isInside({ x: 22, y: 0 })).toBe(false);
  });

  it('findEmptyCell 不与已占格重叠', () => {
    const b = new Board(22);
    const rng = new Rng(123);
    const snake = createSnake({ x: 10, y: 10 }, 'right');
    const occupied = new Set(snake.body.map((c) => `${c.x},${c.y}`));
    for (let i = 0; i < 100; i++) {
      const cell = b.findEmptyCell(rng, occupied);
      expect(cell).not.toBeNull();
      expect(occupied.has(`${cell!.x},${cell!.y}`)).toBe(false);
    }
  });

  it('findEmptyCell 在棋盘填满时返回 null', () => {
    const b = new Board(3);
    const rng = new Rng(1);
    const occupied = new Set<string>();
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) occupied.add(`${x},${y}`);
    }
    expect(b.findEmptyCell(rng, occupied)).toBeNull();
  });

  it('findEmptyCell size=1 时能正确返回唯一空格', () => {
    const b = new Board(1);
    const rng = new Rng(1);
    const cell = b.findEmptyCell(rng, new Set());
    expect(cell).toEqual({ x: 0, y: 0 });
  });

  it('findEmptyCell size=1 且格子被占时返回 null', () => {
    const b = new Board(1);
    const rng = new Rng(1);
    const cell = b.findEmptyCell(rng, new Set(['0,0']));
    expect(cell).toBeNull();
  });

  it('相同种子相同 occupied 时输出相同（可复现）', () => {
    const occ = new Set(['10,10', '11,10']);
    const a = new Board(22).findEmptyCell(new Rng(7), occ);
    const c = new Board(22).findEmptyCell(new Rng(7), occ);
    expect(a).toEqual(c);
  });
});
