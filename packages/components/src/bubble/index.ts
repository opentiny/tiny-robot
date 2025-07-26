import { App } from 'vue'
import BubbleComp from './Bubble.vue'
import BubbleListComp from './BubbleList.vue'
import BubbleProviderComp from './BubbleProvider.vue'
export { BubbleMarkdownContentRenderer, BubbleContentClassRenderer } from './renderers'

BubbleComp.name = 'TrBubble'

const bubbleInstall = function (app: App) {
  app.component(BubbleComp.name!, BubbleComp)
}

BubbleComp.install = bubbleInstall

export const Bubble = BubbleComp as typeof BubbleComp & { install: typeof bubbleInstall }

BubbleListComp.name = 'TrBubbleList'

const bubbleListInstall = function (app: App) {
  app.component(BubbleListComp.name!, BubbleListComp)
}

BubbleListComp.install = bubbleListInstall

export const BubbleList = BubbleListComp as typeof BubbleListComp & { install: typeof bubbleListInstall }

BubbleProviderComp.name = 'TrBubbleProvider'

const bubbleProviderInstall = function (app: App) {
  app.component(BubbleProviderComp.name!, BubbleProviderComp)
}

BubbleProviderComp.install = bubbleProviderInstall

export const BubbleProvider = BubbleProviderComp as typeof BubbleProviderComp & {
  install: typeof bubbleProviderInstall
}
