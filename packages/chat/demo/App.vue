<script setup lang="ts">
import { computed } from 'vue'
import Basic from './cases/basic.vue'
import ExternalRuntime from './cases/external-runtime.vue'
import WhiteBox from './cases/white-box.vue'

const demos = [
  {
    path: '/basic',
    component: Basic,
  },
  {
    path: '/external-runtime',
    component: ExternalRuntime,
  },
  {
    path: '/white-box',
    component: WhiteBox,
  },
]

const currentDemo = computed(() => demos.find((demo) => demo.path === window.location.pathname) ?? demos[0])
</script>

<template>
  <div class="chat-demo">
    <component :is="currentDemo.component" />
  </div>
</template>
