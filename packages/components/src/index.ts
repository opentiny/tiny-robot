import { App } from 'vue'
import BubbleItem from './bubble-item'
import BubbleList from './bubble-list'
import Conversations from './conversations'
import Sender from './sender'

export { BubbleItem, BubbleList, Conversations, Sender }

export * from './bubble-list/index.type'

export default {
  install<T>(app: App<T>) {
    app.use(Conversations)
    app.use(BubbleItem)
    app.use(BubbleList)
    app.use(Sender)
  },
}
