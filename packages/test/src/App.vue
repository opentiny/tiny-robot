<template>
  <div class="app">
    <h1>Tiny Robot E2E Test App</h1>
    <nav>
      <ul>
        <li><a href="/" @click.prevent="currentComponent = 'Home'">首页</a></li>
        <li><a href="/container" @click.prevent="currentComponent = 'Container'">Container 组件</a></li>
      </ul>
    </nav>

    <main>
      <component :is="currentComponentInstance" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Component } from 'vue'
import Home from './home/index.vue'
import ContainerDemo from './container/index.vue'

// 定义组件名称类型
type ComponentName = 'Home' | 'Container'

const currentComponent = ref<ComponentName>('Home')

// 定义组件映射对象
const components: Record<ComponentName, Component> = {
  Home,
  Container: ContainerDemo,
}

// 计算属性确保类型安全
const currentComponentInstance = computed(() => {
  return components[currentComponent.value]
})
</script>

<style>
.app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
  padding: 20px;
}

nav ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 20px;
  margin: 20px 0;
}

nav a {
  color: #2c3e50;
  text-decoration: none;
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: all 0.3s;
}

nav a:hover {
  background-color: #f0f0f0;
}

main {
  margin-top: 30px;
}
</style>
