import { App } from 'vue'
import Anchor from './index.vue'

Anchor.name = 'TrAnchor'

const install = function <T>(app: App<T>) {
  app.component(Anchor.name!, Anchor)
}

Anchor.install = install

export default Anchor as typeof Anchor & { install: typeof install }
