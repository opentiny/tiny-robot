<script setup lang="ts">
import IconGithub from './components/IconGithub.vue'
import IconShare from './components/IconShare.vue'
import { notify } from './utils/notify'

// Define props interface for version data
interface Props {
  tinyRobotVersions: string[]
  tinyRobotLatestVersion?: string
}

// Define props with default values
withDefaults(defineProps<Props>(), {
  tinyRobotVersions: () => [],
})

const tinyRobotVersion = defineModel<string>('tinyRobotVersion', { required: true })

// 获取分享链接
// 1. 如果当前页面是 iframe，则使用 document.referrer 获取父页面 URL
// 2. 如果当前页面不是 iframe，则使用当前页面 URL
const getShareUrl = () => {
  if (typeof window === 'undefined') return ''

  const { location } = window
  const currentHash = location.hash

  try {
    const referrer = typeof document !== 'undefined' ? document.referrer : ''
    if (referrer) {
      const url = new URL(referrer)
      // 这里写死 pathname。https://playground.opentiny.design/tiny-robot.html
      url.pathname = import.meta.env.VITE_PLAYGROUND_SHARE_PATH || '/tiny-robot.html'
      url.hash = currentHash
      return url.toString()
    }
  } catch {}

  return location.href
}

// Handle click on the share URL button: copy the URL to clipboard or show it as a fallback.
const handleShareClick = async () => {
  const url = getShareUrl()
  if (!url) return

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url)
      notify('链接已复制到剪贴板')
    }
  } catch {}
}
</script>

<template>
  <header class="playground-header">
    <div class="header-content">
      <div class="playground-info">
        <img class="playground-logo" src="/logo.svg" alt="TinyRobot logo" />
        <div class="playground-title">TinyRobot Playground</div>
      </div>
      <div class="header-end">
        <div class="version-selector">
          <label for="tiny-robot-version" class="version-label">TinyRobot 版本:</label>
          <select id="tiny-robot-version" v-model="tinyRobotVersion" class="version-select">
            <option v-for="version in tinyRobotVersions" :key="version" :value="version">
              {{ version }}{{ version === 'latest' && tinyRobotLatestVersion ? ` (${tinyRobotLatestVersion})` : '' }}
            </option>
          </select>
        </div>
        <button type="button" class="share-button" @click="handleShareClick" aria-label="Copy share URL">
          <IconShare size="20" />
        </button>
        <a
          class="github-button"
          href="https://github.com/opentiny/tiny-robot"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open TinyRobot on GitHub"
        >
          <IconGithub size="20" />
        </a>
      </div>
    </div>
  </header>
</template>

<style scoped>
.playground-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 0.75rem 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.playground-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.playground-logo {
  height: 32px;
  width: 32px;
}

.playground-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
}

.header-end {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.share-button {
  background: transparent;
  border-radius: 999px;
  color: #333;
  border: none;
  padding: 0;
  cursor: pointer;
  transition:
    background-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-button:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.version-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.version-label {
  font-weight: 500;
  color: #495057;
  font-size: 0.875rem;
}

.version-select {
  min-width: 130px;
  padding: 0.375rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  background-color: white;
  font-size: 0.875rem;
  color: #495057;
  cursor: pointer;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

.version-select:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.version-select:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.github-button {
  background: transparent;
  border-radius: 999px;
  color: black;
  border: none;
  padding: 0;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
