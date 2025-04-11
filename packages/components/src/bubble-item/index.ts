import { App } from 'vue'
import BubbleItem from './bubble-item.vue'
;(BubbleItem as unknown as { name: string }).name = 'TinyBubbleItem'

const install = function (app: App) {
  app.component(BubbleItem.name!, BubbleItem)
}

;(BubbleItem as unknown as { install: unknown }).install = install

export default BubbleItem as typeof BubbleItem & { install: typeof install }
