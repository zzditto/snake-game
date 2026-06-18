export interface Cell {
  x: number;
  y: number;
}

export type Dir = 'up' | 'down' | 'left' | 'right';

export type IslandId = 'spring' | 'summer' | 'autumn' | 'winter' | 'fossil';

export type DifficultyId = 'casual' | 'normal' | 'hard';

export type ModeId = 'free' | 'daily';

export type FoodKind =
  | 'apple' | 'cherry' | 'peach' | 'pear' | 'orange' | 'coconut' | 'watermelon'
  | 'persimmon' | 'chestnut'
  | 'fossil_trilobite' | 'fossil_dino' | 'fossil_ammonite'
  | 'fossil_shell' | 'fossil_amber'
  | 'meteor' | 'golden';

export interface SnakeState {
  body: Cell[];
  direction: Dir;
  pendingDirection: Dir;
  growthQueue: number;
  alive: boolean;
  invincibleUntil?: number;
}

export interface Food {
  cell: Cell;
  kind: FoodKind;
  spawnedAt: number;
  expiresAt?: number;
  score: number;
}

export interface ThemeTokens {
  grassA: string;
  grassB: string;
  grassNoise: string;
  vignette: string;
  snakeHead: string;
  snakeBodyStart: string;
  snakeBodyEnd: string;
  hatSprite: string;
  accent: string;
}

export interface DecorationDef {
  spriteKey: string;
  density: number;
  zone: 'border' | 'corner' | 'scattered';
}

export interface Island {
  id: IslandId;
  name: string;
  unlockScore: number;
  unlockSpecial?: 'all_fossils';
  theme: ThemeTokens;
  bgmKey: string;
  fruitWeights: Partial<Record<FoodKind, number>>;
  decorations: DecorationDef[];
  ambientParticles?: 'cherry_blossom' | 'maple_leaf' | 'snow' | 'sand';
}

export interface GameState {
  snake: SnakeState;
  foods: Food[];
  obstacles: Cell[];
  score: number;
  comboCount: number;
  tickCount: number;
  startedAt: number;
  island: IslandId;
  mode: ModeId;
}

export interface GameMode {
  id: ModeId;
  shouldSpawnObstacles: boolean;
  rngSeed?: number;
  obstacleDensity?: number;
  onTickHook?: (state: GameState) => void;
}

export const BOARD_SIZE = 22;

export const FOOD_SCORE: Record<FoodKind, number> = {
  apple: 1, cherry: 1, peach: 1, pear: 1, orange: 1,
  coconut: 1, watermelon: 1, persimmon: 1, chestnut: 1,
  meteor: 5, golden: 3,
  fossil_trilobite: 10, fossil_dino: 10, fossil_ammonite: 10,
  fossil_shell: 10, fossil_amber: 10,
};

export const FOSSIL_KINDS: FoodKind[] = [
  'fossil_trilobite', 'fossil_dino', 'fossil_ammonite',
  'fossil_shell', 'fossil_amber',
];

export const TICK_MS_BY_DIFFICULTY: Record<DifficultyId, number> = {
  casual: 1000 / 4,
  normal: 1000 / 6,
  hard: 1000 / 10,
};

export const SPEED_UP_EVERY = 5;
export const SPEED_UP_FACTOR = 0.95;
export const SPEED_CAP_TICK_MS = 1000 / 12;

export const METEOR_LIFETIME_MS = 10_000;
export const GOLDEN_INVINCIBLE_MS = 3_000;

// === 成就与称号 ===

export type AchievementId =
  | 'gourmet' | 'long_dragon' | 'meteor_hunter' | 'paleontologist'
  | 'spring_clear' | 'summer_clear' | 'autumn_clear'
  | 'winter_clear' | 'fossil_clear' | 'daily_warrior';

export type TitleId =
  | 'rookie' | 'gourmet' | 'long_dragon' | 'meteor_hunter'
  | 'paleontologist' | 'spring_visitor' | 'summer_visitor'
  | 'autumn_visitor' | 'winter_visitor' | 'traveler';

// === 进度持久化（阶段 3 完整版）===

export interface DailyRecord {
  date: string;
  score: number;
  seed: number;
  island: IslandId;
  length: number;
}

export interface ProgressState {
  version: 1;
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

export const ALL_FRUIT_KINDS: FoodKind[] = [
  'apple', 'cherry', 'peach', 'pear', 'orange', 'coconut',
  'watermelon', 'persimmon', 'chestnut',
];

export const ALL_TITLE_IDS: TitleId[] = [
  'rookie', 'gourmet', 'long_dragon', 'meteor_hunter',
  'paleontologist', 'spring_visitor', 'summer_visitor',
  'autumn_visitor', 'winter_visitor', 'traveler',
];

export const ALL_ACHIEVEMENT_IDS: AchievementId[] = [
  'gourmet', 'long_dragon', 'meteor_hunter', 'paleontologist',
  'spring_clear', 'summer_clear', 'autumn_clear',
  'winter_clear', 'fossil_clear', 'daily_warrior',
];

export const ACHIEVEMENT_NAMES: Record<AchievementId, string> = {
  gourmet: '美食家', long_dragon: '长龙', meteor_hunter: '流星猎人',
  paleontologist: '化石学家', spring_clear: '春樱征服者', summer_clear: '夏海征服者',
  autumn_clear: '秋枫征服者', winter_clear: '冬雪征服者', fossil_clear: '化石征服者',
  daily_warrior: '每日战士',
};

export const TITLE_NAMES: Record<TitleId, string> = {
  rookie: '新手', gourmet: '美食家', long_dragon: '长龙',
  meteor_hunter: '流星猎人', paleontologist: '化石学家',
  spring_visitor: '春之访客', summer_visitor: '夏之访客',
  autumn_visitor: '秋之访客', winter_visitor: '冬之访客', traveler: '旅者',
};
