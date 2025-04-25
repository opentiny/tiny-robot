import { App } from 'vue'
import { Bubble, BubbleList } from './bubble'
import Container from './container'
import Conversations from './conversations'
import History from './history'
import { Prompt, Prompts } from './prompts'
import Question from './question'
import Sender from './sender'
import Welcome from './welcome'

export * from './bubble/index.type'
export * from './history/index.type'
export * from './prompts/index.type'
export * from './sender/index.type'
export * from './welcome/index.type'

const components = [Bubble, BubbleList, Container, Conversations, History, Prompt, Prompts, Question, Sender, Welcome]

export default {
  install<T>(app: App<T>) {
    components.forEach((component) => {
      const name = component.name!.replace(/^Tiny/, '').replace(/^Tr/, '')
      app.component(`Tr${name}`, component)
    })
  },
}

export {
  Bubble,
  Bubble as TrBubble,
  BubbleList,
  BubbleList as TrBubbleList,
  Container,
  Container as TrContainer,
  Conversations,
  Conversations as TrConversations,
  History,
  History as TrHistory,
  Prompt,
  Prompt as TrPrompt,
  Prompts,
  Prompts as TrPrompts,
  Sender,
  Sender as TrSender,
  Welcome,
  Welcome as TrWelcome,
  Question,
}
