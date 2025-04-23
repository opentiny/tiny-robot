import { App } from 'vue'
import History from './index.vue'

History.name = 'TrHistory'

const install = function <T>(app: App<T>) {
  app.component(History.name!, History)
}

History.install = install

export default History as typeof History & { install: typeof install }
