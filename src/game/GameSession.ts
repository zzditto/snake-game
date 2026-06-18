import type {
  Cell, Dir, GameMode, GameState, Island, IslandId,
  DifficultyId, SnakeState, Food, ModeId, AchievementId, TitleId, FoodKind,
} from '@/game/types';
import {
  TICK_MS_BY_DIFFICULTY, SPEED_UP_EVERY, SPEED_UP_FACTOR,
  SPEED_CAP_TICK_MS, GOLDEN_INVINCIBLE_MS, FOSSIL_KINDS,
} from '@/game/types';
import { Rng } from '@/game/core/Rng';
import { Board } from '@/game/core/Board';
import {
  createSnake, queueDirection as queueDirectionOnSnake,
  stepSnake, collidesSelf, killSnake,
} from '@/game/core/Snake';
import { spawnFood, isExpired } from '@/game/core/Food';
import { GameLoop } from '@/game/core/GameLoop';
import { EventBus, type GameEvents } from '@/game/core/EventBus';
import { generateObstacles } from '@/game/core/Obstacle';

export interface GameSessionOptions {
  island: Island;
  mode: GameMode;
  difficulty: DifficultyId;
  boardSize: number;
  maxFoodsOnBoard?: number;
  onEat?: (food: Food, snakeLength: number) => void;
  onDie?: (payload: { score: number; length: number; island: IslandId; mode: ModeId }) => void;
  onUnlockAchievement?: (id: AchievementId) => void;
  onUnlockTitle?: (id: TitleId) => void;
  onUnlockIsland?: (id: IslandId) => void;
  onDexFossil?: (kind: FoodKind) => void;
  onDexFruit?: (kind: FoodKind) => void;
  onMeteorEaten?: () => void;
  onAutoPause?: () => void;
}

export class GameSession {
  readonly bus = new EventBus<GameEvents>();
  readonly state: GameState;

  private board: Board;
  private rng: Rng;
  private mode: GameMode;
  private island: Island;
  private loop: GameLoop;
  private maxFoods: number;
  private destroyed = false;
  private opts: GameSessionOptions;

  constructor(opts: GameSessionOptions) {
    this.opts = opts;
    this.island = opts.island;
    this.mode = opts.mode;
    this.board = new Board(opts.boardSize);
    this.rng = new Rng(opts.mode.rngSeed ?? performance.now() >>> 0);
    this.maxFoods = opts.maxFoodsOnBoard ?? 1;

    const center: Cell = {
      x: Math.floor(opts.boardSize / 2),
      y: Math.floor(opts.boardSize / 2),
    };
    const snake = createSnake(center, 'right', 3);

    this.state = {
      snake,
      foods: [],
      obstacles: [],
      score: 0,
      comboCount: 0,
      tickCount: 0,
      startedAt: performance.now(),
      island: opts.island.id,
      mode: opts.mode.id,
    };

    this.refillFoods();

    this.loop = new GameLoop({
      tickMs: TICK_MS_BY_DIFFICULTY[opts.difficulty],
      update: () => this.tick(),
      render: () => {},
      onAutoPause: opts.onAutoPause,
    });
  }

  start(): void {
    if (this.destroyed) return;
    this.bus.emit('start', { island: this.island.id, mode: this.mode.id });
    if (this.mode.shouldSpawnObstacles && this.mode.rngSeed !== undefined) {
      this.state.obstacles = generateObstacles(
        this.rng, this.board.size, this.mode.obstacleDensity ?? 0, this.state.snake.body,
      );
    }
    this.loop.start();
  }

  pause(): void {
    if (this.destroyed) return;
    this.loop.pause();
    this.bus.emit('pause', undefined);
  }

  resume(): void {
    if (this.destroyed) return;
    this.loop.resume();
    this.bus.emit('resume', undefined);
  }

  isPaused(): boolean {
    return this.loop.getState() === 'paused';
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.loop.stop();
    this.bus.clear();
  }

