import type { App } from 'vue'
import McpExtensionForm from './index.vue'

McpExtensionForm.name = 'TrMcpExtensionForm'

const install = function <T>(app: App<T>) {
  app.component(McpExtensionForm.name!, McpExtensionForm)
}

McpExtensionForm.install = install

export default McpExtensionForm as typeof McpExtensionForm & {
  install: typeof install
}
