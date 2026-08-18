import type { App } from 'vue'
import ExtensionManager from './index.vue'
import { ExtensionCard, ExtensionCardGrid } from './components'

ExtensionManager.name = 'ExtensionManager'
ExtensionCard.name = 'ExtensionCard'
ExtensionCardGrid.name = 'ExtensionCardGrid'

const install = function <T>(app: App<T>) {
  app.component(ExtensionManager.name!, ExtensionManager)
  app.component(ExtensionCard.name!, ExtensionCard)
  app.component(ExtensionCardGrid.name!, ExtensionCardGrid)
}

const ExtensionManagerWithSubComponents = Object.assign(ExtensionManager, {
  install,
  Card: ExtensionCard,
  CardGrid: ExtensionCardGrid,
})

export { ExtensionManager }
export * from './public.type'

export default ExtensionManagerWithSubComponents as typeof ExtensionManager & {
  install: typeof install
  Card: typeof ExtensionCard
  CardGrid: typeof ExtensionCardGrid
}
