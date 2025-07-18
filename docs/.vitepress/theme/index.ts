import DefaultTheme from 'vitepress/theme'
import '@opentiny/tiny-robot-style'
import './style.css'

declare global {
  interface Window {
    __SW_REGISTERED__?: boolean
  }
}

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.mixin({
      mounted() {
        registerServiceWorker()
      },
    })
  },
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
