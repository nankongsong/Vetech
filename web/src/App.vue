<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
/* 全局重置：去掉 Vite 默认样式影响 */
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
}
</style>
