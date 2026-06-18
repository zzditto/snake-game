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
      :mode="mode"
      :island="island"
      :new-unlocks="newUnlocks"
      :date-str="dateStr"
      :accent-color="accentColor"
      :bg-color="bgColor"
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
import type { IslandId, ModeId, AchievementId, TitleId } from '@/game/types';
import { ACHIEVEMENT_NAMES, TITLE_NAMES } from '@/game/types';
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
const newUnlocks = ref<string[]>([]);

const islandName = computed(() => ISLANDS[island]?.name ?? '未知岛');

const dateStr = computed(() => {
  if (mode === 'daily') {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  return '';
});

const accentColor = computed(() => ISLANDS[island]?.theme?.accent ?? '#19c8b9');
const bgColor = computed(() => ISLANDS[island]?.theme?.grassA ?? '#f8f8f0');

function onDie(payload: {
  score: number;
  length: number;
  island: IslandId;
  mode: ModeId;
  newAchievements: string[];
  newTitles: string[];
  newIslands: string[];
}) {
  finalScore.value = payload.score;
  finalLength.value = payload.length;
  isNewHigh.value = progress.updateHighScore(payload.island, payload.score);

  const unlocks: string[] = [];
  if (payload.newAchievements?.length) {
    unlocks.push(...payload.newAchievements.map(id => `🏆 成就: ${ACHIEVEMENT_NAMES[id as AchievementId] ?? id}`));
  }
  if (payload.newTitles?.length) {
    unlocks.push(...payload.newTitles.map(id => `🏅 称号: ${TITLE_NAMES[id as TitleId] ?? id}`));
  }
  if (payload.newIslands?.length) {
    unlocks.push(...payload.newIslands.map(id => `🏝️ 解锁新岛屿: ${ISLANDS[id as IslandId]?.name ?? id}`));
  }
  newUnlocks.value = unlocks;

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
  newUnlocks.value = [];
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
