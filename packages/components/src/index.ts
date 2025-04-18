import { App } from 'vue'
import { Bubble, BubbleList } from './bubble'
import Conversations from './conversations'
import { Prompt, Prompts } from './prompts'
import Sender from './sender'
import Welcome from './welcome'
import Question from './question'

export * from './bubble/index.type'
export * from './prompts/index.type'
export * from './sender/index.type'
export * from './welcome/index.type'

const components = [Bubble, BubbleList, Conversations, Prompt, Prompts, Sender, Welcome, Question]

export default {
  install<T>(app: App<T>) {
    components.forEach((component) => {
      const name = component.name!.replace(/^Tiny/, '').replace(/^Tr/, '')
      app.component(name, component)
    })
  },
}

export { Bubble, BubbleList, Conversations, Prompt, Prompts, Sender, Welcome, Question }
