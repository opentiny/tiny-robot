<script setup lang="ts">
import { Repl } from '@vue/repl'
import Monaco from '@vue/repl/monaco-editor'
import { nextTick, onMounted, ref, watch, watchEffect } from 'vue'
import Header from './Header.vue'
import { generateImportMap, generateStore, getDefaultFiles, getVersions } from './utils'

const tinyRobotVersion = ref('0.3.0-rc.5')

const vueVersions = ref<string[]>(['latest'])
const tinyRobotVersions = ref<string[]>([tinyRobotVersion.value])

const { store, builtinImportMap, vueVersion } = generateStore({
  tinyRobotVersion: tinyRobotVersion.value,
  files: getDefaultFiles(),
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
    vueVersions.value = await getVersions('vue', { versionSegments: 2, keepPerGroup: 5 })
    tinyRobotVersions.value = await getVersions('@opentiny/tiny-robot', {
      includePrerelease: true,
      includeLatest: false, // TODO 替换成 latest
    })
  } catch (error) {
    console.error('Failed to load Vue versions:', error)
  }
})
</script>

<template>
  <div class="playground-container">
    <!-- Header with Vue version selector -->
    <Header
      v-model:tiny-robot-version="tinyRobotVersion"
      :tiny-robot-versions="tinyRobotVersions"
      v-model:vue-version="vueVersion"
      :vue-versions="vueVersions"
    />

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
