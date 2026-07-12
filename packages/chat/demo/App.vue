<script setup lang="ts">
import { computed } from 'vue'
import BuiltInKit from './cases/built-in-kit.vue'
import CustomRuntime from './cases/custom-runtime.vue'
import ExistingKit from './cases/existing-kit.vue'
import { demoPathInfo, demoPaths } from './demoPaths'

const demos = [
  {
    ...demoPathInfo.builtInKit,
    component: BuiltInKit,
  },
  {
    ...demoPathInfo.existingKit,
    component: ExistingKit,
  },
  {
    ...demoPathInfo.customRuntime,
    component: CustomRuntime,
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
          v-for="demo in demoPaths"
          :key="demo.id"
          :href="demo.path"
          class="demo-paths__link"
          :class="{ 'demo-paths__link--active': demo.id === currentDemo.id }"
        >
          <span>{{ demo.index }}</span>
          {{ demo.title }}
        </a>
      </div>
    </nav>

    <main class="chat-demo">
      <component :is="currentDemo.component" />
    </main>
  </div>
</template>
