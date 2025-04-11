import { App } from 'vue'
import Conversations from './index.vue'

Conversations.name = 'TrConversations'

const install = function <T>(app: App<T>) {
  app.component(Conversations.name!, Conversations)
}

Conversations.install = install

export default Conversations as typeof Conversations & { install: typeof install }
