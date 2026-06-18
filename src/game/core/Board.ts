import type { Cell } from '@/game/types';
import type { Rng } from '@/game/core/Rng';

export class Board {
  constructor(public readonly size: number) {}

  isInside(cell: Cell): boolean {
    return cell.x >= 0 && cell.x < this.size && cell.y >= 0 && cell.y < this.size;
  }

  /**
   * 在棋盘上随机找一个不在 occupied 中的格子。
   * 先随机尝试 16 次以 O(1) 处理常见情况；失败后枚举所有空格再随机挑选。
   */
  findEmptyCell(rng: Rng, occupied: ReadonlySet<string>): Cell | null {
    for (let i = 0; i < 16; i++) {
      const x = rng.intRange(0, this.size);
      const y = rng.intRange(0, this.size);
      if (!occupied.has(`${x},${y}`)) return { x, y };
    }
    const empties: Cell[] = [];
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        if (!occupied.has(`${x},${y}`)) empties.push({ x, y });
      }
    }
    if (empties.length === 0) return null;
    return rng.pick(empties);
  }

  /** 工具：把 Cell 数组转换成 occupied 字符串集合。 */
  static toOccupied(cells: readonly Cell[]): Set<string> {
    const set = new Set<string>();
    for (const c of cells) set.add(`${c.x},${c.y}`);
    return set;
  }
}
