<template>
  <div class="dex-card" :class="{ locked: !unlocked }">
    <div class="card-icon">{{ unlocked ? icon : '❓' }}</div>
    <div class="card-name">{{ unlocked ? name : '???' }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ unlocked: boolean; name: string; icon: string }>();
</script>

<style lang="less" scoped>
@import '@/styles/tokens.less';

.dex-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 16px;
  border: 2px solid @border-color-light;
  border-radius: 16px;
  background: @bg-color-content;
  transition: all 0.2s;
  &.locked { opacity: 0.45; filter: grayscale(1); }
  &.unlocked:hover { border-color: @primary-color; transform: translateY(-2px); }
}
.card-icon { font-size: 28px; }
.card-name { font-size: 12px; font-weight: 600; color: @text-color; }
</style>
