<script setup lang="ts">
import { computed } from 'vue'
import BuiltInKit from './cases/built-in-kit.vue'
import CustomRuntime from './cases/custom-runtime.vue'
import ExistingKit from './cases/existing-kit.vue'
import MinimalCustomRuntime from './cases/minimal-custom-runtime.vue'

const demos = [
  {
    id: 'built-in-kit',
    path: '/built-in-kit',
    aliases: ['/', '/basic', '/local-runtime', '/kit-quick-start'],
    title: 'Built-in Kit',
    component: BuiltInKit,
  },
  {
    id: 'existing-kit',
    path: '/existing-kit',
    aliases: ['/kit-runtime', '/kit-existing-runtime'],
    title: 'Existing Kit',
    component: ExistingKit,
  },
  {
    id: 'custom-runtime',
    path: '/custom-runtime',
    aliases: ['/external-runtime'],
    title: 'Custom Runtime',
    component: CustomRuntime,
  },
  {
    id: 'minimal-custom-runtime',
    path: '/minimal-custom-runtime',
    aliases: ['/minimal-runtime'],
    title: 'Minimal Runtime',
    component: MinimalCustomRuntime,
  },
]

const currentPath = window.location.pathname
const currentDemo = computed(
  () =>
    demos.find((demo) => demo.path === currentPath || demo.aliases.some((alias) => alias === currentPath)) ?? demos[0],
)
</script>

<template>
  <div class="demo-app">
    <nav class="demo-paths" aria-label="Chat Runtime Paths">
      <div class="demo-paths__brand">
        <strong>TrChat MVP</strong>
        <span>Runtime Paths</span>
      </div>
      <div class="demo-paths__links">
        <a
          v-for="(demo, index) in demos"
          :key="demo.id"
          :href="demo.path"
          class="demo-paths__link"
          :class="{ 'demo-paths__link--active': demo.id === currentDemo.id }"
        >
          <span>{{ index + 1 }}</span>
          {{ demo.title }}
        </a>
      </div>
    </nav>

    <main class="chat-demo">
      <component :is="currentDemo.component" />
    </main>
  </div>
</template>
