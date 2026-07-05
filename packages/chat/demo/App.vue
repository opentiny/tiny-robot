<script setup lang="ts">
import { computed } from 'vue'
import ExternalRuntime from './cases/external-runtime.vue'
import KitExistingRuntime from './cases/kit-existing-runtime.vue'
import KitQuickStart from './cases/kit-quick-start.vue'

const demos = [
  {
    path: '/kit-quick-start',
    aliases: ['/', '/basic', '/local-runtime'],
    component: KitQuickStart,
  },
  {
    path: '/kit-existing-runtime',
    aliases: ['/kit-runtime'],
    component: KitExistingRuntime,
  },
  {
    path: '/external-runtime',
    aliases: [],
    component: ExternalRuntime,
  },
]

const currentPath = window.location.pathname
const currentDemo = computed(
  () => demos.find((demo) => demo.path === currentPath || demo.aliases.includes(currentPath)) ?? demos[0],
)
</script>

<template>
  <div class="chat-demo">
    <component :is="currentDemo.component" />
  </div>
</template>
