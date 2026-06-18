import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import GameView from '@/views/GameView.vue';
import SettingsView from '@/views/SettingsView.vue';
import DexView from '@/views/DexView.vue';

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/game/:island?', name: 'game', component: GameView, props: true },
    { path: '/settings', name: 'settings', component: SettingsView },
    { path: '/dex', name: 'dex', component: DexView },
  ],
});
