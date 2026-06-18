<template>
  <main class="dex-view">
    <h2 class="dex-title">图鉴</h2>

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="dex-grid">
      <DexCard
        v-for="item in currentItems"
        :key="item.id"
        :unlocked="item.unlocked"
        :name="item.name"
        :icon="item.icon"
      />
    </div>

    <div class="dex-footer">
      <span>已解锁 {{ unlockedCount }} / {{ totalCount }}</span>
      <div class="footer-actions">
        <button class="btn-small" @click="exportData">导出存档</button>
        <button class="btn-small" @click="importData">导入存档</button>
      </div>
    </div>

    <button class="back-btn" @click="goBack">返回主菜单</button>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import DexCard from '@/components/DexCard.vue';
import { useProgressStore } from '@/stores/progress';
import { ALL_FRUIT_KINDS, FOSSIL_KINDS, ALL_TITLE_IDS, TITLE_NAMES } from '@/game/types';

const router = useRouter();
const progress = useProgressStore();

const tabs = [
  { id: 'fruits', label: '水果' },
  { id: 'fossils', label: '化石' },
  { id: 'titles', label: '称号' },
] as const;

const activeTab = ref<'fruits' | 'fossils' | 'titles'>('fruits');

const FRUIT_ICONS: Record<string, string> = {
  apple: '🍎', cherry: '🍒', peach: '🍑', pear: '🍐', orange: '🍊',
  coconut: '🥥', watermelon: '🍉', persimmon: '🟠', chestnut: '🌰',
};

const FOSSIL_ICONS: Record<string, string> = {
  fossil_trilobite: '🦞', fossil_dino: '🦖', fossil_ammonite: '🐚',
  fossil_shell: '🦪', fossil_amber: '💛',
};

const currentItems = computed(() => {
  switch (activeTab.value) {
    case 'fruits':
      return ALL_FRUIT_KINDS.map(k => ({
        id: k, name: k, icon: FRUIT_ICONS[k] ?? '🍎',
        unlocked: progress.dex.fruits.includes(k),
      }));
    case 'fossils':
      return FOSSIL_KINDS.map(k => ({
        id: k, name: k.replace('fossil_', ''),
        icon: FOSSIL_ICONS[k] ?? '🦴',
        unlocked: progress.dex.fossils.includes(k),
      }));
    case 'titles':
      return ALL_TITLE_IDS.map(id => ({
        id, name: TITLE_NAMES[id], icon: '🏅',
        unlocked: progress.dex.titles.includes(id),
      }));
  }
});

const unlockedCount = computed(() => currentItems.value.filter(i => i.unlocked).length);
const totalCount = computed(() => currentItems.value.length);

function exportData() {
  const json = progress.exportJSON();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'snake-game-save.json'; a.click();
  URL.revokeObjectURL(url);
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json';
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    const text = await file.text();
    if (progress.importJSON(text)) {
      alert('存档导入成功！');
    } else {
      alert('导入失败，文件格式不正确。');
    }
  };
  input.click();
}

function goBack() { router.push({ name: 'home' }); }
</script>

<style lang="less" scoped>
@import '@/styles/tokens.less';

.dex-view {
  min-height: 100vh;
  padding: 32px 20px;
  background: @bg-color;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
.dex-title { font-size: 32px; font-weight: 800; color: @text-color; margin: 0; }
.tabs { display: flex; gap: 8px; }
.tab-btn {
  padding: 8px 20px; border: 2px solid @border-color-light; border-radius: 50px;
  background: @bg-color-content; color: @text-color-body; font-size: 15px;
  font-weight: 600; cursor: pointer; transition: all 0.2s;
  &.active { background: @primary-color; border-color: @primary-color; color: #fff; box-shadow: 0 3px 0 0 #11a89b; }
  &:hover:not(.active) { border-color: @primary-color; color: @primary-color; }
}
.dex-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 12px;
  max-width: 480px; width: 100%;
}
.dex-footer {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  max-width: 480px; width: 100%; padding: 12px 0;
  span { font-size: 14px; font-weight: 600; color: @text-color-secondary; }
}
.footer-actions { display: flex; gap: 8px; }
.btn-small {
  padding: 6px 14px; border: 2px solid @border-color-light; border-radius: 50px;
  background: @bg-color-content; color: @text-color; font-size: 12px;
  font-weight: 600; cursor: pointer;
  &:hover { border-color: @primary-color; color: @primary-color; }
}
.back-btn {
  margin-top: 8px; padding: 10px 32px; border: 2px solid @border-color-light; border-radius: 50px;
  background: @bg-color-content; color: @text-color; font-size: 15px;
  font-weight: 600; cursor: pointer;
  &:hover { border-color: @primary-color; color: @primary-color; }
}
</style>
