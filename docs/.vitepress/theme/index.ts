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
        filename: 'App.vue',
        code: props.vueCode,
      })
    } else {
      files.push({
        filename: 'App.vue',
        code: currentFiles[activeFile].code,
      })

      Object.entries(currentFiles).forEach(([filename, file]) => {
        if (filename === activeFile) return
        files.push({ filename, code: (file as { code: string }).code })
      })
    }

    const defaultFiles = getDefaultFiles()
    const cssFile = defaultFiles.find((file) => file.filename === 'src/index.css')
    if (cssFile) {
      files.push(cssFile)
    }

    const { store } = generateStore({
      tinyRobotVersion: '0.3.0-rc.5',
      files,
    })

    window.open(`${import.meta.env.BASE_URL}/playground/`.replace(/\/+/g, '/') + store.serialize(), '_blank')
  })
}
