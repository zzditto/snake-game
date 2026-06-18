<template>
  <div v-if="visible" class="overlay">
    <div class="modal">
      <h2>游戏结束</h2>
      <div class="stats">
        <p><strong>{{ score }}</strong> 分</p>
        <p>长度 {{ length }} 节</p>
        <p v-if="isNewHighScore" class="new-record">新纪录!</p>
      </div>

      <div v-if="newUnlocks.length > 0" class="unlocks">
        <p v-for="item in newUnlocks" :key="item" class="unlock-item">✨ {{ item }}</p>
      </div>

      <div v-if="isDaily" class="share-section">
        <DailyShareCard
          ref="shareCardRef"
          :date-str="dateStr"
          :score="score"
          :length="length"
          :island="island"
          :accent-color="accentColor"
          :bg-color="bgColor"
        />
        <button class="save-btn" @click="saveImage">保存图片</button>
      </div>

      <div class="actions">
        <button @click="$emit('retry')">再来一局</button>
        <button class="secondary" @click="$emit('home')">返回主菜单</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { IslandId } from '@/game/types';
import DailyShareCard from '@/components/DailyShareCard.vue';
import html2canvas from 'html2canvas';

const props = withDefaults(defineProps<{
  visible: boolean;
  score: number;
  length: number;
  isNewHighScore: boolean;
  mode?: string;
  island?: IslandId;
  newUnlocks?: string[];
  dateStr?: string;
  accentColor?: string;
  bgColor?: string;
}>(), {
  mode: 'free',
  island: 'spring',
  newUnlocks: () => [],
  dateStr: '',
  accentColor: '#19c8b9',
  bgColor: '#f8f8f0',
});

defineEmits<{ retry: []; home: [] }>();

const shareCardRef = ref<InstanceType<typeof DailyShareCard> | null>(null);
const isDaily = computed(() => props.mode === 'daily');

async function saveImage() {
  const el = shareCardRef.value?.cardRef;
  if (!el) return;
  const canvas = await html2canvas(el, { scale: 2, useCORS: true });
  const link = document.createElement('a');
  link.download = `snake-daily-${props.dateStr || 'challenge'}.png`;
  link.href = canvas.toDataURL();
  link.click();
}
</script>

<style lang="less" scoped>
@import '@/styles/tokens.less';

.overlay {
  position: fixed; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0, 0, 0, 0.4); z-index: 100;
}
.modal {
  background: @bg-color-content; border: 3px solid @text-color;
  border-radius: 24px; padding: 40px 48px; text-align: center;
  min-width: 280px; max-height: 90vh; overflow-y: auto;
}
h2 { color: @text-color; margin: 0 0 24px; }
.stats p { font-size: 16px; color: @text-color-body; margin: 8px 0; }
.new-record { color: @success-color; font-weight: 700; }
.unlocks { margin: 16px 0; }
.unlock-item { font-size: 14px; color: @primary-color; font-weight: 600; margin: 4px 0; }
.share-section { display: flex; flex-direction: column; align-items: center; gap: 12px; margin: 16px 0; }
.save-btn {
  padding: 8px 20px; border: 2px solid @primary-color; border-radius: 50px;
  background: @primary-color; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer;
  &:hover { background: #3dd4c6; }
}
.actions { display: flex; gap: 12px; margin-top: 24px; justify-content: center; }
button {
  padding: 10px 28px; border: 2px solid @primary-color;
  border-radius: 50px;
  background: @primary-color;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.02em;
  box-shadow: 0 4px 0 0 #11a89b;
  transition: all 0.2s;
  &:hover {
    background: #3dd4c6;
    border-color: #3dd4c6;
    transform: translateY(-1px);
    box-shadow: 0 5px 0 0 #11a89b;
  }
  &:active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 0 #11a89b;
  }
  &.secondary {
    background: @bg-color-secondary;
    border-color: @border-color-light;
    color: @text-color;
    box-shadow: 0 4px 0 0 #d4c9b4;
    &:hover { border-color: @primary-color; color: @primary-color; box-shadow: 0 5px 0 0 #d4c9b4; }
    &:active { box-shadow: 0 1px 0 0 #d4c9b4; }
  }
}
</style>
