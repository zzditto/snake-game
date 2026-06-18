import type { Cell, Dir, SnakeState } from '@/game/types';

const DIR_VECTOR: Record<Dir, Cell> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE: Record<Dir, Dir> = {
  up: 'down', down: 'up', left: 'right', right: 'left',
};

export function isOpposite(a: Dir, b: Dir): boolean {
  return OPPOSITE[a] === b;
}

export function createSnake(head: Cell, direction: Dir, length = 3): SnakeState {
  const body: Cell[] = [];
  const back = OPPOSITE[direction];
  const v = DIR_VECTOR[back];
  for (let i = 0; i < length; i++) {
    body.push({ x: head.x + v.x * i, y: head.y + v.y * i });
  }
  return {
    body,
    direction,
    pendingDirection: direction,
    growthQueue: 0,
    alive: true,
  };
}

export function queueDirection(snake: SnakeState, dir: Dir): void {
  if (isOpposite(dir, snake.direction)) return;
  snake.pendingDirection = dir;
}

function applyPendingDirection(snake: SnakeState): void {
  if (!isOpposite(snake.pendingDirection, snake.direction)) {
    snake.direction = snake.pendingDirection;
  }
}

export function nextHead(snake: SnakeState): Cell {
  const dir = isOpposite(snake.pendingDirection, snake.direction)
    ? snake.direction
    : snake.pendingDirection;
  const v = DIR_VECTOR[dir];
  const head = snake.body[0]!;
  return { x: head.x + v.x, y: head.y + v.y };
}

export function stepSnake(snake: SnakeState): void {
  applyPendingDirection(snake);
  const v = DIR_VECTOR[snake.direction];
  const head = snake.body[0]!;
  const newHead: Cell = { x: head.x + v.x, y: head.y + v.y };
  snake.body.unshift(newHead);
  if (snake.growthQueue > 0) {
    snake.growthQueue -= 1;
  } else {
    snake.body.pop();
  }
}

export function collidesSelf(snake: SnakeState): boolean {
  const head = snake.body[0]!;
  for (let i = 1; i < snake.body.length; i++) {
    const seg = snake.body[i]!;
    if (seg.x === head.x && seg.y === head.y) return true;
  }
  return false;
}

export function killSnake(snake: SnakeState): void {
  snake.alive = false;
}
