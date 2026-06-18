import type { Island, IslandId } from '@/game/types';

const SPRING: Island = {
  id: 'spring',
  name: '春樱岛',
  unlockScore: 0,
  theme: {
    grassA: '#e8f4d6',
    grassB: '#dcecc4',
    grassNoise: 'rgba(0,0,0,0.04)',
    vignette: 'rgba(0,0,0,0.08)',
    snakeHead: '#794f27',
    snakeBodyStart: '#794f27',
    snakeBodyEnd: '#a87749',
    hatSprite: 'hat_cherry_blossom',
    accent: '#ffb6c1',
  },
  bgmKey: 'bgm_main',
  fruitWeights: { apple: 40, cherry: 35, peach: 20, meteor: 5 },
  decorations: [
    { spriteKey: 'cherry_tree', density: 0.15, zone: 'border' },
  ],
  ambientParticles: 'cherry_blossom',
};

const SUMMER: Island = {
  id: 'summer',
  name: '夏海岛',
  unlockScore: 200,
  theme: {
    grassA: '#d4ecf2', grassB: '#c0e0e8',
    grassNoise: 'rgba(0,0,0,0.04)', vignette: 'rgba(0,0,0,0.08)',
    snakeHead: '#794f27', snakeBodyStart: '#794f27', snakeBodyEnd: '#a87749',
    hatSprite: 'hat_shell', accent: '#19c8b9',
  },
  bgmKey: 'bgm_main',
  fruitWeights: { coconut: 35, watermelon: 30, orange: 25, meteor: 5, golden: 5 },
  decorations: [{ spriteKey: 'coconut_tree', density: 0.12, zone: 'border' }],
};

const AUTUMN: Island = {
  id: 'autumn',
  name: '秋枫岛',
  unlockScore: 600,
  theme: {
    grassA: '#f4e4c4', grassB: '#ecd4a4',
    grassNoise: 'rgba(0,0,0,0.04)', vignette: 'rgba(0,0,0,0.08)',
    snakeHead: '#794f27', snakeBodyStart: '#794f27', snakeBodyEnd: '#a87749',
    hatSprite: 'hat_maple_leaf', accent: '#d94b3a',
  },
  bgmKey: 'bgm_main',
  fruitWeights: {
    persimmon: 35, chestnut: 30, pear: 25,
    fossil_trilobite: 1, fossil_dino: 1, fossil_ammonite: 1,
    fossil_shell: 1, fossil_amber: 1,
    meteor: 5,
  },
  decorations: [{ spriteKey: 'maple_tree', density: 0.15, zone: 'border' }],
  ambientParticles: 'maple_leaf',
};

const WINTER: Island = {
  id: 'winter',
  name: '冬雪岛',
  unlockScore: 1200,
  theme: {
    grassA: '#eef2f6', grassB: '#dde4ec',
    grassNoise: 'rgba(0,0,0,0.04)', vignette: 'rgba(0,0,0,0.08)',
    snakeHead: '#794f27', snakeBodyStart: '#794f27', snakeBodyEnd: '#a87749',
    hatSprite: 'hat_snow', accent: '#a8c8e8',
  },
  bgmKey: 'bgm_main',
  fruitWeights: {
    apple: 30,
    fossil_trilobite: 4, fossil_dino: 4, fossil_ammonite: 4,
    fossil_shell: 4, fossil_amber: 4,
    meteor: 10, golden: 10, cherry: 15, peach: 15,
  },
  decorations: [{ spriteKey: 'pine_tree', density: 0.18, zone: 'border' }],
  ambientParticles: 'snow',
};

const FOSSIL: Island = {
  id: 'fossil',
  name: '化石岛',
  unlockScore: Number.POSITIVE_INFINITY,
  unlockSpecial: 'all_fossils',
  theme: {
    grassA: '#d4c4a8', grassB: '#b8a888',
    grassNoise: 'rgba(0,0,0,0.05)', vignette: 'rgba(0,0,0,0.1)',
    snakeHead: '#794f27', snakeBodyStart: '#794f27', snakeBodyEnd: '#a87749',
    hatSprite: 'hat_cherry_blossom', accent: '#c8a878',
  },
  bgmKey: 'bgm_main',
  fruitWeights: {
    fossil_trilobite: 10, fossil_dino: 10, fossil_ammonite: 10,
    fossil_shell: 10, fossil_amber: 10,
    meteor: 25, golden: 25,
  },
  decorations: [{ spriteKey: 'fossil_pit', density: 0.1, zone: 'scattered' }],
  ambientParticles: 'sand',
};

export const ISLANDS: Record<IslandId, Island> = {
  spring: SPRING,
  summer: SUMMER,
  autumn: AUTUMN,
  winter: WINTER,
  fossil: FOSSIL,
};

export const ISLAND_ORDER: IslandId[] = ['spring', 'summer', 'autumn', 'winter', 'fossil'];

export function getIsland(id: IslandId): Island {
  return ISLANDS[id];
}
