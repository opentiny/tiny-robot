<script setup lang="ts">
import { Repl } from '@vue/repl'
import Monaco from '@vue/repl/monaco-editor'
import { nextTick, onMounted, ref, watch, watchEffect } from 'vue'
import Header from './Header.vue'
import { generateImportMap, generateStore, getDefaultFiles, getVersions } from './utils'

declare global {
  const __TINY_ROBOT_VERSION__: string
}

const tinyRobotVersion = ref(__TINY_ROBOT_VERSION__ || 'latest')

const tinyRobotVersions = ref<string[]>([tinyRobotVersion.value])

const { store, builtinImportMap } = generateStore({
  tinyRobotVersion: tinyRobotVersion.value,
  files: location.hash ? [] : getDefaultFiles({ tinyRobotVersion: tinyRobotVersion.value }),
})

if (location.hash) {
  store.deserialize(location.hash)
}

// persist state to URL hash
watchEffect(() => history.replaceState({}, '', store.serialize()))

// Watch for TinyRobot version changes and update import map
watch(tinyRobotVersion, async (newVersion) => {
  await nextTick() // 等待 DOM 更新完成

  const importMap = generateImportMap({
    tinyRobotVersion: newVersion,
    builtinImportMap: builtinImportMap.value,
  })
  store.setImportMap(importMap)
})

// Load available Vue versions on component mount
onMounted(async () => {
  try {
    tinyRobotVersions.value = await getVersions('@opentiny/tiny-robot', {
      includePrerelease: true,
      includeLatest: false,
    })
  } catch (error) {
    console.error('Failed to load Vue versions:', error)
  }
})
</script>

<template>
  <div class="playground-container">
    <!-- Header with Vue version selector -->
    <Header v-model:tiny-robot-version="tinyRobotVersion" :tiny-robot-versions="tinyRobotVersions" />

    <!-- Main playground area -->
    <main class="playground-main">
      <Repl :store="store" :editor="Monaco" :show-compile-output="false" />
    </main>
  </div>
</template>

<style scoped>
.playground-container {
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
}

.playground-main {
  flex: 1;
  overflow: hidden;
}
</style>
