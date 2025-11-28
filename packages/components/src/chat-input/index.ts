import { App } from 'vue'
import ChatInput from './index.vue'
import './index.less'

ChatInput.name = 'TrChatInput'

const install = function <T>(app: App<T>) {
  app.component(ChatInput.name!, ChatInput)
}

ChatInput.install = install

export default ChatInput as typeof ChatInput & { install: typeof install }

// 只导出 ChatInput 特有的类型，避免与 Sender 冲突
export type {
  ChatInputProps,
  ChatInputEmits,
  ChatInputSlots,
  ChatInputContext,
  UseEditorReturn,
  UseModeSwitchReturn,
  UseSuggestionReturn,
  UseSpeechReturn,
  UseFileUploadReturn,
  UseTemplateDataReturn,
  UseKeyboardShortcutsReturn,
  TemplateItem,
  SkillItem,
  ContentNode,
} from './index.type'

export { useChatInputContext } from './context'
