import { describe, it, expect } from 'vitest';
import {
  createSnake,
  queueDirection,
  stepSnake,
  collidesSelf,
  nextHead,
  killSnake,
} from '@/game/core/Snake';

describe('Snake', () => {
  it('createSnake 默认 3 节朝右，head 在指定位置', () => {
    const s = createSnake({ x: 10, y: 10 }, 'right');
    expect(s.body).toEqual([
      { x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 },
    ]);
    expect(s.direction).toBe('right');
    expect(s.pendingDirection).toBe('right');
    expect(s.alive).toBe(true);
    expect(s.growthQueue).toBe(0);
  });

  it('stepSnake 朝当前方向前进一格', () => {
    const s = createSnake({ x: 5, y: 5 }, 'right');
    stepSnake(s);
    expect(s.body[0]).toEqual({ x: 6, y: 5 });
    expect(s.body.length).toBe(3);
  });

  it('queueDirection + step 应用新方向', () => {
    const s = createSnake({ x: 5, y: 5 }, 'right');
    queueDirection(s, 'up');
    stepSnake(s);
    expect(s.direction).toBe('up');
    expect(s.body[0]).toEqual({ x: 5, y: 4 });
  });

  it('queueDirection 忽略反向键', () => {
    const s = createSnake({ x: 5, y: 5 }, 'right');
    queueDirection(s, 'left');
    expect(s.pendingDirection).toBe('right');
  });

  it('一帧内连续按 ↑ 然后 ← 仅执行 ↑ 方向变更', () => {
    const s = createSnake({ x: 5, y: 5 }, 'right');
    queueDirection(s, 'up');
    queueDirection(s, 'left');
    stepSnake(s);
    expect(s.direction).toBe('up');
    expect(s.body[0]).toEqual({ x: 5, y: 4 });
  });

  it('growthQueue > 0 时尾巴不删，长度增加', () => {
    const s = createSnake({ x: 5, y: 5 }, 'right');
    s.growthQueue = 2;
    const initialLen = s.body.length;
    stepSnake(s);
    expect(s.body.length).toBe(initialLen + 1);
    expect(s.growthQueue).toBe(1);
    stepSnake(s);
    expect(s.body.length).toBe(initialLen + 2);
    expect(s.growthQueue).toBe(0);
    stepSnake(s);
    expect(s.body.length).toBe(initialLen + 2);
  });

  it('collidesSelf 检测蛇头撞身', () => {
    const s = createSnake({ x: 3, y: 3 }, 'right');
    s.body = [
      { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 4 },
      { x: 4, y: 3 }, { x: 3, y: 3 },
    ];
    expect(collidesSelf(s)).toBe(true);
    killSnake(s);
    expect(s.alive).toBe(false);
  });

  it('killSnake 设置 alive = false', () => {
    const s = createSnake({ x: 5, y: 5 }, 'right');
    expect(s.alive).toBe(true);
    killSnake(s);
    expect(s.alive).toBe(false);
  });

  it('invincibleUntil 字段在 types 中定义（撞身检测需要上层跳过）', () => {
    const s = createSnake({ x: 5, y: 5 }, 'right');
    expect(s.invincibleUntil).toBeUndefined();
    s.invincibleUntil = 99999;
    expect(collidesSelf(s)).toBe(false);
    s.body = [
      { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 4 },
      { x: 4, y: 3 }, { x: 3, y: 3 },
    ];
    expect(collidesSelf(s)).toBe(true);
  });

  it('未撞身时 collidesSelf 返回 false', () => {
    const s = createSnake({ x: 5, y: 5 }, 'right');
    expect(collidesSelf(s)).toBe(false);
  });

  it('nextHead 不修改状态', () => {
    const s = createSnake({ x: 5, y: 5 }, 'right');
    const before = JSON.stringify(s);
    const next = nextHead(s);
    expect(next).toEqual({ x: 6, y: 5 });
    expect(JSON.stringify(s)).toBe(before);
  });
});
