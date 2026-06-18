import { defineStore } from 'pinia';
import type { IslandId } from '@/game/types';

const STORAGE_KEY = 'snake-game.progress';

interface ProgressState {
  version: 1;
  highScore: Partial<Record<IslandId, number>>;
}

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ProgressState;
      if (parsed.version === 1) return parsed;
    }
  } catch { /* ignore */ }
  return { version: 1, highScore: {} };
}

function save(state: ProgressState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const useProgressStore = defineStore('progress', {
  state: (): ProgressState => load(),
  actions: {
    updateHighScore(island: IslandId, score: number): boolean {
      const prev = this.highScore[island] ?? 0;
      if (score > prev) {
        this.highScore[island] = score;
        save(this.$state);
        return true;
      }
      return false;
    },
    getHighScore(island: IslandId): number {
      return this.highScore[island] ?? 0;
    },
  },
});
