import { App } from 'vue'
import Conversations from './conversations'
import Welcome from './welcome'

export { Conversations, Welcome }

export default {
  install<T>(app: App<T>) {
    app.use(Conversations)
    app.use(Welcome)
  },
}
