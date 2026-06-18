<template>
  <div class="island-picker">
    <h3 class="picker-label">
      选择岛屿
    </h3>
    <div class="island-cards">
      <button
        v-for="island in islandList"
        :key="island.id"
        class="island-card"
        :class="{ unlocked: island.unlocked, selected: island.id === model }"
        :disabled="!island.unlocked"
        @click="select(island.id)"
      >
        <div class="card-icon">
          {{ island.emoji }}
        </div>
        <div class="card-name">
          {{ island.name }}
        </div>
        <div
          v-if="!island.unlocked"
          class="card-lock"
        >
          🔒
        </div>
        <div
          v-if="!island.unlocked"
          class="card-hint"
        >
          {{ island.hint }}
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { IslandId } from '@/game/types';
import { ISLANDS, ISLAND_ORDER } from '@/game/levels/islands';
import { useProgressStore } from '@/stores/progress';

defineProps<{ model: IslandId }>();
const emit = defineEmits<{ 'update:model': [id: IslandId] }>();

const progress = useProgressStore();

const ISLAND_EMOJI: Record<IslandId, string> = {
  spring: '🌸', summer: '🌊', autumn: '🍂', winter: '❄️', fossil: '🦴',
};

const islandList = computed(() =>
  ISLAND_ORDER.map((id) => {
    const island = ISLANDS[id];
    const unlocked = island.unlockScore === 0 || progress.getHighScore('spring') >= island.unlockScore;
    return {
      id,
      name: island.name,
      emoji: ISLAND_EMOJI[id],
      unlocked,
      hint: island.unlockSpecial === 'all_fossils'
        ? '集齐化石解锁'
        : `累计 ${island.unlockScore} 分解锁`,
    };
  }),
);

function select(id: IslandId) {
  emit('update:model', id);
}
</script>

<style lang="less" scoped>
@import '@/styles/tokens.less';

.picker-label {
  font-size: 18px;
  color: @text-color;
  font-weight: 700;
  margin: 0 0 16px;
  text-align: center;
}
.island-cards {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}
.island-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 20px;
  border: 2.5px solid @border-color-light;
  border-radius: 20px;
  background: @bg-color-content;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 90px;
  font-family: inherit;

  &.unlocked {
    &:hover {
      border-color: @primary-color;
      transform: translateY(-2px);
      box-shadow: 0 3px 10px rgba(61, 52, 40, 0.1);
    }
    &.selected {
      border-color: @primary-color;
      background: #e6f9f6;
      box-shadow: 0 0 0 3px rgba(25, 200, 185, 0.15);
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
.card-icon { font-size: 32px; }
.card-name { font-size: 13px; font-weight: 600; color: @text-color; }
.card-lock { font-size: 14px; margin-top: 2px; }
.card-hint { font-size: 10px; color: @text-color-secondary; text-align: center; max-width: 80px; }
</style>
