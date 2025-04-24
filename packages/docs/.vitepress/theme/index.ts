import DefaultTheme from 'vitepress/theme'
import '@opentiny/tiny-robot/dist/style.css'

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
        // 动态引入TinyVue/TinyRobot, 解决vitepress打包在服务端渲染没有document和window等会报错
        import('@opentiny/vue').then(function (m) {
          app.use(m.default)
        })
        import('@opentiny/tiny-robot').then(function (m) {
          app.use(m.default)
        })

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
    .register('/cdocs/tiny-robot/sw.js')
    .then(() => {
      console.log('ServiceWorker registration successful')
    })
    .catch((err) => {
      console.log('ServiceWorker registration failed: ', err)
    })
}
