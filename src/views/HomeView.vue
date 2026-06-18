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

    <IslandPicker v-model:model="selectedIsland" />

    <div class="menu-buttons">
      <button
        class="btn-primary btn-free"
        @click="startFree"
      >
        自由散步
      </button>
      <button
        class="btn-primary btn-daily"
        @click="startDaily"
      >
        今日挑战
      </button>
    </div>

    <div class="footer-links">
      <button
        class="link-btn"
        @click="goSettings"
      >
        设置
      </button>
    </div>

    <div class="home-footer" />
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { IslandId } from '@/game/types';
import IslandPicker from '@/components/IslandPicker.vue';

const router = useRouter();
const selectedIsland = ref<IslandId>('spring');

function startFree() {
  router.push({ name: 'game', params: { island: selectedIsland.value }, query: { mode: 'free' } });
}

function startDaily() {
  router.push({ name: 'game', params: { island: selectedIsland.value }, query: { mode: 'daily' } });
}

function goSettings() {
  router.push({ name: 'settings' });
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
  padding: 48px 20px 32px;
  gap: 32px;
  background: @bg-color;
}
.title-area { text-align: center; }
.title {
  font-size: 48px;
  font-weight: 800;
  color: @text-color;
  margin: 0;
  letter-spacing: 0.02em;
  text-shadow: 0 2px 0 rgba(121, 79, 39, 0.1);
}
.subtitle {
  font-size: 16px;
  color: @text-color-secondary;
  margin: 8px 0 0;
  font-weight: 500;
}
.menu-buttons { display: flex; flex-direction: column; gap: 14px; width: 240px; }
.btn-primary {
  padding: 14px 32px;
  border: 2.5px solid @primary-color;
  border-radius: 50px;
  background: @primary-color;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.02em;
  box-shadow: 0 5px 0 0 #11a89b;

  &:hover {
    background: #3dd4c6;
    border-color: #3dd4c6;
    transform: translateY(-1px);
    box-shadow: 0 6px 0 0 #11a89b;
  }
  &:active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 0 #11a89b;
  }

  &.btn-daily {
    background: @bg-color-content;
    border-color: @border-color-light;
    color: @text-color;
    box-shadow: 0 5px 0 0 #d4c9b4;
    &:hover { border-color: @primary-color; color: @primary-color; box-shadow: 0 6px 0 0 #d4c9b4; }
    &:active { box-shadow: 0 1px 0 0 #d4c9b4; }
  }
}
.footer-links { margin-top: 8px; }
.link-btn {
  background: none;
  border: none;
  color: @text-color-secondary;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
  &:hover { color: @primary-color; }
}
.home-footer {
  width: 100%;
  height: 60px;
  margin-top: auto;
  background: linear-gradient(180deg, transparent 0%, @bg-color 30%);
  border-top: 2px dashed @border-color-light;
}
</style>
