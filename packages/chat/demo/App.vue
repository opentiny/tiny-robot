<script setup lang="ts">
import { computed } from 'vue'
import Basic from './cases/basic.vue'
import BuiltInKit from './cases/built-in-kit.vue'
import ChatUI from './cases/chat-ui/index.vue'
import CliBasicMigration from './basic-integration/index.vue'
import CustomRuntime from './cases/custom-runtime.vue'
import ExistingKit from './cases/existing-kit.vue'

const demos = [
  {
    id: 'chat-ui',
    path: '/chat-ui',
    aliases: ['/ui-only'],
    title: 'Chat UI',
    component: ChatUI,
  },
  {
    id: 'basic',
    path: '/basic',
    aliases: ['/'],
    title: 'Basic',
    component: Basic,
  },
  {
    id: 'built-in-kit',
    path: '/built-in-kit',
    aliases: ['/local-runtime', '/kit-quick-start'],
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
    id: 'cli-basic-migration',
    path: '/cli-basic-migration',
    aliases: ['/cli-basic'],
    title: 'CLI Migration',
    component: CliBasicMigration,
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
    <!-- <nav class="demo-paths" aria-label="Chat Runtime Paths">
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
    </nav> -->

    <main class="chat-demo">
      <component :is="currentDemo.component" />
    </main>
  </div>
</template>
