import type {
  ChatMessage,
  ChatCompletion,
  ConversationInfo,
  ConversationStorageStrategy,
  MessageRequestBody,
  ResponseProvider,
} from '@opentiny/tiny-robot-kit'
import { useConversation } from '@opentiny/tiny-robot-kit'
import { useKitChatRuntime, type ChatRuntime } from '@opentiny/tiny-robot-chat'
import { douBaoMockConversations } from './config'

export function createDouBaoTitle(text: string) {
  const normalized = text.trim().replace(/\s+/g, ' ')
  const characters = [...normalized]

  if (characters.length <= 12) return normalized

  return `${characters.slice(0, 12).join('').trimEnd()}…`
}

const promptReplies: Record<string, string> = {
  '热点：沈腾新片《欢迎来龙餐馆》爆火带动出品方股价大涨':
    '这类热点通常会同时影响影片关注度和相关公司的市场预期。演示环境使用本地模拟数据，不代表真实行情。',
  帮我设计一个能陪练英语口语的AI角色设定:
    '可以把角色设定为一位耐心的旅行搭档：每轮只纠正一个关键错误，并用更自然的表达带你继续对话。',
  常吃坚果对健康有哪些益处: '坚果含有不饱和脂肪酸、蛋白质和膳食纤维，适量食用有助于补充营养并增加饱腹感。',
  设计每天15分钟的英语启蒙亲子计划:
    '可以分为 5 分钟儿歌热身、5 分钟亲子对话和 5 分钟绘本复述，坚持短时、高频、可重复。',
}

function normalizePrompt(text: string) {
  return text.trim().replace(/[?？]$/, '')
}

export function getDouBaoReply(text: string) {
  return promptReplies[normalizePrompt(text)] ?? '我已经收到你的问题。这是豆包演示中的本地模拟回复。'
}

function waitForReply(delay: number, abortSignal: AbortSignal) {
  if (delay <= 0 || abortSignal.aborted) return Promise.resolve()

  return new Promise<void>((resolve) => {
    const timer = setTimeout(finish, delay)

    function finish() {
      clearTimeout(timer)
      abortSignal.removeEventListener('abort', finish)
      resolve()
    }

    abortSignal.addEventListener('abort', finish, { once: true })
  })
}

export function createDouBaoResponseProvider(options: { delay?: number } = {}): ResponseProvider {
  const delay = options.delay ?? 300

  return async (requestBody: MessageRequestBody, abortSignal: AbortSignal) => {
    const latestMessage = requestBody.messages.at(-1)
    const text = typeof latestMessage?.content === 'string' ? latestMessage.content : ''
    const reply = getDouBaoReply(text)

    return (async function* (): AsyncGenerator<ChatCompletion> {
      await waitForReply(delay, abortSignal)

      if (abortSignal.aborted) return

      yield {
        id: `doubao-mock-${Date.now()}`,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model: 'doubao-local-demo',
        system_fingerprint: null,
        choices: [
          {
            index: 0,
            message: undefined,
            delta: { role: 'assistant', content: reply },
            finish_reason: 'stop',
            logprobs: null,
          },
        ],
      }
    })()
  }
}

function createDouBaoMemoryStorage(): ConversationStorageStrategy {
  const seeds = [...douBaoMockConversations]
  const now = Date.now()
  const conversations: ConversationInfo[] = seeds.map((seed, index) => ({
    id: `tiny-robot-mock-conversation-${index + 1}`,
    title: seed.title,
    createdAt: now - (seeds.length - index) * 1000,
    updatedAt: now - (seeds.length - index) * 1000,
    metadata: seed.metadata,
  }))
  const messages = new Map<string, ChatMessage[]>(
    conversations.map((conversation, index) => [conversation.id, [...seeds[index].messages]]),
  )

  return {
    loadConversations: () => conversations.map((conversation) => ({ ...conversation })),
    loadMessages: (conversationId) => [...(messages.get(conversationId) ?? [])],
    saveConversation(conversation) {
      const index = conversations.findIndex((item) => item.id === conversation.id)
      const nextConversation = { ...conversation }

      if (index === -1) {
        conversations.unshift(nextConversation)
      } else {
        conversations[index] = nextConversation
      }
    },
    saveMessages: (conversationId, nextMessages) => messages.set(conversationId, [...nextMessages]),
    deleteConversation(conversationId) {
      const index = conversations.findIndex((conversation) => conversation.id === conversationId)

      if (index !== -1) conversations.splice(index, 1)

      messages.delete(conversationId)
    },
  }
}

export function useDouBaoRuntime(_options?: { storage?: ConversationStorageStrategy; responseDelay?: number }): {
  runtime: ChatRuntime
  startBlank: () => void
} {
  const options = _options ?? {}
  const storage = options.storage ?? createDouBaoMemoryStorage()
  const conversation = useConversation({
    storage,
    autoSaveMessages: true,
    useMessageOptions: {
      responseProvider: createDouBaoResponseProvider({ delay: options.responseDelay }),
    },
  })
  const runtime = useKitChatRuntime({
    conversation,
    titleGenerator: createDouBaoTitle,
  })

  return {
    runtime,
    startBlank() {
      conversation.activeConversationId.value = null
    },
  }
}
