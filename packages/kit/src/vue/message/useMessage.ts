import { computed, reactive, ref, watch } from 'vue'
import { fallbackRolePlugin, lengthPlugin, thinkingPlugin } from './plugins'
import type {
  BasePluginContext,
  ChatMessage,
  CompletionChoice,
  MessageRequestBody,
  RequestProcessingState,
  RequestState,
  UseMessageOptions,
  UseMessagePlugin,
  UseMessageReturn,
} from './types'
import { AbortError, combileDeltaData, makeAbortable, normalizeToAsyncGenerator, pickFields } from './utils'

/**
 * 插件去重，处理重复的插件名。
 * 如果插件有名字且存在重复，后面的插件会覆盖前面的插件。
 * 没有名字的插件总是会被添加。
 *
 * @param plugins - 插件数组
 * @returns 去重后的插件数组
 */
const deduplicatePlugins = (plugins: UseMessagePlugin[]): UseMessagePlugin[] => {
  const result: UseMessagePlugin[] = []

  for (const plugin of plugins) {
    // 如果插件有名字，则检查是否重复，如果重复则先删除原来的，再添加新的
    if (plugin.name) {
      const existingIndex = result.findIndex((p) => p.name === plugin.name)
      if (existingIndex !== -1) {
        result.splice(existingIndex, 1)
      }
    }
    result.push(plugin)
  }

  return result
}

export const useMessage = (options: UseMessageOptions): UseMessageReturn => {
  const {
    initialMessages = [],
    requestMessageFields = ['role', 'content', 'tool_calls', 'tool_call_id'],
    plugins: pluginsFromOptions = [],
    onCompletionChunk,
  } = options

  const requestState = ref<RequestState>('idle')
  const processingState = ref<RequestProcessingState | undefined>(undefined)
  const messages = ref<ChatMessage[]>(initialMessages)
  /**
   * Current response provider, can be updated at runtime to switch data sources.
   */
  const responseProvider = ref(options.responseProvider)

  let abortController: AbortController | null = null
  let currentTurn: ChatMessage[] = []
  // Custom context data that can be set by plugins
  let customContext: Record<string, unknown> = {}

  const defaultPlugins = [fallbackRolePlugin(), thinkingPlugin(), lengthPlugin()]
  const plugins = deduplicatePlugins(defaultPlugins.concat(pluginsFromOptions))

  // Computed properties for UI state
  const isProcessing = computed(() => requestState.value === 'processing')

  // Function to handle sending message
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

  // Function to set custom context data
  const setCustomContext = (data: Record<string, unknown>) => {
    Object.assign(customContext, data)
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
    customContext,
    setCustomContext,
  })

  const executeRequest = async (responseProvider: UseMessageOptions['responseProvider'], abortSignal: AbortSignal) => {
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
    for (const plugin of plugins.filter((plugin) => !plugin.disabled)) {
      await plugin.onBeforeRequest?.({ ...baseContext, abortSignal, requestBody })
    }

    const message: ChatMessage = reactive({ role: '', content: '', loading: true })
    innerAppendMessage(message)

    let lastChoice: CompletionChoice | undefined = undefined

    const result = responseProvider(requestBody, abortSignal)
    const completionGenerator = normalizeToAsyncGenerator(result)

    for await (const chunk of completionGenerator) {
      setRequestState('processing', 'completing')

      if (message.loading) {
        message.loading = undefined
      }

      // TODO 目前只选择index为0的choice
      const choice = chunk.choices?.find((choice) => choice.index === 0)
      if (choice) {
        lastChoice = choice

        const runDefault = () => {
          // Ensure metadata exists
          if (!message.metadata) {
            message.metadata = {}
          }

          const { created, ...rest } = chunk
          message.metadata.createdAt = created
          message.metadata.updatedAt = Math.floor(Date.now() / 1000)
          Object.assign(message.metadata, rest)

          combileDeltaData(message, choice.message || choice.delta)
        }

        if (onCompletionChunk) {
          const baseContext = getBaseContext()
          onCompletionChunk({ ...baseContext, abortSignal, chunk, currentMessage: message }, runDefault)
        } else {
          runDefault()
        }
      }

      const baseContext = getBaseContext()
      for (const plugin of plugins.filter((plugin) => !plugin.disabled)) {
        plugin.onCompletionChunk?.({ ...baseContext, abortSignal, chunk, choice, currentMessage: message })
      }
    }

    await postRequest(message, responseProvider, abortSignal, lastChoice)
  }

  const tryExecuteRequest = async () => {
    const ac = new AbortController()
    abortController = ac
    // Snapshot the current response provider at the start of the turn
    // to prevent inconsistencies if it changes during the request
    const turnResponseProvider = responseProvider.value
    // Reset custom context at the start of each turn
    customContext = {}

    try {
      setRequestState('processing', 'requesting')
      // 1) onTurnStart 串行执行，有错误则中断
      const baseContextAtStart = getBaseContext()
      for (const plugin of plugins.filter((plugin) => !plugin.disabled)) {
        await plugin.onTurnStart?.({ ...baseContextAtStart, abortSignal: ac.signal })
      }

      // 2) 主流程执行，有错误则中断（不包括中止错误）
      try {
        await executeRequest(turnResponseProvider, ac.signal)
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
      for (const plugin of plugins.filter((plugin) => !plugin.disabled)) {
        await plugin.onTurnEnd?.({ ...baseContextAtEnd, abortSignal: ac.signal })
      }
    } catch (err) {
      setRequestState('error')

      const context = getBaseContext()
      for (const plugin of plugins.filter((plugin) => !plugin.disabled)) {
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

  // 取消当前消息请求的函数
  const abortRequest = async () => {
    abortController?.abort()

    // 等待直到 isProcessing 变为 false
    if (isProcessing.value) {
      await new Promise<void>((resolve) => {
        const stopWatcher = watch(
          isProcessing,
          (value) => {
            if (!value) {
              stopWatcher()
              resolve()
            }
          },
          { immediate: true },
        )
      })
    }
  }

  const postRequest = async (
    currentMessage: ChatMessage,
    responseProvider: UseMessageOptions['responseProvider'],
    abortSignal: AbortSignal,
    lastChoice?: CompletionChoice,
  ) => {
    let shouldRequest = false

    const baseContext = getBaseContext()

    const tasks = plugins
      .filter((plugin) => !plugin.disabled)
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
          lastChoice,
          appendMessage,
          requestNext,
        })
      })
      .filter((task): task is Promise<void> => task !== null)

    // 并行执行所有 onAfterRequest 钩子
    await makeAbortable(Promise.all(tasks), abortSignal)

    if (shouldRequest) {
      await executeRequest(responseProvider, abortSignal)
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
    responseProvider,

    // Computed
    isProcessing,

    // Methods
    sendMessage,
    send,
    abortRequest,
  }
}
