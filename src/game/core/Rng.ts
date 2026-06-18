export class Rng {
  private state: number;

  constructor(seed: number) {
    this.state = (seed >>> 0) || 1;
  }

  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  intRange(minInclusive: number, maxExclusive: number): number {
    return Math.floor(this.next() * (maxExclusive - minInclusive)) + minInclusive;
  }

  pick<T>(arr: readonly T[]): T {
    if (arr.length === 0) throw new Error('Rng.pick: empty array');
    return arr[this.intRange(0, arr.length)] as T;
  }

  pickWeighted<K extends string>(weights: Partial<Record<K, number>>): K {
    const entries = Object.entries(weights) as [K, number][];
    const total = entries.reduce((acc, [, w]) => acc + (w ?? 0), 0);
    if (total <= 0) throw new Error('Rng.pickWeighted: total weight must be positive');
    let r = this.next() * total;
    for (const [key, w] of entries) {
      r -= w ?? 0;
      if (r <= 0) return key;
    }
    return entries[entries.length - 1]![0];
  }
}

/** 由 'YYYY-MM-DD' 派生 32-bit 种子，用于每日挑战。 */
export function dailySeed(dateStr: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < dateStr.length; i++) {
    h ^= dateStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
