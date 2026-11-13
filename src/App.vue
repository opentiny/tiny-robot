<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { demos } from './demos'
import './style.css'

const route = ref(location.hash.slice(1))
const current = computed(() => demos.find((demo) => demo.id === route.value) ?? demos[0])
const revision = ref(0)
const source = ref<'mock' | 'live'>('mock')
const demoRef = ref<{ reset?: () => Promise<unknown> }>()
const syncRoute = () => {
  route.value = location.hash.slice(1)
}
async function reset() {
  await demoRef.value?.reset?.()
  revision.value++
}
onMounted(() => window.addEventListener('hashchange', syncRoute))
onUnmounted(() => window.removeEventListener('hashchange', syncRoute))
</script>

<template>
  <div class="demo-app">
    <aside class="sidebar">
      <a class="brand" href="#chat"
        ><span class="brand-mark" aria-hidden="true">T</span
        ><strong>TinyRobot <small>1.0 Demos</small></strong></a
      >
      <p class="sidebar-intro">运行示例，了解接入方式。</p>
      <nav aria-label="Demo 导航">
        <a
          v-for="demo in demos"
          :key="demo.id"
          :href="`#${demo.id}`"
          :aria-current="current.id === demo.id ? 'page' : undefined"
          >{{ demo.title }}</a
        >
      </nav>
      <a class="docs-link" href="https://docs.opentiny.design/tiny-robot/" target="_blank" rel="noreferrer"
        >TinyRobot 文档 ↗</a
      >
    </aside>
    <main>
      <header class="demo-heading">
        <div>
          <p class="eyebrow">VUE 3 · TINYROBOT</p>
          <h1>{{ current.title }}</h1>
        </div>
        <button class="utility-button" @click="reset">重置示例</button>
      </header>
      <p class="demo-description">{{ current.description }}</p>
      <p class="source-path">
        示例源码：<code>src/demos/{{ current.id }}/Demo.vue</code>
      </p>
      <div v-if="current.id === 'chat'" class="demo-settings">
        <label for="reply-source">回复来源</label>
        <select id="reply-source" v-model="source">
          <option value="mock">本地模拟（无需密钥）</option>
          <option value="live">阿里百炼（需配置密钥）</option>
        </select>
        <a href="/samples/chat-architecture.png" download="chat-architecture.png">下载示例图片</a>
      </div>
      <div class="demo-stage">
        <component
          :is="current.component"
          :key="`${current.id}-${source}-${revision}`"
          v-bind="current.id === 'chat' ? { source } : {}"
          ref="demoRef"
        />
      </div>
    </main>
  </div>
</template>
