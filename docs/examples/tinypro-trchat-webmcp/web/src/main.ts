import { initializeWebMCPPolyfill } from '@mcp-b/webmcp-polyfill'
import TinySearchBox from '@opentiny/vue-search-box'
import { createApp } from 'vue'
import globalComponents from '@/components'
import App from './App.vue'
import directive from './directive'
import i18n from './locale'
import router from './router'
import store from './store'
import '@/api/interceptor'
import '@/assets/style/global.less'
import '@opentiny/vue-search-box/dist/index.css'
import 'virtual:uno.css'
import '@opentiny/icons/style/all.css'

initializeWebMCPPolyfill()

async function bootstrap() {
  // 仅静态部署（GitHub Pages）走浏览器内 Mock；本地 pnpm start:mock 仍走 8848 HTTP mock
  if (import.meta.env.PROD && import.meta.env.VITE_USE_MOCK === 'true') {
    const { setupBrowserMock } = await import('@/mock/browser')
    setupBrowserMock()
  }

  const app = createApp(App)

  app.use(router)
  app.use(store)
  app.use(i18n({ locale: localStorage.getItem('tiny-locale') }))
  app.use(globalComponents)
  app.use(directive)
  app.use(TinySearchBox)

  app.mount('#app')
}

bootstrap()
