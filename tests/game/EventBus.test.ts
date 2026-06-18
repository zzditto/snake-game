import { describe, it, expect, vi } from 'vitest';
import { EventBus } from '@/game/core/EventBus';

describe('EventBus', () => {
  it('on + emit 触发监听器', () => {
    const bus = new EventBus<{ ping: { value: number } }>();
    const handler = vi.fn();
    bus.on('ping', handler);
    bus.emit('ping', { value: 42 });
    expect(handler).toHaveBeenCalledWith({ value: 42 });
  });

  it('off 移除监听器', () => {
    const bus = new EventBus<{ ping: undefined }>();
    const handler = vi.fn();
    bus.on('ping', handler);
    bus.off('ping', handler);
    bus.emit('ping', undefined);
    expect(handler).not.toHaveBeenCalled();
  });

  it('多个监听器都被触发', () => {
    const bus = new EventBus<{ ping: undefined }>();
    const a = vi.fn();
    const b = vi.fn();
    bus.on('ping', a);
    bus.on('ping', b);
    bus.emit('ping', undefined);
    expect(a).toHaveBeenCalledOnce();
    expect(b).toHaveBeenCalledOnce();
  });

  it('on 返回的 unsubscribe 函数可移除监听器', () => {
    const bus = new EventBus<{ ping: undefined }>();
    const handler = vi.fn();
    const unsub = bus.on('ping', handler);
    unsub();
    bus.emit('ping', undefined);
    expect(handler).not.toHaveBeenCalled();
  });

  it('clear 清空所有监听器', () => {
    const bus = new EventBus<{ ping: undefined; pong: undefined }>();
    const a = vi.fn();
    const b = vi.fn();
    bus.on('ping', a);
    bus.on('pong', b);
    bus.clear();
    bus.emit('ping', undefined);
    bus.emit('pong', undefined);
    expect(a).not.toHaveBeenCalled();
    expect(b).not.toHaveBeenCalled();
  });
});
