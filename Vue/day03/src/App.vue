<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <h1 class="app-title">学生成绩管理</h1>
      <nav class="app-nav">
        <RouterLink to="/scores">成绩列表</RouterLink>
      </nav>
    </header>

    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 60px;
  background-color: #409eff;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.app-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.app-nav a {
  color: #fff;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  transition: background-color 0.3s;
}

.app-nav a:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.app-nav a.router-link-exact-active {
  background-color: rgba(255, 255, 255, 0.3);
  font-weight: 600;
}

.app-main {
  padding: 0;
}
</style>
