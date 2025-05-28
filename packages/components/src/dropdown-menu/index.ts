import { App } from 'vue'
import DropdownMenu from './index.vue'

DropdownMenu.name = 'TrDropdownMenu'

const install = function <T>(app: App<T>) {
  app.component(DropdownMenu.name!, DropdownMenu)
}

DropdownMenu.install = install

export default DropdownMenu as typeof DropdownMenu & { install: typeof install }
