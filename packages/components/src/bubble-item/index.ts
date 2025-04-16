import { App } from 'vue'
import BubbleItem from './bubble-item.vue'

BubbleItem.name = 'TinyBubbleItem'

const install = function (app: App) {
  app.component(BubbleItem.name!, BubbleItem)
}

BubbleItem.install = install

export default BubbleItem as typeof BubbleItem & { install: typeof install }
