/**
 * useMessage composable
 * 提供消息管理和状态控制功能
 */

import { reactive, Reactive, ref, toRaw, type Ref } from 'vue'
import type { ChatMessage } from '../types'
import type { AIClient } from '../client'

/**
 * 消息状态接口
 */
export interface MessageState {
  isLoading: boolean
  isResponding: boolean
  error: string | null
}

/**
 * useMessage选项接口
 */
export interface UseMessageOptions {
  /** AI客户端实例 */
  client: AIClient
  /** 是否默认使用流式响应 */
  useStreamByDefault?: boolean
  /** 错误消息模板 */
  errorMessage?: string
  /** 初始消息列表 */
  initialMessages?: ChatMessage[]
}

/**
 * useMessage返回值接口
 */
export interface UseMessageReturn {
  messages: Ref<ChatMessage[]>
  /** 消息状态 */
  messageState: Reactive<MessageState>
  /** 输入消息 */
  inputMessage: Ref<string>
  /** 是否使用流式响应 */
  useStream: Ref<boolean>
  /** 发送消息 */
  sendMessage: () => Promise<void>
  /** 清空消息 */
  clearMessages: () => void
  /** 添加消息 */
  addMessage: (message: ChatMessage) => void
  /** 中止请求 */
  abortRequest: () => void
  /** 重试请求 */
  retryRequest: () => Promise<void>
}

/**
 * useMessage composable
 * 提供消息管理和状态控制功能
 *
 * @param options useMessage选项
 * @returns UseMessageReturn
 */
export function useMessage(options: UseMessageOptions): UseMessageReturn {
  const { client, useStreamByDefault = true, errorMessage = '请求失败，请稍后重试', initialMessages = [] } = options

  // 消息列表
  const messages = ref<ChatMessage[]>([...initialMessages])

  // 输入消息
  const inputMessage = ref('')

  // 是否使用流式响应
  const useStream = ref(useStreamByDefault)

  // 请求控制器
  let abortController: AbortController | null = null

  // 消息状态
  const messageState = reactive<MessageState>({
    isLoading: false,
    isResponding: false,
    error: null,
  })

  // 普通请求
  const chat = async (abortController: AbortController) => {
    const response = await client.chat({
      messages: toRaw(messages.value),
      options: {
        stream: false,
        signal: abortController.signal,
      },
    })

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: response.choices[0].message.content,
    }
    messages.value.push(assistantMessage)

    messageState.isLoading = false
    messageState.isResponding = false
  }

  // 流式请求
  const streamChat = async (abortController: AbortController) => {
    await client.chatStream(
      {
        messages: toRaw(messages.value),
        options: {
          stream: true,
          signal: abortController.signal,
        },
      },
      {
        onData: (data) => {
          messageState.isLoading = false
          messageState.isResponding = true
          messageState.error = null
          if (messages.value[messages.value.length - 1].role === 'user') {
            messages.value.push({ role: 'assistant', content: '' })
          }
          const choice = data.choices[0]
          if (choice && choice.delta.content) {
            messages.value[messages.value.length - 1].content += choice.delta.content
          }
        },
        onError: (error) => {
          messageState.isLoading = false
          messageState.isResponding = false
          messageState.error = errorMessage
          console.error('Stream request error:', error)
        },
        onDone: () => {
          messageState.isResponding = false
        },
      },
    )
  }

  // 发送消息
  const sendMessage = async () => {
    if (!inputMessage.value.trim() || messageState.isLoading) {
      return
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.value,
    }

    messages.value.push(userMessage)

    inputMessage.value = ''

    // 更新状态
    messageState.isLoading = true
    messageState.isResponding = true
    messageState.error = null

    // 创建中止控制器
    abortController = new AbortController()

    try {
      if (useStream.value) {
        await streamChat(abortController)
      } else {
        await chat(abortController)
      }
    } catch (error) {
      messageState.error = errorMessage
      messageState.isLoading = false
      messageState.isResponding = false
      console.error('Send message error:', error)
    } finally {
      abortController = null
    }
  }

  // 中止请求
  const abortRequest = () => {
    if (abortController) {
      abortController.abort()
      abortController = null
      messageState.isLoading = false
      messageState.isResponding = false
    }
  }

  // 重试请求
  const retryRequest = async () => {
    if (messages.value.length === 0) {
      return
    }
    if (messages.value[messages.value.length - 1].role === 'user') {
      messages.value.pop()
    }
    messageState.error = null
    await sendMessage()
  }

  //清空消息
  const clearMessages = () => {
    messages.value = []
    messageState.error = null
  }

  // 添加消息
  const addMessage = (message: ChatMessage) => {
    messages.value.push(message)
  }

  return {
    messages,
    messageState,
    inputMessage,
    useStream,
    sendMessage,
    clearMessages,
    addMessage,
    abortRequest,
    retryRequest,
  }
}