  queueDirection(dir: Dir): void {
    if (this.destroyed || !this.state.snake.alive) return;
    queueDirectionOnSnake(this.state.snake, dir);
  }

  onRender(cb: (alpha: number, state: GameState) => void): () => void {
    const wrapped = (alpha: number) => cb(alpha, this.state);
    this.loop.setRender(wrapped);
    return () => { this.loop.setRender(() => {}); };
  }

  stepForTest(): void {
    this.tick();
  }

  getTickMs(): number {
    return this.loop.getTickMs();
  }

  private tick(): void {
    if (!this.state.snake.alive) return;

    const head = stepSnakeAndGetHead(this.state.snake);

    if (!this.board.isInside(head)) {
      this.die();
      return;
    }

    const invincible = (this.state.snake.invincibleUntil ?? 0) > performance.now();

    if (!invincible && collidesSelf(this.state.snake)) {
      this.die();
      return;
    }

    if (!invincible) {
      for (const ob of this.state.obstacles) {
        if (ob.x === head.x && ob.y === head.y) {
          this.die();
          return;
        }
      }
    }

    const eatenIdx = this.state.foods.findIndex(
      (f) => f.cell.x === head.x && f.cell.y === head.y,
    );
    if (eatenIdx >= 0) {
      const food = this.state.foods[eatenIdx]!;
      this.state.foods.splice(eatenIdx, 1);
      this.state.snake.growthQueue += 1;
      this.state.score += food.score;
      this.state.comboCount += 1;
      if (food.kind === 'golden') {
        this.state.snake.invincibleUntil = performance.now() + GOLDEN_INVINCIBLE_MS;
      }
      this.opts.onEat?.(food, this.state.snake.body.length);
      if (food.kind === 'meteor') {
        this.opts.onMeteorEaten?.();
      } else if (FOSSIL_KINDS.includes(food.kind)) {
        this.opts.onDexFossil?.(food.kind);
      } else {
        this.opts.onDexFruit?.(food.kind);
      }
      this.bus.emit('eat', { food, snakeLength: this.state.snake.body.length });
      this.maybeSpeedUp();
    }

    const now = performance.now();
    this.state.foods = this.state.foods.filter((f) => !isExpired(f, now));

    this.refillFoods();

    this.state.tickCount += 1;
    this.mode.onTickHook?.(this.state);
    this.bus.emit('tick', { tickCount: this.state.tickCount });
  }

  private die(): void {
    killSnake(this.state.snake);
    this.opts.onDie?.({
      score: this.state.score,
      length: this.state.snake.body.length,
      island: this.state.island,
      mode: this.state.mode,
    });
    this.bus.emit('die', {
      score: this.state.score,
      length: this.state.snake.body.length,
      island: this.state.island,
      mode: this.state.mode,
    });
    this.loop.stop();
  }

  private maybeSpeedUp(): void {
    const totalEaten = this.state.comboCount;
    if (totalEaten > 0 && totalEaten % SPEED_UP_EVERY === 0) {
      const next = Math.max(
        SPEED_CAP_TICK_MS,
        this.loop.getTickMs() * SPEED_UP_FACTOR,
      );
      this.loop.setTickMs(next);
    }
  }

  private refillFoods(): void {
    while (this.state.foods.length < this.maxFoods) {
      const occ = new Set<string>();
      for (const c of this.state.snake.body) occ.add(`${c.x},${c.y}`);
      for (const f of this.state.foods) occ.add(`${f.cell.x},${f.cell.y}`);
      for (const o of this.state.obstacles) occ.add(`${o.x},${o.y}`);
      const f = spawnFood(this.board, this.rng, occ, this.island.fruitWeights, performance.now());
      if (!f) break;
      if (FOSSIL_KINDS.includes(f.kind) && this.state.foods.some((x) => x.kind === f.kind)) continue;
      this.state.foods.push(f);
    }
  }
}

function stepSnakeAndGetHead(snake: SnakeState): Cell {
  stepSnake(snake);
  return snake.body[0]!;
}
