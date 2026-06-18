import { describe, it, expect, vi } from 'vitest';
import { GameSession } from '@/game/GameSession';
import { createFreeMode } from '@/game/modes/FreeMode';
import { ISLANDS } from '@/game/levels/islands';
import type { Food } from '@/game/types';

function makeSession() {
  return new GameSession({
    island: ISLANDS.spring,
    mode: { ...createFreeMode(), rngSeed: 42 },
    difficulty: 'normal',
    boardSize: 22,
  });
}

describe('GameSession', () => {
  it('初始化后 state.snake 为 3 节，alive', () => {
    const s = makeSession();
    expect(s.state.snake.body.length).toBe(3);
    expect(s.state.snake.alive).toBe(true);
    expect(s.state.score).toBe(0);
  });

  it('初始化后场上至少有 1 个食物', () => {
    const s = makeSession();
    expect(s.state.foods.length).toBeGreaterThanOrEqual(1);
  });

  it('queueDirection + step 应用方向', () => {
    const s = makeSession();
    s.queueDirection('up');
    s.stepForTest();
    expect(s.state.snake.direction).toBe('up');
  });

  it('蛇撞墙后 alive = false 并 emit die', () => {
    const s = makeSession();
    const dieHandler = vi.fn();
    s.bus.on('die', dieHandler);
    for (let i = 0; i < 30 && s.state.snake.alive; i++) s.stepForTest();
    expect(s.state.snake.alive).toBe(false);
    expect(dieHandler).toHaveBeenCalledOnce();
  });

  it('吃到食物时 score 增加、growthQueue + 1、emit eat', () => {
    const s = makeSession();
    const head = s.state.snake.body[0]!;
    const next = { x: head.x + 1, y: head.y };
    s.state.foods = [{
      cell: next, kind: 'apple', spawnedAt: 0, score: 1,
    } as Food];
    const eatHandler = vi.fn();
    s.bus.on('eat', eatHandler);
    s.stepForTest();
    expect(s.state.score).toBe(1);
    expect(s.state.snake.growthQueue).toBe(1);
    expect(eatHandler).toHaveBeenCalledOnce();
  });

  it('每吃 5 个食物后 tickMs 减小', () => {
    const s = makeSession();
    const initialTickMs = s.getTickMs();
    for (let i = 0; i < 5; i++) {
      const head = s.state.snake.body[0]!;
      s.state.foods = [{
        cell: { x: head.x + 1, y: head.y },
        kind: 'apple', spawnedAt: 0, score: 1,
      } as Food];
      s.stepForTest();
    }
    expect(s.getTickMs()).toBeLessThan(initialTickMs);
  });

  it('pause 后 isPaused 为 true', () => {
    const s = makeSession();
    s.start();
    s.pause();
    expect(s.isPaused()).toBe(true);
  });

  it('destroy 后再调用方法不抛错', () => {
    const s = makeSession();
    s.destroy();
    expect(() => s.queueDirection('up')).not.toThrow();
  });
});
