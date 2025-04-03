import { App } from 'vue'
import Conversations from './conversations'

export { Conversations }

export default {
  install<T>(app: App<T>) {
    app.use(Conversations)
  },
}
