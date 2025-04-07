import { App } from 'vue'
import Conversations from './conversations'
import Bubble from './bubble'

export { Conversations, Bubble }

export default {
  install<T>(app: App<T>) {
    app.use(Conversations)
    app.use(Bubble)
  },
}
