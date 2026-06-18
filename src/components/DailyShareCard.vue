<template>
  <div
    ref="cardRef"
    class="share-card"
    :style="cardStyle"
  >
    <div class="share-header">
      今日挑战
    </div>
    <div class="share-date">
      {{ dateStr }}
    </div>
    <div class="share-island">
      {{ islandName }}
    </div>
    <div class="share-score">
      {{ score }} 分
    </div>
    <div class="share-length">
      长度 {{ length }} 节
    </div>
    <div class="share-footer">
      🕹️ 动森贪吃蛇
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { IslandId } from '@/game/types';
import { ISLANDS } from '@/game/levels/islands';

const props = defineProps<{
  dateStr: string;
  score: number;
  length: number;
  island: IslandId;
  accentColor: string;
  bgColor: string;
}>();

const cardRef = ref<HTMLElement | null>(null);

const islandName = computed(() => ISLANDS[props.island]?.name ?? '');
const cardStyle = computed(() => ({
  '--accent': props.accentColor,
  '--bg': props.bgColor,
}));

defineExpose({ cardRef });
</script>

<style lang="less" scoped>
.share-card {
  width: 420px;
  height: 560px;
  background: var(--bg, #f8f8f0);
  border: 4px solid var(--accent, #19c8b9);
  border-radius: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px;
  font-family: Nunito, 'Noto Sans SC', sans-serif;
  color: #794f27;
  box-sizing: border-box;
}
.share-header { font-size: 22px; font-weight: 700; }
.share-date { font-size: 16px; color: #9f927d; font-weight: 500; }
.share-island { font-size: 28px; font-weight: 800; color: var(--accent); }
.share-score { font-size: 64px; font-weight: 900; line-height: 1; }
.share-length { font-size: 18px; color: #725d42; font-weight: 600; }
.share-footer { font-size: 14px; color: #9f927d; margin-top: auto; }
</style>
