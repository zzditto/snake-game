import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameLoop } from '@/game/core/GameLoop';

describe('GameLoop', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('start 后按固定步长触发 update', () => {
    const update = vi.fn();
    const render = vi.fn();
    const loop = new GameLoop({ tickMs: 100, update, render });
    loop.start();
    loop.tickFor(350);
    expect(update).toHaveBeenCalledTimes(3);
  });

  it('render 每次推进时被调用一次，alpha 在 [0, 1)', () => {
    const update = vi.fn();
    let lastAlpha = -1;
    const render = vi.fn((a: number) => { lastAlpha = a; });
    const loop = new GameLoop({ tickMs: 100, update, render });
    loop.start();
    loop.tickFor(50);
    expect(render).toHaveBeenCalled();
    expect(lastAlpha).toBeGreaterThanOrEqual(0);
    expect(lastAlpha).toBeLessThan(1);
  });

  it('pause 后 update 不再被调用', () => {
    const update = vi.fn();
    const render = vi.fn();
    const loop = new GameLoop({ tickMs: 100, update, render });
    loop.start();
    loop.tickFor(150);
    const calls = update.mock.calls.length;
    loop.pause();
    loop.tickFor(500);
    expect(update.mock.calls.length).toBe(calls);
  });

  it('resume 后不会一次性触发大量 update（不积累暂停期间）', () => {
    const update = vi.fn();
    const render = vi.fn();
    const loop = new GameLoop({ tickMs: 100, update, render });
    loop.start();
    loop.pause();
    loop.tickFor(5000);
    loop.resume();
    loop.tickFor(50);
    expect(update.mock.calls.length).toBeLessThanOrEqual(1);
  });

  it('setTickMs 可在运行时调整步长', () => {
    const update = vi.fn();
    const render = vi.fn();
    const loop = new GameLoop({ tickMs: 100, update, render });
    loop.start();
    loop.setTickMs(50);
    loop.tickFor(150);
    expect(update.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('stop 永久停止', () => {
    const update = vi.fn();
    const render = vi.fn();
    const loop = new GameLoop({ tickMs: 100, update, render });
    loop.start();
    loop.stop();
    loop.tickFor(500);
    expect(update).not.toHaveBeenCalled();
  });

  it('stop→start→tickFor 序列中 update 被正确调用（virtualNow 无残留）', () => {
    const update = vi.fn();
    const render = vi.fn();
    const loop = new GameLoop({ tickMs: 100, update, render });
    loop.start();
    loop.tickFor(200);
    expect(update).toHaveBeenCalledTimes(2);
    update.mockClear();

    loop.stop();
    loop.start();
    loop.tickFor(350);
    expect(update).toHaveBeenCalledTimes(3);
  });
});
