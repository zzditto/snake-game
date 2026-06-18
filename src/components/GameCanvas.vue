<template>
  <div
    ref="containerRef"
    class="game-canvas"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import type { IslandId, ModeId, DifficultyId, Dir, AchievementId, TitleId } from '@/game/types';
import { BOARD_SIZE } from '@/game/types';
import { GameSession } from '@/game/GameSession';
import { createFreeMode } from '@/game/modes/FreeMode';
import { createDailyMode } from '@/game/modes/DailyMode';
import { getIsland } from '@/game/levels/islands';
import { InputController } from '@/game/core/InputController';
import { Renderer } from '@/game/render/Renderer';
import { useProgressStore } from '@/stores/progress';

const props = withDefaults(defineProps<{
  island: IslandId;
  mode: ModeId;
  difficulty: DifficultyId;
}>(), {
  island: 'spring',
  mode: 'free',
  difficulty: 'normal',
});

const emit = defineEmits<{
  scoreChange: [score: number];
  die: [payload: {
    score: number;
    length: number;
    island: IslandId;
    mode: ModeId;
    newAchievements: string[];
    newTitles: string[];
    newIslands: string[];
  }];
  eat: [payload: { foodKind: string; snakeLength: number }];
}>();

const containerRef = ref<HTMLElement | null>(null);

let session: GameSession | null = null;
let renderer: Renderer | null = null;
let inputCtrl: InputController | null = null;

function initGame(): void {
  const container = containerRef.value;
  if (!container) return;

  const island = getIsland(props.island);
  const mode = props.mode === 'free'
    ? createFreeMode()
    : createDailyMode();

  const progress = useProgressStore();
  const newAchievements: string[] = [];
  const newTitles: string[] = [];

  session = new GameSession({
    island,
    mode,
    difficulty: props.difficulty,
    boardSize: BOARD_SIZE,
    maxFoodsOnBoard: 1,
    onDexFruit: (kind) => { progress.addToDexFruit(kind); },
    onDexFossil: (kind) => { progress.addToDexFossil(kind); },
    onMeteorEaten: () => { progress.addMeteorEaten(); },
    onUnlockAchievement: (id: AchievementId) => {
      if (progress.unlockAchievement(id)) newAchievements.push(id);
    },
    onUnlockTitle: (id: TitleId) => {
      if (progress.addTitle(id)) newTitles.push(id);
    },
  });

  if (!renderer) {
    renderer = new Renderer(container, BOARD_SIZE, island.theme, island.decorations, props.island);
  }

  session.onRender((alpha, state) => {
    if (!state.snake.alive && !renderer!.hasTriggeredDeath) {
      renderer!.triggerDeath();
      renderer!.hasTriggeredDeath = true;
    }
    renderer!.draw(state, alpha);
  });

  session.bus.on('eat', (p) => {
    const state = session!.state;
    const food = state.foods.find(f =>
      f.cell.x === state.snake.body[0]!.x && f.cell.y === state.snake.body[0]!.y
    ) ?? p.food;
    renderer?.triggerEatParticles(food.cell.x, food.cell.y, p.food.kind);
    emit('eat', { foodKind: p.food.kind, snakeLength: p.snakeLength });
  });
  session.bus.on('die', (p) => {
    const newIslands = progress.addCumulativeScore(p.score);
    emit('die', {
      score: p.score,
      length: p.length,
      island: props.island,
      mode: props.mode,
      newAchievements,
      newTitles,
      newIslands,
    });
  });

  inputCtrl = new InputController({
    target: document,
    onDirection: (dir: Dir) => session?.queueDirection(dir),
    onPauseToggle: () => {
      if (!session) return;
      session.isPaused() ? session.resume() : session.pause();
    },
    onPauseRequest: () => session?.pause(),
    onReset: () => reset(),
  });
  inputCtrl.attach();

  session.start();
}

onMounted(() => { initGame(); });

function reset(): void {
  session?.destroy();
  inputCtrl?.detach();
  renderer?.resetAnimation();
  initGame();
}

function pause(): void { session?.pause(); }
function resume(): void { session?.resume(); }

watch(() => session?.state.score, (v) => { if (v !== undefined) emit('scoreChange', v); });

onBeforeUnmount(() => {
  session?.destroy();
  renderer?.destroy();
  inputCtrl?.detach();
});

defineExpose({ reset, pause, resume });
</script>

<style lang="less" scoped>
.game-canvas {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  max-width: 640px;
  margin: 0 auto;
}
</style>
