<template>
  <div class="app">
    <h1>Tiny Robot E2E Test App</h1>
    <nav>
      <ul>
        <li><a href="/" @click.prevent="navigate('Home', '/')">首页</a></li>
        <li><a href="/attachments" @click.prevent="navigate('Attachments', '/attachments')">Attachments 组件</a></li>
        <li><a href="/container" @click.prevent="navigate('Container', '/container')">Container 组件</a></li>
        <li><a href="/layout" @click.prevent="navigate('Layout', '/layout')">Layout 组件</a></li>
        <li><a href="/sender" @click.prevent="navigate('Sender', '/sender')">Sender 组件</a></li>
      </ul>
    </nav>

    <main>
      <component :is="currentComponentInstance" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import type { Component } from 'vue'
import Home from './home/index.vue'
import AttachmentsDemo from './attachments/index.vue'
import ContainerDemo from './container/index.vue'
import LayoutDemo from './layout/index.vue'
import SenderDemo from './sender/index.vue'

type ComponentName = 'Home' | 'Attachments' | 'Container' | 'Layout' | 'Sender'

function resolveComponentFromPath(pathname: string): ComponentName {
  switch (pathname) {
    case '/attachments':
      return 'Attachments'
    case '/container':
      return 'Container'
    case '/layout':
      return 'Layout'
    case '/sender':
      return 'Sender'
    default:
      return 'Home'
  }
}

const currentComponent = ref<ComponentName>(
  typeof window === 'undefined' ? 'Home' : resolveComponentFromPath(window.location.pathname),
)

const components: Record<ComponentName, Component> = {
  Home,
  Attachments: AttachmentsDemo,
  Container: ContainerDemo,
  Layout: LayoutDemo,
  Sender: SenderDemo,
}

const currentComponentInstance = computed(() => components[currentComponent.value])

function syncComponentFromLocation() {
  currentComponent.value = resolveComponentFromPath(window.location.pathname)
}

function navigate(component: ComponentName, path: string) {
  currentComponent.value = component

  if (typeof window === 'undefined' || window.location.pathname === path) {
    return
  }

  window.history.pushState({}, '', path)
}

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', syncComponentFromLocation)

  onBeforeUnmount(() => {
    window.removeEventListener('popstate', syncComponentFromLocation)
  })
}
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
