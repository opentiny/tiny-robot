import { App } from 'vue'
import BubbleItem from './bubble-item'
import BubbleList from './bubble-list'
import Conversations from './conversations'

export { BubbleItem, BubbleList, Conversations }

export * from './bubble-list/index.type'

export default {
  install<T>(app: App<T>) {
    app.use(Conversations)
    app.use(BubbleItem)
    app.use(BubbleList)
  },
}
