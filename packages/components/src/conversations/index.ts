import { App } from 'vue'
import Conversations from './conversations.vue'

Conversations.name = 'TinyConversations'

const install = function <T>(app: App<T>) {
  app.component(Conversations.name!, Conversations)
}

Conversations.install = install

export default Conversations as typeof Conversations & { install: typeof install }
