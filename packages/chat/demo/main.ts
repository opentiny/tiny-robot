import { createApp } from 'vue'
import '@opentiny/tiny-robot/dist/style.css'
import App from './App.vue'
import './style.css'

const app = createApp(App)

app.config.errorHandler = (error) => {
  if (error instanceof Error && error.message === 'Demo response failed by scenario control.') {
    return
  }

  console.error(error)
}

app.mount('#app')
