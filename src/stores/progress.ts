import { defineStore } from 'pinia';
import type { IslandId, FoodKind, TitleId, AchievementId, DailyRecord } from '@/game/types';

import { ISLANDS, ISLAND_ORDER } from '@/game/levels/islands';

const STORAGE_KEY = 'snake-game.progress';

interface ProgressState {
  version: number;
  highScore: Partial<Record<IslandId, number>>;
  cumulativeScore: number;
  unlockedIslands: IslandId[];
  dex: {
    fruits: FoodKind[];
    fossils: FoodKind[];
    titles: TitleId[];
  };
  achievements: AchievementId[];
  dailyHistory: DailyRecord[];
  meteorEatenTotal: number;
  consecutiveDailyDays: number;
  lastDailyDate?: string;
}

function defaultState(): ProgressState {
  return {
    version: 1,
    highScore: {},
    cumulativeScore: 0,
    unlockedIslands: ['spring'],
    dex: { fruits: [], fossils: [], titles: [] },
    achievements: [],
    dailyHistory: [],
    meteorEatenTotal: 0,
    consecutiveDailyDays: 0,
  };
}

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ProgressState;
      if (parsed.version === 1) return { ...defaultState(), ...parsed };
    }
  } catch { /* ignore */ }
  return defaultState();
}

function save(state: ProgressState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const useProgressStore = defineStore('progress', {
  state: (): ProgressState => load(),

  getters: {
    getHighScore: (state) => (island: IslandId): number => state.highScore[island] ?? 0,
  },

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

    addCumulativeScore(score: number): IslandId[] {
      this.cumulativeScore += score;
      const newlyUnlocked: IslandId[] = [];
      for (const id of ISLAND_ORDER) {
        if (this.unlockedIslands.includes(id)) continue;
        const island = ISLANDS[id];
        if (island.unlockSpecial === 'all_fossils') continue;
        if (this.cumulativeScore >= island.unlockScore) {
          this.unlockedIslands.push(id);
          newlyUnlocked.push(id);
        }
      }
      if (newlyUnlocked.length > 0) save(this.$state);
      return newlyUnlocked;
    },

    unlockFossilIsland(): boolean {
      if (this.unlockedIslands.includes('fossil')) return false;
      this.unlockedIslands.push('fossil');
      save(this.$state);
      return true;
    },

    addToDexFruit(kind: FoodKind): boolean {
      if (this.dex.fruits.includes(kind)) return false;
      this.dex.fruits.push(kind);
      save(this.$state);
      return true;
    },

    addToDexFossil(kind: FoodKind): boolean {
      if (this.dex.fossils.includes(kind)) return false;
      this.dex.fossils.push(kind);
      save(this.$state);
      return true;
    },

    addTitle(title: TitleId): boolean {
      if (this.dex.titles.includes(title)) return false;
      this.dex.titles.push(title);
      save(this.$state);
      return true;
    },

    unlockAchievement(id: AchievementId): boolean {
      if (this.achievements.includes(id)) return false;
      this.achievements.push(id);
      save(this.$state);
      return true;
    },

    recordDaily(record: DailyRecord): void {
      const existing = this.dailyHistory.find(r => r.date === record.date);
      if (existing && record.score <= existing.score) return;
      if (existing) {
        Object.assign(existing, record);
      } else {
        this.dailyHistory.push(record);
      }
      if (this.dailyHistory.length > 30) {
        this.dailyHistory = this.dailyHistory.slice(-30);
      }
      this.lastDailyDate = record.date;
      save(this.$state);
    },

    addMeteorEaten(): void {
      this.meteorEatenTotal++;
      save(this.$state);
    },

    updateConsecutiveDays(today: string): void {
      const yesterday = dayBefore(today);
      if (this.lastDailyDate === yesterday) {
        this.consecutiveDailyDays++;
      } else if (this.lastDailyDate !== today) {
        this.consecutiveDailyDays = 1;
      }
      this.lastDailyDate = today;
      save(this.$state);
    },

    exportJSON(): string {
      return JSON.stringify(this.$state, null, 2);
    },

    importJSON(json: string): boolean {
      try {
        const parsed = JSON.parse(json) as ProgressState;
        if (parsed.version === 1) {
          Object.assign(this.$state, defaultState(), parsed);
          save(this.$state);
          return true;
        }
      } catch { /* ignore */ }
      return false;
    },

    clearAll(): void {
      Object.assign(this.$state, defaultState());
      save(this.$state);
    },
  },
});

function dayBefore(date: string): string {
  const d = new Date(date + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}
