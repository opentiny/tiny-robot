import { generateStore, getDefaultFiles } from '@opentiny/tiny-robot-playground/utils'
import '@opentiny/tiny-robot-style'
import DefaultTheme from 'vitepress/theme'
import { setupDarkModeListener } from './color-mode'
import Layout from './Layout.vue'
import './style.css'

declare global {
  interface Window {
    __SW_REGISTERED__?: boolean
    __CODE_PLAYGROUND_LISTENED__?: boolean
  }
  const __TINY_ROBOT_VERSION__: string
}

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    // 监听暗黑模式变化
    setupDarkModeListener()

    app.mixin({
      mounted() {
        registerServiceWorker()
        listenCodePlaygroundEvent()
      },
    })
  },
  Layout,
}

function registerServiceWorker() {
  if (
    typeof window === 'undefined' ||
    typeof navigator === 'undefined' ||
    !('serviceWorker' in navigator) ||
    window.__SW_REGISTERED__
  ) {
    return
  }

  window.__SW_REGISTERED__ = true
  navigator.serviceWorker
    .register(import.meta.env.BASE_URL + 'sw.js')
    .then(() => {
      console.log('ServiceWorker registration successful')
    })
    .catch((err) => {
      console.log('ServiceWorker registration failed: ', err)
    })
}

function listenCodePlaygroundEvent() {
  if (typeof window === 'undefined' || window.__CODE_PLAYGROUND_LISTENED__) {
    return
  }

  window.__CODE_PLAYGROUND_LISTENED__ = true
  document.addEventListener('code-playground', (event) => {
    const detail = (event as CustomEvent).detail
    if (!detail) return
    const { props, currentFiles, activeFile } = detail

    const files: { filename: string; code: string }[] = []

    if (Object.keys(currentFiles).length === 0) {
      files.push({
        filename: 'src/App.vue',
        code: props.vueCode,
      })
    } else {
      files.push({
        filename: 'src/App.vue',
        code: currentFiles[activeFile].code,
      })

      Object.entries(currentFiles).forEach(([filename, file]) => {
        if (filename === activeFile) return
        files.push({ filename: `src/${filename}`, code: (file as { code: string }).code })
      })
    }

    const tinyRobotVersion = __TINY_ROBOT_VERSION__ || 'latest'
    const defaultFiles = getDefaultFiles({ tinyRobotVersion })
    const cssFile = defaultFiles.find((file) => file.filename === 'src/index.css')
    if (cssFile) {
      files.push(cssFile)
    }

    const extraPackages: string[] = JSON.parse(decodeURIComponent(props.playground))?.packages || []
    const extraImports = extraPackages
      .map((pkgAndVersion) => {
        const index = pkgAndVersion.lastIndexOf('@')
        const pkg = pkgAndVersion.slice(0, index)
        const version = pkgAndVersion.slice(index + 1)
        return { [pkg]: version }
      })
      .reduce((acc, curr) => {
        return { ...acc, ...curr }
      }, {})

    const { store } = generateStore({
      tinyRobotVersion,
      files,
      extraImports,
    })

    window.open(`${import.meta.env.BASE_URL}/playground/`.replace(/(?<!:)\/\/+/g, '/') + store.serialize(), '_blank')
  })
}
