import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import components from '../src/index'

const app = createApp(App)

components.install(app)

app.mount('#app')
