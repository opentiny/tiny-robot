import Conversations from './conversations.vue'

Conversations.name = 'TinyConversations'

Conversations.install = function (app) {
  app.component(Conversations.name, Conversations)
}

export default Conversations
