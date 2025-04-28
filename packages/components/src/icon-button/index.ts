import { App } from 'vue'
import IconButton from './index.vue'

IconButton.name = 'TrIconButton'

const install = function <T>(app: App<T>) {
  app.component(IconButton.name!, IconButton)
}

IconButton.install = install

export default IconButton as typeof IconButton & { install: typeof install }
