import { App } from 'vue'
import Welcome from './welcome.vue'

Welcome.name = 'TinyWelcome'

const install = function <T>(app: App<T>) {
  app.component(Welcome.name!, Welcome)
}

Welcome.install = install

export default Welcome as typeof Welcome & { install: typeof install }
