import { App } from 'vue'
import Container from './index.vue'

Container.name = 'TrContainer'

const install = function <T>(app: App<T>) {
  app.component(Container.name!, Container)
}

Container.install = install

export default Container as typeof Container & { install: typeof install }
