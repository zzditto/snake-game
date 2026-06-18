<template>
  <main class="home">
    <div class="title-area">
      <h1 class="title">
        动森贪吃蛇
      </h1>
      <p class="subtitle">
        在无人岛上收集水果吧
      </p>
    </div>
    <div class="menu-buttons">
      <button
        class="btn-primary"
        @click="startFree"
      >
        自由散步
      </button>
      <button
        class="btn-primary"
        @click="startDaily"
      >
        今日挑战
      </button>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function startFree() {
  router.push({ name: 'game', params: { island: 'spring' }, query: { mode: 'free' } });
}

function startDaily() {
  router.push({ name: 'game', params: { island: 'spring' }, query: { mode: 'daily' } });
}
</script>

<style lang="less" scoped>
@import '@/styles/tokens.less';

.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px 20px;
  gap: 48px;
  background: @bg-color;
}
.title-area { text-align: center; }
.title { font-size: 48px; color: @text-color; margin: 0; }
.subtitle { font-size: 16px; color: @text-color-secondary; margin: 8px 0 0; }
.menu-buttons { display: flex; flex-direction: column; gap: 16px; width: 240px; }
.btn-primary {
  padding: 14px 32px;
  border: none;
  border-radius: 999px;
  background: @primary-color;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  transition: background 0.2s;
  &:hover { background: #3dd4c6; }
  &:active { background: #11a89b; }
}
</style>
