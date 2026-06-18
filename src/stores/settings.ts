import { defineStore } from 'pinia';
import type { DifficultyId } from '@/game/types';

const STORAGE_KEY = 'snake-game.settings';

interface SettingsState {
  difficulty: DifficultyId;
}

function load(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SettingsState;
  } catch { /* ignore */ }
  return { difficulty: 'normal' };
}

function save(state: SettingsState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => load(),
  getters: {
    tickMs: (s) => {
      const map: Record<DifficultyId, number> = { casual: 1000 / 4, normal: 1000 / 6, hard: 1000 / 10 };
      return map[s.difficulty];
    },
  },
  actions: {
    setDifficulty(d: DifficultyId) { this.difficulty = d; save(this.$state); },
  },
});
