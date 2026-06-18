<template>
  <div
    v-if="visible"
    class="overlay"
    @click.self="$emit('resume')"
  >
    <div class="modal">
      <h2>游戏暂停</h2>
      <div class="actions">
        <button
          class="btn-primary"
          @click="$emit('resume')"
        >
          继续
        </button>
        <button
          class="btn-secondary"
          @click="$emit('home')"
        >
          返回主菜单
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ visible: boolean }>();
defineEmits<{ resume: []; home: [] }>();
</script>

<style lang="less" scoped>
@import '@/styles/tokens.less';

.overlay {
  position: fixed; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  z-index: 100; animation: fadeIn .2s ease;
}
.modal {
  background: @bg-color-content;
  border: 3px solid @text-color;
  border-radius: 24px;
  padding: 40px 48px;
  text-align: center;
  min-width: 260px;
}
h2 { color: @text-color; margin: 0 0 24px; font-size: 24px; font-weight: 700; }
.actions { display: flex; flex-direction: column; gap: 12px; }
.btn-primary {
  padding: 12px 32px; border: 2px solid @primary-color; border-radius: 50px;
  background: @primary-color; color: #fff; font-size: 16px; font-weight: 600; cursor: pointer;
  box-shadow: 0 4px 0 0 #11a89b;
  &:hover { background: #3dd4c6; transform: translateY(-1px); }
  &:active { transform: translateY(1px); box-shadow: 0 1px 0 0 #11a89b; }
}
.btn-secondary {
  padding: 10px 32px; border: 2px solid @border-color-light; border-radius: 50px;
  background: @bg-color-secondary; color: @text-color; font-size: 15px; font-weight: 600; cursor: pointer;
  &:hover { border-color: @primary-color; color: @primary-color; }
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
