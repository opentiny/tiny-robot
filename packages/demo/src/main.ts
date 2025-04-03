import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import MateChat from '@matechat/core'

import '@devui-design/icons/icomoon/devui-icon.css'

const app = createApp(App)
app.use(router).use(MateChat)
app.mount('#app')
