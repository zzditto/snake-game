<template>
  <LoadingScreen
    :visible="loadingVisible"
    :progress="loadingProgress"
  />
  <RouterView />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterView } from 'vue-router';
import LoadingScreen from '@/components/LoadingScreen.vue';

const loadingVisible = ref(true);
const loadingProgress = ref(0);

onMounted(() => {
  let p = 0;
  const timer = setInterval(() => {
    p += Math.random() * 15 + 5;
    if (p >= 100) {
      p = 100;
      clearInterval(timer);
      setTimeout(() => { loadingVisible.value = false; }, 500);
    }
    loadingProgress.value = p;
  }, 150);
});
</script>
