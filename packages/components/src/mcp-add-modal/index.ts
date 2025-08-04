import { App } from 'vue'
import MCPAddModal from './index.vue'

MCPAddModal.name = 'McpAddModal'

const install = function <T>(app: App<T>) {
  app.component(MCPAddModal.name!, MCPAddModal)
}

MCPAddModal.install = install

export default MCPAddModal as typeof MCPAddModal & { install: typeof install }
