import { App } from 'vue'
import MCPServerPicker from './index.vue'

MCPServerPicker.name = 'MCPServerPicker'

const install = function <T>(app: App<T>) {
  app.component(MCPServerPicker.name!, MCPServerPicker)
}

MCPServerPicker.install = install

export default MCPServerPicker as typeof MCPServerPicker & { install: typeof install }
