<template>
  <main class="settings">
    <h2 class="settings-title">设置</h2>

    <section class="settings-group">
      <h3>难度</h3>
      <div class="radio-group">
        <button
          v-for="opt in difficulties"
          :key="opt.id"
          class="radio-btn"
          :class="{ active: settings.difficulty === opt.id }"
          @click="settings.setDifficulty(opt.id)"
        >
          {{ opt.label }}
        </button>
      </div>
    </section>

    <section class="settings-group">
      <h3>音量</h3>
      <div class="slider-row">
        <label>BGM</label>
        <input v-model.number="bgmVolume" type="range" min="0" max="100" class="slider">
        <span class="slider-val">{{ bgmVolume }}</span>
      </div>
      <div class="slider-row">
        <label>SFX</label>
        <input v-model.number="sfxVolume" type="range" min="0" max="100" class="slider">
        <span class="slider-val">{{ sfxVolume }}</span>
      </div>
    </section>

    <button class="back-btn" @click="goBack">返回主菜单</button>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { DifficultyId } from '@/game/types';
import { useSettingsStore } from '@/stores/settings';

const router = useRouter();
const settings = useSettingsStore();

const difficulties: { id: DifficultyId; label: string }[] = [
  { id: 'casual', label: '闲庭' },
  { id: 'normal', label: '慢跑' },
  { id: 'hard', label: '狂奔' },
];

const bgmVolume = ref(50);
const sfxVolume = ref(70);

function goBack() {
  router.push({ name: 'home' });
}
</script>

<style lang="less" scoped>
@import '@/styles/tokens.less';

.settings {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 48px 24px;
  gap: 32px;
  background: @bg-color;
}
.settings-title {
  font-size: 32px;
  font-weight: 800;
  color: @text-color;
  margin: 0;
}
.settings-group {
  width: 100%;
  max-width: 360px;
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: @text-color;
    margin: 0 0 12px;
  }
}
.radio-group {
  display: flex;
  gap: 8px;
}
.radio-btn {
  flex: 1;
  padding: 10px 16px;
  border: 2px solid @border-color-light;
  border-radius: 50px;
  background: @bg-color-content;
  color: @text-color-body;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &.active {
    background: @primary-color;
    border-color: @primary-color;
    color: #fff;
    box-shadow: 0 3px 0 0 #11a89b;
  }
  &:hover:not(.active) { border-color: @primary-color; color: @primary-color; }
}
.slider-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  label {
    min-width: 40px;
    font-size: 14px;
    font-weight: 600;
    color: @text-color;
  }
}
.slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: @border-color-light;
  border-radius: 3px;
  outline: none;
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: @primary-color;
    border: 2px solid #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.15);
    cursor: pointer;
  }
}
.slider-val {
  min-width: 30px;
  font-size: 14px;
  font-weight: 700;
  color: @text-color;
  text-align: right;
}
.back-btn {
  margin-top: 16px;
  padding: 10px 32px;
  border: 2px solid @border-color-light;
  border-radius: 50px;
  background: @bg-color-content;
  color: @text-color;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: @primary-color; color: @primary-color; }
}
</style>
