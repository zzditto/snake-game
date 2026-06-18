<template>
  <div
    ref="containerRef"
    class="game-canvas"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import type { IslandId, ModeId, DifficultyId, Dir } from '@/game/types';
import { BOARD_SIZE } from '@/game/types';
import { GameSession } from '@/game/GameSession';
import { createFreeMode } from '@/game/modes/FreeMode';
import { createDailyMode } from '@/game/modes/DailyMode';
import { getIsland } from '@/game/levels/islands';
import { InputController } from '@/game/core/InputController';
import { Renderer } from '@/game/render/Renderer';

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
  die: [payload: { score: number; length: number; island: IslandId; mode: ModeId }];
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

  session = new GameSession({
    island,
    mode,
    difficulty: props.difficulty,
    boardSize: BOARD_SIZE,
    maxFoodsOnBoard: 1,
  });

  if (!renderer) {
    renderer = new Renderer(container, BOARD_SIZE, island.theme, island.decorations);
  }

  session.onRender((_alpha, state) => {
    renderer?.draw(state, _alpha);
  });

  session.bus.on('eat', (p) => emit('eat', { foodKind: p.food.kind, snakeLength: p.snakeLength }));
  session.bus.on('die', (p) => emit('die', p));

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
