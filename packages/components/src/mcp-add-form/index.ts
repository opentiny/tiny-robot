import { App } from 'vue'
import McpAddForm from './index.vue'

McpAddForm.name = 'TrMcpAddForm'

const install = function <T>(app: App<T>) {
  app.component(McpAddForm.name!, McpAddForm)
}

McpAddForm.install = install

/**
 * @deprecated Use the ExtensionManager component APIs instead.
 * This entry point remains available for compatibility and will be removed in a future major release.
 */
export default McpAddForm as typeof McpAddForm & { install: typeof install }
