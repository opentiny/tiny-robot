import { App } from 'vue'
import Conversations from './conversations'
import BubbleItem from './bubble-item'

export { Conversations, BubbleItem }

export default {
  install<T>(app: App<T>) {
    app.use(Conversations)
    app.use(BubbleItem)
  },
}
