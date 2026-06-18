<template>
  <div
    v-if="visible"
    class="overlay"
  >
    <div class="modal">
      <h2>游戏结束</h2>
      <div class="stats">
        <p><strong>{{ score }}</strong> 分</p>
        <p>长度 {{ length }} 节</p>
        <p
          v-if="isNewHighScore"
          class="new-record"
        >
          新纪录!
        </p>
      </div>
      <div class="actions">
        <button @click="$emit('retry')">
          再来一局
        </button>
        <button
          class="secondary"
          @click="$emit('home')"
        >
          返回主菜单
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
  score: number;
  length: number;
  isNewHighScore: boolean;
}>();
defineEmits<{ retry: []; home: [] }>();
</script>

<style lang="less" scoped>
@import '@/styles/tokens.less';

.overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  z-index: 100;
}
.modal {
  background: @bg-color-content;
  border: 3px solid @text-color;
  border-radius: 24px;
  padding: 40px 48px;
  text-align: center;
  min-width: 280px;
}
h2 { color: @text-color; margin: 0 0 24px; }
.stats p { font-size: 16px; color: @text-color-body; margin: 8px 0; }
.new-record { color: @success-color; font-weight: 700; }
.actions { display: flex; gap: 12px; margin-top: 24px; justify-content: center; }
button {
  padding: 10px 28px;
  border: 2px solid @primary-color;
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
