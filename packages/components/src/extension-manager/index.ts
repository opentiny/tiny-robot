import type { App } from 'vue'
import { ExtensionCard as ExtensionCardComp, ExtensionCardGrid as ExtensionCardGridComp } from './components'

export * from './index.type'

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

export { ExtensionCard, ExtensionCardGrid }
