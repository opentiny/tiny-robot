import { App } from 'vue'
import BubbleList from './bubble-list.vue'

BubbleList.name = 'TinyBubbleList'

const install = function (app: App) {
  app.component(BubbleList.name!, BubbleList)
}

BubbleList.install = install

export default BubbleList as typeof BubbleList & { install: typeof install }
