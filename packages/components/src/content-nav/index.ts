import { App } from 'vue'
import ContentNav from './index.vue'

ContentNav.name = 'TrContentNav'

const install = function <T>(app: App<T>) {
  app.component(ContentNav.name!, ContentNav)
}

ContentNav.install = install

export default ContentNav as typeof ContentNav & { install: typeof install }
