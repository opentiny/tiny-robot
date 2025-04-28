import { App } from 'vue'
import ActionGroup from './action-group'
import { Bubble, BubbleList } from './bubble'
import Container from './container'
import Conversations from './conversations'
import Feedback from './feedback'
import History from './history'
import IconButton from './icon-button'
import { Prompt, Prompts } from './prompts'
import Question from './question'
import Sender from './sender'
import Welcome from './welcome'

export * from './action-group/index.type'
export * from './bubble/index.type'
export * from './feedback/index.type'
export * from './history/index.type'
export * from './icon-button/index.type'
export * from './prompts/index.type'
export * from './sender/index.type'
export * from './welcome/index.type'

const components = [
  ActionGroup,
  Bubble,
  BubbleList,
  Container,
  Conversations,
  Feedback,
  History,
  IconButton,
  Prompt,
  Prompts,
  Question,
  Sender,
  Welcome,
]

export default {
  install<T>(app: App<T>) {
    components.forEach((component) => {
      const name = component.name!.replace(/^Tiny/, '').replace(/^Tr/, '')
      app.component(`Tr${name}`, component)
    })
  },
}

export {
  ActionGroup,
  ActionGroup as TrActionGroup,
  Bubble,
  Bubble as TrBubble,
  BubbleList,
  BubbleList as TrBubbleList,
  Container,
  Container as TrContainer,
  Conversations,
  Conversations as TrConversations,
  Feedback,
  Feedback as TrFeedback,
  History,
  History as TrHistory,
  IconButton,
  IconButton as TrIconButton,
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
