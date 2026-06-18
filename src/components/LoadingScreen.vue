<template>
  <Transition name="fade">
    <div v-if="visible" class="loading-screen">
      <div class="loading-content">
        <div class="spinner" />
        <p class="loading-text">动森贪吃蛇</p>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{ visible: boolean; progress: number }>();
</script>

<style lang="less" scoped>
@import '@/styles/tokens.less';

.loading-screen {
  position: fixed; inset: 0; z-index: 1000;
  display: flex; align-items: center; justify-content: center;
  background: @bg-color;
}
.loading-content { display: flex; flex-direction: column; align-items: center; gap: 24px; }
.spinner {
  width: 48px; height: 48px;
  border: 4px solid @border-color-light;
  border-top-color: @primary-color;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { font-size: 20px; font-weight: 700; color: @text-color; }
.progress-bar {
  width: 200px; height: 6px;
  background: @border-color-light;
  border-radius: 3px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: @primary-color;
  border-radius: 3px;
  transition: width 0.3s ease;
}
.fade-leave-active { transition: opacity 0.5s ease; }
.fade-leave-to { opacity: 0; }
</style>
