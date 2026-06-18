<template>
  <div
    ref="areaRef"
    class="swipe-area"
    @touchstart="onStart"
    @touchmove.prevent="onMove"
    @touchend="onEnd"
    @mousedown="onStartMouse"
    @mousemove.prevent="onMoveMouse"
    @mouseup="onEnd"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Dir } from '@/game/types';

const emit = defineEmits<{ swipe: [dir: Dir] }>();

const startX = ref(0);
const startY = ref(0);
const active = ref(false);

function onStart(e: TouchEvent) {
  startX.value = e.touches[0]!.clientX;
  startY.value = e.touches[0]!.clientY;
  active.value = true;
}
function onMove(e: TouchEvent) {
  if (!active.value) return;
  const dx = e.touches[0]!.clientX - startX.value;
  const dy = e.touches[0]!.clientY - startY.value;
  if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
  active.value = false;
  if (Math.abs(dx) > Math.abs(dy)) {
    emit('swipe', dx > 0 ? 'right' : 'left');
  } else {
    emit('swipe', dy > 0 ? 'down' : 'up');
  }
}
function onEnd() { active.value = false; }

function onStartMouse(e: MouseEvent) {
  startX.value = e.clientX;
  startY.value = e.clientY;
  active.value = true;
}
function onMoveMouse(e: MouseEvent) {
  if (!active.value) return;
  const dx = e.clientX - startX.value;
  const dy = e.clientY - startY.value;
  if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
  active.value = false;
  if (Math.abs(dx) > Math.abs(dy)) {
    emit('swipe', dx > 0 ? 'right' : 'left');
  } else {
    emit('swipe', dy > 0 ? 'down' : 'up');
  }
}
</script>

<style lang="less" scoped>
.swipe-area {
  display: none;
  position: absolute; inset: 0;
  z-index: 5;
}
@media (pointer: coarse) {
  .swipe-area { display: block; }
}
</style>
