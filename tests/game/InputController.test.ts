import { describe, it, expect, vi } from 'vitest';
import { InputController } from '@/game/core/InputController';

function dispatchKey(target: EventTarget, code: string, key: string): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { code, key }));
}

describe('InputController', () => {
  it('WASD 触发对应方向', () => {
    const onDir = vi.fn();
    const target = new EventTarget();
    const ic = new InputController({ target, onDirection: onDir });
    ic.attach();
    dispatchKey(target, 'KeyW', 'w');
    dispatchKey(target, 'KeyA', 'a');
    dispatchKey(target, 'KeyS', 's');
    dispatchKey(target, 'KeyD', 'd');
    expect(onDir.mock.calls.map((c) => c[0])).toEqual(['up', 'left', 'down', 'right']);
    ic.detach();
  });

  it('方向键触发对应方向', () => {
    const onDir = vi.fn();
    const target = new EventTarget();
    const ic = new InputController({ target, onDirection: onDir });
    ic.attach();
    dispatchKey(target, 'ArrowUp', 'ArrowUp');
    dispatchKey(target, 'ArrowDown', 'ArrowDown');
    dispatchKey(target, 'ArrowLeft', 'ArrowLeft');
    dispatchKey(target, 'ArrowRight', 'ArrowRight');
    expect(onDir.mock.calls.map((c) => c[0])).toEqual(['up', 'down', 'left', 'right']);
    ic.detach();
  });

  it('Space 和 P 触发 pauseToggle', () => {
    const onPause = vi.fn();
    const target = new EventTarget();
    const ic = new InputController({ target, onDirection: () => {}, onPauseToggle: onPause });
    ic.attach();
    dispatchKey(target, 'Space', ' ');
    dispatchKey(target, 'KeyP', 'p');
    expect(onPause).toHaveBeenCalledTimes(2);
    ic.detach();
  });

  it('ESC 触发 onPauseRequest（不切换）', () => {
    const onPauseReq = vi.fn();
    const target = new EventTarget();
    const ic = new InputController({ target, onDirection: () => {}, onPauseRequest: onPauseReq });
    ic.attach();
    dispatchKey(target, 'Escape', 'Escape');
    expect(onPauseReq).toHaveBeenCalledOnce();
    ic.detach();
  });

  it('R 触发 onReset', () => {
    const onReset = vi.fn();
    const target = new EventTarget();
    const ic = new InputController({ target, onDirection: () => {}, onReset });
    ic.attach();
    dispatchKey(target, 'KeyR', 'r');
    expect(onReset).toHaveBeenCalledOnce();
    ic.detach();
  });

  it('detach 后不再响应键', () => {
    const onDir = vi.fn();
    const target = new EventTarget();
    const ic = new InputController({ target, onDirection: onDir });
    ic.attach();
    ic.detach();
    dispatchKey(target, 'KeyW', 'w');
    expect(onDir).not.toHaveBeenCalled();
  });

  it('未识别的键被忽略', () => {
    const onDir = vi.fn();
    const onPause = vi.fn();
    const target = new EventTarget();
    const ic = new InputController({ target, onDirection: onDir, onPauseToggle: onPause });
    ic.attach();
    dispatchKey(target, 'KeyX', 'x');
    dispatchKey(target, 'Enter', 'Enter');
    expect(onDir).not.toHaveBeenCalled();
    expect(onPause).not.toHaveBeenCalled();
    ic.detach();
  });
});
