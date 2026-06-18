<template>
  <div class="dpad">
    <div class="dpad-row">
      <button
        class="dpad-btn"
        @touchstart.prevent="$emit('dir', 'up')"
        @mousedown.prevent="$emit('dir', 'up')"
      >
        ▲
      </button>
    </div>
    <div class="dpad-row mid-row">
      <button
        class="dpad-btn"
        @touchstart.prevent="$emit('dir', 'left')"
        @mousedown.prevent="$emit('dir', 'left')"
      >
        ◀
      </button>
      <button
        class="dpad-btn pause-btn"
        @touchstart.prevent="$emit('pause')"
        @mousedown.prevent="$emit('pause')"
      >
        ⏸
      </button>
      <button
        class="dpad-btn"
        @touchstart.prevent="$emit('dir', 'right')"
        @mousedown.prevent="$emit('dir', 'right')"
      >
        ▶
      </button>
    </div>
    <div class="dpad-row">
      <button
        class="dpad-btn"
        @touchstart.prevent="$emit('dir', 'down')"
        @mousedown.prevent="$emit('dir', 'down')"
      >
        ▼
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Dir } from '@/game/types';
defineEmits<{ dir: [dir: Dir]; pause: [] }>();
</script>

<style lang="less" scoped>
.dpad {
  display: none;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 12px;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}
.dpad-row { display: flex; gap: 2px; }
.mid-row { gap: 12px; }
.dpad-btn {
  width: 56px; height: 56px;
  border: 2px solid rgba(121, 79, 39, 0.3);
  border-radius: 14px;
  background: rgba(247, 243, 223, 0.7);
  color: #794f27;
  font-size: 22px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 0.1s;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  &:active { background: rgba(25, 200, 185, 0.3); }
}
.pause-btn { font-size: 16px; width: 48px; height: 48px; }

@media (pointer: coarse) {
  .dpad { display: flex; }
}
</style>
