import { App } from 'vue'
import Conversations from './conversations'
import { Prompt, Prompts } from './prompts'

export { Conversations, Prompt, Prompts }

export default {
  install<T>(app: App<T>) {
    app.use(Conversations)
    app.use(Prompt)
    app.use(Prompts)
  },
}
