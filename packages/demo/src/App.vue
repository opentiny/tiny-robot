<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
</script>

<template>
  <div class="app-container">
    <nav class="nav-menu">
      <RouterLink to="/demo">Native Demo</RouterLink>
      <RouterLink to="/matechat-demo">MateChat Demo</RouterLink>
      <RouterLink to="/tiny-robot-demo">TinyRobot Demo</RouterLink>
    </nav>
    <div class="content-area">
      <RouterView />
    </div>
  </div>
</template>

<style>
/* 全局样式，确保根元素占满整个视口 */
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

#app {
  height: 100%;
}
</style>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.nav-menu {
  width: 200px;
  background-color: #f5f5f5;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e0e0e0;
  height: 100%;
  box-sizing: border-box;
}

.nav-menu a {
  color: #2c3e50;
  text-decoration: none;
  padding: 10px 20px;
  margin: 5px 0;
  transition: background-color 0.3s;
}

.nav-menu a:hover {
  background-color: #e8e8e8;
}

.nav-menu a.router-link-active {
  color: #42b883;
  font-weight: bold;
  background-color: #e8f5e9;
  border-left: 3px solid #42b883;
}

.content-area {
  flex: 1;
  padding: 20px;
  box-sizing: border-box;
  height: 100%;
  overflow: auto;
}
</style>
