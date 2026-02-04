<script setup lang="ts">
import { Repl } from '@vue/repl'
import Monaco from '@vue/repl/monaco-editor'
import { nextTick, onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue'
import Header from './Header.vue'
import { generateImportMap, generateStore, getDefaultFiles, getVersions } from './utils'

const tinyRobotVersion = ref('latest')

const tinyRobotVersions = ref<string[]>([tinyRobotVersion.value])
const tinyRobotLatestVersion = ref<string | undefined>(undefined)

const { store, builtinImportMap } = generateStore({
  tinyRobotVersion: tinyRobotVersion.value,
  files: location.hash ? [] : getDefaultFiles({ tinyRobotVersion: tinyRobotVersion.value }),
})

// Extract TinyRobot version from import-map in store (e.g. from hash) and sync to tinyRobotVersion
function syncTinyRobotVersionFromImportMap() {
  type ImportMapShape = { imports?: Record<string, string> }
  let importMap: ImportMapShape | null = null

  const importMapFile = store.files['import-map.json']
  if (importMapFile?.code) {
    try {
      importMap = JSON.parse(importMapFile.code) as ImportMapShape
    } catch {
      // ignore
    }
  }
  const tinyRobotUrl = importMap?.imports?.['@opentiny/tiny-robot']
  if (!tinyRobotUrl) return

  // Match version in URL like .../tiny-robot@0.3.2/... or .../tiny-robot@latest/...
  const match = tinyRobotUrl.match(/@opentiny\/tiny-robot@([^/]+)/)
  const version = match?.[1]?.trim()
  if (version) {
    tinyRobotVersion.value = version
  }
}

/**
 * Trigger a full recompile of all files in the store.
 * Use this when file contents (e.g. src/index.css) are updated in-place so that the preview
 * picks up the changes without needing to activate the corresponding tab.
 */
function triggerFullRecompile() {
  store.setFiles(store.getFiles(), store.mainFile)
}

if (location.hash) {
  try {
    store.deserialize(location.hash)
    syncTinyRobotVersionFromImportMap()
  } catch {
    // ignore
  }
}

// Persist state to URL hash; when in an iframe, notify the parent so it can sync the URL.
watchEffect(() => {
  const serialized = store.serialize()
  history.replaceState({}, '', serialized)
  if (window.self !== window.top) {
    window.parent.postMessage({ type: 'playground-hash-change', url: window.location.href, hash: serialized }, '*')
  }
})

// Watch for TinyRobot version changes and update import map
watch(tinyRobotVersion, async (newVersion) => {
  await nextTick() // 等待 DOM 更新完成

  const importMap = generateImportMap({
    tinyRobotVersion: newVersion,
    builtinImportMap: builtinImportMap.value,
  })
  store.setImportMap(importMap)

  // 修改 src/index.css 中的 tinyRobotVersion
  const indexCssFile = store.files['src/index.css']
  if (indexCssFile) {
    const updatedCss = indexCssFile.code.replace(
      /@opentiny\/tiny-robot@[^\s'"\/]+\/dist\/style\.css/g,
      `@opentiny/tiny-robot@${newVersion}/dist/style.css`,
    )
    if (indexCssFile.code !== updatedCss) {
      indexCssFile.code = updatedCss
      triggerFullRecompile()
    }
  }
})

// Load available TinyRobot versions on component mount
onMounted(async () => {
  try {
    const { versions, lastVersion } = await getVersions('@opentiny/tiny-robot', {
      includePrerelease: true,
      includeLatest: true,
    })
    tinyRobotVersions.value = versions
    tinyRobotLatestVersion.value = lastVersion
  } catch (error) {
    console.error('Failed to load TinyRobot versions:', error)
  }
})

// Listen for messages from the host app (useful when embedded in an iframe).
const ALLOWED_ORIGINS = ['https://playground.opentiny.design'] as const

function isAllowedMessageOrigin(origin: string): boolean {
  // Allow local dev (any port) and the official playground domain.
  if (!origin) return false
  if (ALLOWED_ORIGINS.includes(origin as (typeof ALLOWED_ORIGINS)[number])) return true

  try {
    const url = new URL(origin)
    const host = url.hostname.toLowerCase()
    if (host === 'localhost' || host === '127.0.0.1') return true
    return false
  } catch {
    return false
  }
}

function onHostMessage(event: MessageEvent) {
  // Security: only accept messages from trusted origins.
  if (!isAllowedMessageOrigin(event.origin)) {
    return
  }

  if (typeof event.data === 'object' && event.data?.type === 'playground-parent-url') {
    const parentUrl = String(event.data?.url || '')

    // Extract the hash, then `store.deserialize(hash)` and sync `tinyRobotVersion`.
    try {
      const url = new URL(parentUrl)
      const hash = url.hash
      if (hash) {
        store.deserialize(hash)
        syncTinyRobotVersionFromImportMap()
        triggerFullRecompile()
      }
    } catch {
      // Ignore invalid URLs.
    }
  }
}

onMounted(() => {
  window.addEventListener('message', onHostMessage)
})

onBeforeUnmount(() => {
  window.removeEventListener('message', onHostMessage)
})
</script>

<template>
  <div class="playground-container">
    <!-- Header with Vue version selector -->
    <Header
      v-model:tiny-robot-version="tinyRobotVersion"
      :tiny-robot-versions="tinyRobotVersions"
      :tiny-robot-latest-version="tinyRobotLatestVersion"
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
