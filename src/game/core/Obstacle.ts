import type { Cell } from '@/game/types';
import type { Rng } from '@/game/core/Rng';

export function generateObstacles(
  rng: Rng,
  boardSize: number,
  density: number,
  avoid: Cell[],
): Cell[] {
  const totalCells = boardSize * boardSize;
  const targetCount = Math.floor(totalCells * density);
  const obstacles: Cell[] = [];
  const avoidSet = new Set(avoid.map(c => `${c.x},${c.y}`));

  const expandedAvoid = new Set(avoidSet);
  for (const a of avoid) {
    for (let dx = -3; dx <= 3; dx++) {
      for (let dy = -3; dy <= 3; dy++) {
        const nx = a.x + dx;
        const ny = a.y + dy;
        if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
          expandedAvoid.add(`${nx},${ny}`);
        }
      }
    }
  }

  let attempts = 0;
  const maxAttempts = targetCount * 20;
  while (obstacles.length < targetCount && attempts < maxAttempts) {
    attempts++;
    const x = Math.floor(rng.next() * boardSize);
    const y = Math.floor(rng.next() * boardSize);
    const key = `${x},${y}`;
    if (!expandedAvoid.has(key) && !obstacles.some(o => o.x === x && o.y === y)) {
      obstacles.push({ x, y });
    }
  }
  return obstacles;
}
