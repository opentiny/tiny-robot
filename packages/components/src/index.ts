import Conversations from './conversations'

export {
  Conversations
}

export default {
  install(app) {
    app.use(Conversations)
  }
}
