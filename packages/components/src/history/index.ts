import { App } from 'vue'
import History from './index.vue'

const install = function <T>(app: App<T>) {
  app.component(History.name, History)
}

Object.assign(History, {
  name: 'TrHistory',
  install,
})

export default History as typeof History & { install: typeof install }
