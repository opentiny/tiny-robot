import { App } from 'vue'
import Sender from './index.vue'

Sender.name = 'TrSender'

const install = function <T>(app: App<T>) {
  app.component(Sender.name!, Sender)
}

Sender.install = install

export default Sender as typeof Sender & { install: typeof install }
