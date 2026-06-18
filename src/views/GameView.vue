<template>
  <main class="game-view">
    <GameHUD
      :score="score"
      :length="snakeLength"
      :island-name="islandName"
      @pause="togglePause"
    />
    <div class="canvas-area">
      <GameCanvas
        ref="canvasRef"
        :island="island"
        :mode="mode"
        :difficulty="difficulty"
        @die="onDie"
        @eat="onEat"
        @score-change="(v) => score = v"
      />
    </div>
    <GameOverModal
      :visible="gameOverVisible"
      :score="finalScore"
      :length="finalLength"
      :is-new-high-score="isNewHigh"
      @retry="retry"
      @home="goHome"
    />
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import GameCanvas from '@/components/GameCanvas.vue';
import GameHUD from '@/components/GameHUD.vue';
import GameOverModal from '@/components/GameOverModal.vue';
import { useSettingsStore } from '@/stores/settings';
import { useProgressStore } from '@/stores/progress';
import type { IslandId, ModeId } from '@/game/types';
import { ISLANDS } from '@/game/levels/islands';

const route = useRoute();
const router = useRouter();
const settings = useSettingsStore();
const progress = useProgressStore();

const canvasRef = ref<InstanceType<typeof GameCanvas> | null>(null);

const island = (route.params.island ?? 'spring') as IslandId;
const mode = (route.query.mode ?? 'free') as ModeId;
const difficulty = computed(() => settings.difficulty);

const score = ref(0);
const snakeLength = ref(3);
const gameOverVisible = ref(false);
const finalScore = ref(0);
const finalLength = ref(0);
const isNewHigh = ref(false);

const islandName = computed(() => ISLANDS[island]?.name ?? '未知岛');

function onDie(payload: { score: number; length: number; island: IslandId; mode: ModeId }) {
  finalScore.value = payload.score;
  finalLength.value = payload.length;
  isNewHigh.value = progress.updateHighScore(payload.island, payload.score);
  gameOverVisible.value = true;
}

function onEat(_payload: { foodKind: string; snakeLength: number }) {
  snakeLength.value = _payload.snakeLength;
}

function togglePause() {
  canvasRef.value?.pause();
}

function retry() {
  gameOverVisible.value = false;
  canvasRef.value?.reset();
}

function goHome() {
  router.push({ name: 'home' });
}
</script>

<style lang="less" scoped>
@import '@/styles/tokens.less';

.game-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: @bg-color;
}
.canvas-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
</style>
