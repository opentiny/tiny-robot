import type { App } from 'vue'
import ExtensionManagerComp from './index.vue'
import { ExtensionCard as ExtensionCardComp, ExtensionCardGrid as ExtensionCardGridComp } from './components'

export * from './public.type'

ExtensionCardComp.name = 'TrExtensionCard'

const extensionCardInstall = function <T>(app: App<T>) {
  app.component(ExtensionCardComp.name!, ExtensionCardComp)
}

const ExtensionCard = ExtensionCardComp as typeof ExtensionCardComp & {
  install: typeof extensionCardInstall
}

ExtensionCard.install = extensionCardInstall

ExtensionCardGridComp.name = 'TrExtensionCardGrid'

const extensionCardGridInstall = function <T>(app: App<T>) {
  app.component(ExtensionCardGridComp.name!, ExtensionCardGridComp)
}

const ExtensionCardGrid = ExtensionCardGridComp as typeof ExtensionCardGridComp & {
  install: typeof extensionCardGridInstall
}

ExtensionCardGrid.install = extensionCardGridInstall

ExtensionManagerComp.name = 'TrExtensionManager'

const extensionManagerInstall = function <T>(app: App<T>) {
  app.component(ExtensionManagerComp.name!, ExtensionManagerComp)
  app.component(ExtensionCard.name!, ExtensionCard)
  app.component(ExtensionCardGrid.name!, ExtensionCardGrid)
}

const ExtensionManager = Object.assign(ExtensionManagerComp, {
  install: extensionManagerInstall,
  Card: ExtensionCard,
  CardGrid: ExtensionCardGrid,
})

export { ExtensionCard, ExtensionCardGrid, ExtensionManager }
export default ExtensionManager
