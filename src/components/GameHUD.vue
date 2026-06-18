<template>
  <div class="hud">
    <div class="hud-item">
      <span class="hud-label">分数</span>
      <span class="hud-value">{{ score }}</span>
    </div>
    <div class="hud-item">
      <span class="hud-label">长度</span>
      <span class="hud-value">{{ length }}</span>
    </div>
    <div class="hud-item">
      <span class="hud-label">岛屿</span>
      <span class="hud-value">{{ islandName }}</span>
    </div>
    <button
      class="hud-pause"
      @click="$emit('pause')"
    >
      暂停
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  score: number;
  length: number;
  islandName: string;
}>();
defineEmits<{ pause: [] }>();
</script>

<style lang="less" scoped>
@import '@/styles/tokens.less';

.hud {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 12px 24px;
  background: @bg-color-content;
  border-bottom: 2px solid @border-color-light;
  flex-wrap: wrap;
}
.hud-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.hud-label {
  font-size: 11px;
  color: @text-color-secondary;
}
.hud-value {
  font-size: 20px;
  font-weight: 700;
  color: @text-color;
}
.hud-pause {
  padding: 6px 20px;
  border: 2px solid @text-color;
  border-radius: 999px;
  background: @bg-color;
  color: @text-color;
  font-size: 14px;
  cursor: pointer;
  &:hover { background: @primary-color; color: #fff; border-color: @primary-color; }
}
</style>
