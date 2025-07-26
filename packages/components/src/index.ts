import './styles/root.css'

import { App } from 'vue'
import Attachments from './attachments'
import { Bubble, BubbleList, BubbleProvider, BubbleMarkdownContentRenderer, BubbleContentClassRenderer } from './bubble'
import Container from './container'
import Conversations from './conversations'
import DragOverlay from './drag-overlay'
import DropdownMenu from './dropdown-menu'
import Feedback from './feedback'
import History from './history'
import IconButton from './icon-button'
import { Prompt, Prompts } from './prompts'
import Sender from './sender'
import SuggestionPills, { SuggestionPillButton } from './suggestion-pills'
import SuggestionPopover from './suggestion-popover'
import Welcome from './welcome'
import McpServerPicker from './mcp-server-picker'

export * from './attachments/index.type'
export * from './bubble/index.type'
export * from './container/index.type'
export * from './drag-overlay/index.type'
export * from './dropdown-menu/index.type'
export * from './feedback/index.type'
export * from './history/index.type'
export * from './icon-button/index.type'
export * from './prompts/index.type'
export * from './sender/index.type'
export * from './suggestion-pills/index.type'
export * from './suggestion-popover/index.type'
export * from './welcome/index.type'
export * from './mcp-server-picker/index.type'

export { vDropzone } from './drag-overlay/directives/vDropzone'

const components = [
  Attachments,
  Bubble,
  BubbleList,
  BubbleProvider,
  Container,
  Conversations,
  DragOverlay,
  DropdownMenu,
  Feedback,
  History,
  IconButton,
  Prompt,
  Prompts,
  Sender,
  SuggestionPills,
  SuggestionPillButton,
  SuggestionPopover,
  Welcome,
  McpServerPicker,
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
  Attachments,
  Attachments as TrAttachments,
  Bubble,
  Bubble as TrBubble,
  BubbleList,
  BubbleList as TrBubbleList,
  BubbleProvider,
  BubbleProvider as TrBubbleProvider,
  BubbleMarkdownContentRenderer,
  BubbleContentClassRenderer,
  Container,
  Container as TrContainer,
  Conversations,
  Conversations as TrConversations,
  DragOverlay,
  DragOverlay as TrDragOverlay,
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
  SuggestionPillButton,
  SuggestionPillButton as TrSuggestionPillButton,
  SuggestionPills,
  SuggestionPills as TrSuggestionPills,
  SuggestionPopover,
  SuggestionPopover as TrSuggestionPopover,
  Welcome,
  Welcome as TrWelcome,
  McpServerPicker,
  McpServerPicker as TrMcpServerPicker,
}
