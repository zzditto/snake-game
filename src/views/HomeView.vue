<template>
  <main class="home">
    <h1>动森贪吃蛇</h1>
    <button @click="start">
      开始游戏
    </button>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();
const start = () => router.push({ name: 'game', params: { island: 'spring' } });
</script>

<style lang="less" scoped>
.home { display: flex; flex-direction: column; align-items: center; padding: 80px 20px; gap: 32px; }
h1 { font-size: 48px; color: #794f27; }
button { padding: 12px 48px; font-size: 18px; border-radius: 999px; border: 2px solid #794f27; background: #19c8b9; color: white; cursor: pointer; }
</style>
