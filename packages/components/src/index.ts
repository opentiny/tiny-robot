import { App } from 'vue'
import BubbleItem from './bubble-item'
import BubbleList from './bubble-list'
import Conversations from './conversations'
import { Prompt, Prompts } from './prompts'
import Sender from './sender'
import Welcome from './welcome'
import Question from './question'

export * from './bubble-list/index.type'
export * from './prompts/index.type'

const components = [BubbleItem, BubbleList, Conversations, Prompt, Prompts, Sender, Welcome, Question]

export default {
  install<T>(app: App<T>) {
    components.forEach((component) => {
      const name = component.name!.replace(/^Tiny/, '').replace(/^Tr/, '')
      app.component(name, component)
    })
  },
}

export { BubbleItem, BubbleList, Conversations, Prompt, Prompts, Sender, Welcome, Question }
