import { App } from 'vue'
import Conversations from './conversations'
import { Prompt, Prompts } from './prompts'
import { PromptProps, PromptsProps } from './prompts/index.type'

export { Conversations, Prompt, Prompts }

export type { PromptProps, PromptsProps }

export default {
  install<T>(app: App<T>) {
    app.use(Conversations)
    app.use(Prompt)
    app.use(Prompts)
  },
}
