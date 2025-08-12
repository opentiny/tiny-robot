/**
 * useMessage composable
 * 提供消息管理和状态控制功能
 */

import { reactive, Reactive, ref, toRaw, type Ref } from 'vue'
import type { ChatMessage } from '../../types'
import type { AIClient } from '../../client'

export enum STATUS {
  INIT = 'init', // 初始状态
  PROCESSING = 'processing', // AI请求正在处理中, 还未响应，显示加载动画
  STREAMING = 'streaming', // 流式响应中分块数据返回中
  FINISHED = 'finished', // AI请求已完成
  ABORTED = 'aborted', // 用户中止请求
  ERROR = 'error', // AI请求发生错误
}

export const GeneratingStatus = [STATUS.PROCESSING, STATUS.STREAMING]
export const FinalStatus = [STATUS.FINISHED, STATUS.ABORTED, STATUS.ERROR]

/**
 * 消息状态接口
 */
export interface MessageState {
  status: STATUS
  errorMsg: string | null
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
  sendMessage: (content?: string, clearInput?: boolean) => Promise<void>
  /** 清空消息 */
  clearMessages: () => void
  /** 添加消息 */
  addMessage: (message: ChatMessage) => void
  /** 中止请求 */
  abortRequest: () => void
  /** 重试请求 */
  retryRequest: (msgIndex: number) => Promise<void>
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
    status: STATUS.INIT,
    errorMsg: null,
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
          messageState.status = STATUS.STREAMING
          if (messages.value[messages.value.length - 1].role === 'user') {
            messages.value.push({ role: 'assistant', content: '' })
          }
          const choice = data.choices?.[0]
          if (choice && choice.delta.reasoning_content) {
            if (!messages.value[messages.value.length - 1].reasoning_content) {
              messages.value[messages.value.length - 1].reasoning_content = ''
            }
            messages.value[messages.value.length - 1].reasoning_content += choice.delta.reasoning_content
          }
          if (choice && choice.delta.content) {
            messages.value[messages.value.length - 1].content += choice.delta.content
          }
        },
        onError: (error) => {
          messageState.status = STATUS.ERROR
          messageState.errorMsg = errorMessage
          console.error('Stream request error:', error)
        },
        onDone: () => {
          messageState.status = STATUS.FINISHED
        },
      },
    )
  }

  const chatRequest = async () => {
    // 更新状态
    messageState.status = STATUS.PROCESSING
    messageState.errorMsg = null

    // 创建中止控制器
    abortController = new AbortController()

    try {
      if (useStream.value) {
        await streamChat(abortController)
      } else {
        await chat(abortController)
      }
      messageState.status = STATUS.FINISHED
    } catch (error) {
      messageState.errorMsg = errorMessage
      messageState.status = STATUS.ERROR
      console.error('Send message error:', error)
    } finally {
      abortController = null
    }
  }

  // 发送消息
  const sendMessage = async (content: string = inputMessage.value, clearInput: boolean = true) => {
    if (!content?.trim() || GeneratingStatus.includes(messageState.status)) {
      return
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content,
    }
    messages.value.push(userMessage)
    if (clearInput) {
      inputMessage.value = ''
    }

    await chatRequest()
  }

  // 中止请求
  const abortRequest = () => {
    if (abortController) {
      abortController.abort()
      abortController = null
      messageState.status = STATUS.ABORTED
    }
  }

  // 重试请求
  const retryRequest = async (msgIndex: number) => {
    if (msgIndex === 0 || !messages.value[msgIndex] || messages.value[msgIndex].role === 'user') {
      return
    }
    messages.value.splice(msgIndex)
    await chatRequest()
  }

  //清空消息
  const clearMessages = () => {
    messages.value = []
    messageState.errorMsg = null
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
