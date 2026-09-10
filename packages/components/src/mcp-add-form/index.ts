import { App } from 'vue'
import McpAddForm from './index.vue'

McpAddForm.name = 'TrMcpAddForm'

const install = function <T>(app: App<T>) {
  app.component(McpAddForm.name!, McpAddForm)
}

McpAddForm.install = install

export default McpAddForm as typeof McpAddForm & { install: typeof install }
