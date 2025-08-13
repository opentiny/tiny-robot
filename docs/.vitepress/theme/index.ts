import '@opentiny/tiny-robot-style'
import DefaultTheme from 'vitepress/theme'
import { setupDarkModeListener } from './color-mode'
import Layout from './Layout.vue'
import './style.css'

declare global {
  interface Window {
    __SW_REGISTERED__?: boolean
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
