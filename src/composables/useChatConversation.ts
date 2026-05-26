import {
  toolPlugin,
  useConversation,
  type ToolCall,
  type UseConversationReturn,
  type UseMessagePlugin,
} from '@opentiny/tiny-robot-kit'
import { initialMessages, mockCallTool, mockResponseProvider, mockTools } from '../mock/chat'

let chatConversation: UseConversationReturn | undefined

const mockErrorPlugin: UseMessagePlugin = {
  name: 'mock-error-state',
  onError({ currentTurn }) {
    const lastMessage = currentTurn.at(-1)

    if (lastMessage) {
      lastMessage.content = '响应失败，请点击重试图标重试。'
      lastMessage.state = {
        ...lastMessage.state,
        error: true,
      }
    }
  },
}

const mockToolPlugin = toolPlugin({
  getTools: async () => mockTools,
  callTool: (toolCall: ToolCall) => mockCallTool(toolCall),
  toolCallCancelledContent: '工具调用已取消。',
  toolCallFailedContent: '工具调用失败，请稍后重试。',
})

const createChatConversation = () => {
  const conversation = useConversation({
    autoSaveMessages: true,
    useMessageOptions: {
      initialMessages,
      responseProvider: mockResponseProvider,
      plugins: [mockToolPlugin, mockErrorPlugin],
    },
  })

  return conversation
}

export const useChatConversation = () => {
  chatConversation ??= createChatConversation()

  return chatConversation
}
