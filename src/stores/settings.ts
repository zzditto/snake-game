import { defineStore } from 'pinia';
import type { DifficultyId } from '@/game/types';
import { TICK_MS_BY_DIFFICULTY } from '@/game/types';

const STORAGE_KEY = 'snake-game.settings';

interface SettingsState {
  difficulty: DifficultyId;
  bgmVolume: number;
  sfxVolume: number;
}

function load(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaults(), ...JSON.parse(raw) as Partial<SettingsState> };
  } catch { /* ignore */ }
  return defaults();
}

function defaults(): SettingsState {
  return { difficulty: 'normal', bgmVolume: 70, sfxVolume: 70 };
}

function save(state: SettingsState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => load(),
  getters: {
    tickMs: (s) => TICK_MS_BY_DIFFICULTY[s.difficulty],
  },
  actions: {
    setDifficulty(d: DifficultyId) { this.difficulty = d; save(this.$state); },
    setBgmVolume(v: number) { this.bgmVolume = v; save(this.$state); },
    setSfxVolume(v: number) { this.sfxVolume = v; save(this.$state); },
  },
});
