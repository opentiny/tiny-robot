import { App } from 'vue'
import History from './index.vue'

const install = function <T>(app: App<T>) {
  app.component('TrHistory', History)
}

export default {
  ...History,
  install,
  name: 'TrHistory',
}
