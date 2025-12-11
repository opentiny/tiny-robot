import { computed, reactive, ref } from 'vue'
import type {
  BasePluginContext,
  ChatMessage,
  Choice,
  MessageRequestBody,
  RequestProcessingState,
  RequestState,
  useMessageOptions,
  UseMessageReturn,
} from './types'
import { AbortError, combileDeltaData, makeAbortable, normalizeToAsyncGenerator, pickFields } from './utils'

export const useMessage = (options: useMessageOptions): UseMessageReturn => {
  const {
    initialMessages = [],
    requestMessageFields = ['role', 'content', 'tool_calls', 'tool_call_id'],
    plugins = [],
    responseProvider,
    onStreamChunk,
  } = options

  const requestState = ref<RequestState>('idle')
  const processingState = ref<RequestProcessingState | undefined>(undefined)
  const messages = ref<ChatMessage[]>(initialMessages)
  /**
   * Current response provider, can be updated at runtime to switch data sources.
   */
  const responseProviderRef = ref(responseProvider)
  let abortController: AbortController | null = null
  let currentTurn: ChatMessage[] = []

  // Computed properties for UI state
  const isProcessing = computed(() => requestState.value === 'processing')

  // Function to handle sending message with streaming
  const sendMessage = async (content: string) => {
    // Validate input content
    if (!content || !content.trim()) {
      console.warn('Cannot send empty message')
      return
    }

    // Validate current state - only allow sending when not processing
    if (isProcessing.value) {
      console.warn('Cannot send message while processing is in progress')
      return
    }

    const now = Math.floor(Date.now() / 1000)
    // Add user message to conversation
    messages.value.push({
      role: 'user',
      content: content.trim(),
      metadata: { createdAt: now, updatedAt: now },
    })
    currentTurn.push(messages.value[messages.value.length - 1])

    // Execute the request
    await tryExecuteRequest()
  }

  const send = async (...msgs: ChatMessage[]) => {
    // Validate current state - only allow sending when not processing
    if (isProcessing.value) {
      console.warn('Cannot send message while processing is in progress')
      return
    }

    messages.value.push(...msgs)
    currentTurn.push(...msgs)

    // Execute the request
    await tryExecuteRequest()
  }

  const sanitizeMessages = (messages: ChatMessage[]) => {
    return messages.map((message) => pickFields(message, requestMessageFields))
  }

  const setRequestState = (state: RequestState, pState?: RequestProcessingState) => {
    requestState.value = state
    if (state === 'processing') {
      processingState.value = pState || 'requesting'
    } else {
      processingState.value = undefined
    }
  }

  // Create base context for plugins
  const getBaseContext = (): Omit<BasePluginContext, 'abortSignal'> => ({
    messages: messages.value,
    currentTurn,
    requestState: requestState.value,
    processingState: processingState.value,
    requestMessageFields,
    plugins,
    setRequestState,
  })

  /**
   * Update response provider at runtime.
   * New provider will be used for subsequent requests.
   */
  const setResponseProvider = (provider: useMessageOptions['responseProvider']) => {
    responseProviderRef.value = provider
  }

  const executeRequest = async (abortSignal: AbortSignal) => {
    setRequestState('processing', 'requesting')

    const requestBody = new Proxy<MessageRequestBody>(
      { messages: sanitizeMessages(messages.value) },
      {
        set(obj, prop, value) {
          if (prop === 'messages') {
            // 赋值 messages 时自动执行 sanitizeMessages
            obj.messages = sanitizeMessages(value)
            return true
          }
          ;(obj as Record<string, unknown>)[prop as string] = value
          return true
        },
      },
    )

    // Allow plugins to modify request body (e.g., add tools)
    const baseContext = getBaseContext()
    for (const plugin of plugins) {
      await plugin.onBeforeRequest?.({ ...baseContext, abortSignal, requestBody })
    }

    const message: ChatMessage = reactive({ role: '', content: '', loading: true })
    innerAppendMessage(message)

    let lastChoiceChunk: Choice | undefined = undefined

    const result = responseProviderRef.value(requestBody, abortSignal)
    const stream = normalizeToAsyncGenerator(result)

    for await (const chunk of stream) {
      setRequestState('processing', 'streaming')

      if (message.loading) {
        message.loading = undefined
      }

      // 目前只选择index为0的choice
      const choice = chunk.choices?.find((choice) => choice.index === 0)
      if (choice) {
        lastChoiceChunk = choice

        const runDefault = () => {
          // Ensure metadata exists
          if (!message.metadata) {
            message.metadata = {}
          }

          const { created, ...rest } = chunk
          message.metadata.createdAt = created
          message.metadata.updatedAt = Math.floor(Date.now() / 1000)
          Object.assign(message.metadata, rest)

          combileDeltaData(message, choice.delta)
        }

        if (onStreamChunk) {
          const baseContext = getBaseContext()
          onStreamChunk({ ...baseContext, abortSignal, chunk, currentMessage: message }, runDefault)
        } else {
          runDefault()
        }
      }

      const baseContext = getBaseContext()
      for (const plugin of plugins) {
        plugin.onStreamChunk?.({ ...baseContext, abortSignal, chunk, currentMessage: message })
      }
    }

    await postRequest(message, abortSignal, lastChoiceChunk)
  }

  const tryExecuteRequest = async () => {
    const ac = new AbortController()
    abortController = ac

    try {
      setRequestState('processing', 'requesting')
      // 1) onTurnStart 串行执行，有错误则中断
      const baseContextAtStart = getBaseContext()
      for (const plugin of plugins) {
        await plugin.onTurnStart?.({ ...baseContextAtStart, abortSignal: ac.signal })
      }

      // 2) 主流程执行，有错误则中断（不包括中止错误）
      try {
        await executeRequest(ac.signal)
        setRequestState('completed')
      } catch (err) {
        // 检查是否是中止错误：优先检查当前使用的 AbortController 的信号状态
        // 然后检查错误类型（instanceof 检查最准确）
        // 最后通过 name 属性作为后备检查（处理跨模块/序列化等边界情况）
        if (ac.signal.aborted || err instanceof AbortError || (err instanceof Error && err.name === 'AbortError')) {
          setRequestState('aborted')
        } else {
          throw err
        }
      }

      // 3) onTurnEnd 串行执行，有错误则中断
      const baseContextAtEnd = getBaseContext()
      for (const plugin of plugins) {
        await plugin.onTurnEnd?.({ ...baseContextAtEnd, abortSignal: ac.signal })
      }
    } catch (err) {
      setRequestState('error')

      const context = getBaseContext()
      for (const plugin of plugins) {
        plugin.onError?.({ ...context, abortSignal: ac.signal, error: err })
      }

      throw err
    } finally {
      abortController = null
      if (currentTurn.slice(-1)[0]) {
        currentTurn.slice(-1)[0].loading = undefined
      }
      currentTurn = []
    }
  }

  // Function to cancel the current message request
  const abortRequest = () => {
    abortController?.abort()
  }

  const postRequest = async (currentMessage: ChatMessage, abortSignal: AbortSignal, lastChoiceChunk?: Choice) => {
    let shouldRequest = false

    const baseContext = getBaseContext()

    const tasks = plugins
      .map((plugin) => {
        if (!plugin.onAfterRequest) {
          return null
        }

        const appendMessage = (message: ChatMessage | ChatMessage[]) => {
          innerAppendMessage(message)
        }

        const requestNext = () => {
          shouldRequest = true
        }

        return plugin.onAfterRequest({
          ...baseContext,
          abortSignal,
          currentMessage,
          lastChoiceChunk,
          appendMessage,
          requestNext,
        })
      })
      .filter((task): task is Promise<void> => task !== null)

    // 并行执行所有 onAfterRequest 钩子
    await makeAbortable(Promise.all(tasks), abortSignal)

    if (shouldRequest) {
      await executeRequest(abortSignal)
    }
  }

  const innerAppendMessage = (message: ChatMessage | ChatMessage[]) => {
    const msgs = Array.isArray(message) ? message : [message]

    messages.value.push(...msgs)
    currentTurn.push(...msgs)
  }

  return {
    // State
    requestState,
    processingState,
    messages,

    // Computed
    isProcessing,

    // Methods
    sendMessage,
    send,
    abortRequest,
    setResponseProvider,
  }
}
