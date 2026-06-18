import type { Dir } from '@/game/types';

export interface InputControllerOptions {
  target: EventTarget;
  onDirection: (dir: Dir) => void;
  onPauseToggle?: () => void;
  onPauseRequest?: () => void;
  onReset?: () => void;
}

const DIR_BY_CODE: Record<string, Dir> = {
  KeyW: 'up', ArrowUp: 'up',
  KeyS: 'down', ArrowDown: 'down',
  KeyA: 'left', ArrowLeft: 'left',
  KeyD: 'right', ArrowRight: 'right',
};

export class InputController {
  private opts: InputControllerOptions;
  private listener: (e: Event) => void;
  private attached = false;

  constructor(opts: InputControllerOptions) {
    this.opts = opts;
    this.listener = (e) => this.handle(e as KeyboardEvent);
  }

  attach(): void {
    if (this.attached) return;
    this.opts.target.addEventListener('keydown', this.listener);
    this.attached = true;
  }

  detach(): void {
    if (!this.attached) return;
    this.opts.target.removeEventListener('keydown', this.listener);
    this.attached = false;
  }

  private handle(e: KeyboardEvent): void {
    const dir = DIR_BY_CODE[e.code];
    if (dir) {
      e.preventDefault();
      this.opts.onDirection(dir);
      return;
    }
    if (e.code === 'Space' || e.code === 'KeyP') {
      e.preventDefault();
      this.opts.onPauseToggle?.();
      return;
    }
    if (e.code === 'Escape') {
      e.preventDefault();
      this.opts.onPauseRequest?.();
      return;
    }
    if (e.code === 'KeyR') {
      e.preventDefault();
      this.opts.onReset?.();
      return;
    }
  }
}
