import { App } from 'vue'
import SenderCompat from './index.vue'

SenderCompat.name = 'TrSenderCompat'

const install = function <T>(app: App<T>) {
  app.component(SenderCompat.name!, SenderCompat)
}

SenderCompat.install = install

export default SenderCompat as typeof SenderCompat & { install: typeof install }
