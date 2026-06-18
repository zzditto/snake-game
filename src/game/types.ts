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
