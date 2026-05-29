import { App } from 'vue'
import Chat from './index.vue'

const install = function <T>(app: App<T>) {
  app.component(TrChat.name!, TrChat)
}

const TrChat = Chat as typeof Chat & { install: typeof install }

TrChat.name = 'TrChat'
TrChat.install = install

export * from './index.type'
export { TrChat }
export default TrChat
