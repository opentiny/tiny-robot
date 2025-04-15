import { App } from 'vue'
import Conversations from './conversations'
import Sender from './sender'

export { Conversations, Sender }

export default {
  install<T>(app: App<T>) {
    app.use(Conversations)
    app.use(Sender)
  },
}
