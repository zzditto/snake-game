export interface GameLoopOptions {
  tickMs: number;
  update: () => void;
  render: (alpha: number) => void;
  /** 默认使用 requestAnimationFrame；测试用 tickFor 手动推进时可省略。 */
  raf?: (cb: (now: number) => void) => number;
  cancelRaf?: (handle: number) => void;
  now?: () => number;
  /** 页面失焦自动暂停时的回调 */
  onAutoPause?: () => void;
}

export class GameLoop {
  private tickMs: number;
  private update: () => void;
  private render: (alpha: number) => void;
  private raf: (cb: (now: number) => void) => number;
  private cancelRaf: (h: number) => void;
  private now: () => number;
  private onAutoPause?: () => void;

  private acc = 0;
  private lastT = 0;
  private rafHandle: number | null = null;
  private state: 'idle' | 'running' | 'paused' | 'stopped' = 'idle';
  private virtualNow = 0;
  private visibilityHandler: (() => void) | null = null;

  constructor(opts: GameLoopOptions) {
    this.tickMs = opts.tickMs;
    this.update = opts.update;
    this.render = opts.render;
    this.raf = opts.raf ?? ((cb) => requestAnimationFrame(cb));
    this.cancelRaf = opts.cancelRaf ?? ((h) => cancelAnimationFrame(h));
    this.now = opts.now ?? (() => performance.now());
    this.onAutoPause = opts.onAutoPause;
  }

  setTickMs(ms: number): void {
    this.tickMs = Math.max(1, ms);
  }

  getTickMs(): number {
    return this.tickMs;
  }

  getState(): 'idle' | 'running' | 'paused' | 'stopped' {
    return this.state;
  }

  setRender(cb: (alpha: number) => void): void {
    this.render = cb;
  }

  start(): void {
    if (this.state === 'running') return;
    this.state = 'running';
    this.lastT = this.now();
    this.acc = 0;
    this.virtualNow = 0;
    this.setupVisibilityPause();
    this.scheduleFrame();
  }

  pause(): void {
    if (this.state !== 'running') return;
    this.state = 'paused';
    if (this.rafHandle !== null) {
      this.cancelRaf(this.rafHandle);
      this.rafHandle = null;
    }
  }

  resume(): void {
    if (this.state !== 'paused') return;
    this.state = 'running';
    this.lastT = this.now();
    this.acc = 0;
    this.scheduleFrame();
  }

  stop(): void {
    this.state = 'stopped';
    if (this.rafHandle !== null) {
      this.cancelRaf(this.rafHandle);
      this.rafHandle = null;
    }
    this.removeVisibilityPause();
  }

  /** 测试专用：手动推进虚拟时间。 */
  tickFor(deltaMs: number): void {
    if (this.state !== 'running') return;
    this.virtualNow += deltaMs;
    this.frame(this.lastT + this.virtualNow);
  }

  private setupVisibilityPause(): void {
    this.visibilityHandler = () => {
      if (document.hidden && this.state === 'running') {
        this.pause();
        this.onAutoPause?.();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
    window.addEventListener('pagehide', this.visibilityHandler);
  }

  private removeVisibilityPause(): void {
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      window.removeEventListener('pagehide', this.visibilityHandler);
      this.visibilityHandler = null;
    }
  }

  private scheduleFrame(): void {
    this.rafHandle = this.raf((t) => this.frame(t));
  }

  private frame(now: number): void {
    if (this.state !== 'running') return;
    const delta = now - this.lastT;
    this.lastT = now;
    this.acc += delta;
    while (this.acc >= this.tickMs) {
      this.update();
      this.acc -= this.tickMs;
    }
    const alpha = this.acc / this.tickMs;
    this.render(alpha);
    if (this.rafHandle !== null || this.virtualNow === 0) {
      this.scheduleFrame();
    }
  }
}
