import { App } from 'vue'
import BubbleComp from './bubble.vue'
import BubbleListComp from './bubble-list.vue'

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
