import { App } from 'vue'
import { Bubble, BubbleList } from './bubble'
import Container from './container'
import Conversations from './conversations'
import DropdownMenu from './dropdown-menu'
import Feedback from './feedback'
import History from './history'
import IconButton from './icon-button'
import { Prompt, Prompts } from './prompts'
import Question from './question'
import Sender from './sender'
import Welcome from './welcome'
import Suggestion from './suggestion'
import SuggestionPopover from './suggestion-popover'
import SuggestionPills from './suggestion-pills'

export * from './bubble/index.type'
export * from './container/index.type'
export * from './dropdown-menu/index.type'
export * from './feedback/index.type'
export * from './history/index.type'
export * from './icon-button/index.type'
export * from './prompts/index.type'
export * from './sender/index.type'
export * from './welcome/index.type'
export * from './suggestion/index.type'
// TODO suggestion 中类型和 suggestion-popover 类型部分冲突。后续整改 suggestion 的类型
// export * from './suggestion-popover/index.type'
export * from './suggestion-pills/index.type'

const components = [
  Bubble,
  BubbleList,
  Container,
  Conversations,
  DropdownMenu,
  Feedback,
  History,
  IconButton,
  Prompt,
  Prompts,
  Question,
  Sender,
  Welcome,
  Suggestion,
  SuggestionPopover,
  SuggestionPills,
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
  Bubble,
  Bubble as TrBubble,
  BubbleList,
  BubbleList as TrBubbleList,
  Container,
  Container as TrContainer,
  Conversations,
  Conversations as TrConversations,
  DropdownMenu,
  DropdownMenu as TrDropdownMenu,
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
  Suggestion,
  Suggestion as TrSuggestion,
  SuggestionPills,
  SuggestionPills as TrSuggestionPills,
  Question,
  Question as TrQuestion,
  SuggestionPopover,
  SuggestionPopover as TrSuggestionPopover,
}
