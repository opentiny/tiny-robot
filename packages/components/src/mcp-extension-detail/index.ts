import type { App } from 'vue'
import McpExtensionDetail from './index.vue'

McpExtensionDetail.name = 'TrMcpExtensionDetail'

const install = function <T>(app: App<T>) {
  app.component(McpExtensionDetail.name!, McpExtensionDetail)
}

McpExtensionDetail.install = install

export default McpExtensionDetail as typeof McpExtensionDetail & {
  install: typeof install
}
