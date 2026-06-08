import { ChatCompletion, ChatCompletionChunk } from 'openai/resources/index'
import { lengthPlugin, thinkingPlugin } from '../plugins'
import {
  BasePluginContext,
  ChatMessage,
  CreateMessageEngineOptions,
  InternalMessageState,
  MessageEngine,
  MessageEnginePlugin,
  MessagePluginCommandHandler,
  MessageRequestBody,
  MessageRuntime,
  MessageStateAdapter,
  PluginCommandResult,
  RequestProcessingState,
  RequestNextOptions,
  RequestState,
  ResponseProvider,
} from '../types'
import {
  AbortError,
  combineDeltaData,
  makeAbortable,
  normalizeToAsyncGenerator,
  omitFields,
  pickFields,
} from '../utils'

type ChatCompletionChoice = ChatCompletion.Choice | ChatCompletionChunk.Choice
type RunTurnLifecycleOptions = {
  resume?: boolean
}

const defaultResponseProvider: ResponseProvider = async () => {
  throw new Error('Response provider is not set')
}

/**
 * 插件去重，处理重复的插件名。
 * 如果插件有名字且存在重复，后面的插件会覆盖前面的插件。
 * 没有名字的插件总是会被添加。
 *
 * @param plugins - 插件数组
 * @returns 去重后的插件数组
 */
const deduplicatePlugins = (plugins: MessageEnginePlugin[]): MessageEnginePlugin[] => {
  const result: MessageEnginePlugin[] = []

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

const isPluginDisabled = (plugin: MessageEnginePlugin, context: BasePluginContext) => {
  if (typeof plugin.disabled === 'function') {
    return plugin.disabled(context)
  }

  return Boolean(plugin.disabled)
}

const registerPluginCommands = (plugins: MessageEnginePlugin[]) => {
  const pluginCommands = new Map<string, Record<string, MessagePluginCommandHandler>>()

  for (const plugin of plugins) {
    if (!plugin.name || !plugin.commands) continue

    const commands = pluginCommands.get(plugin.name) ?? {}

    for (const [commandName, handler] of Object.entries(plugin.commands)) {
      commands[commandName] = handler
    }

    pluginCommands.set(plugin.name, commands)
  }

  return pluginCommands
}

export const createMessageEngine = (
  adapter: MessageStateAdapter,
  options: CreateMessageEngineOptions = {},
): MessageEngine => {
  const {
    initialMessages = [],
    requestMessageFields = [],
    requestMessageFieldsExclude = ['state', 'metadata', 'loading'],
    responseProvider: initialResponseProvider = defaultResponseProvider,
    onCompletionChunk,
    plugins: pluginsFromOptions = [],
  } = options

  const initialState: InternalMessageState = {
    requestState: 'idle',
    processingState: undefined,
    messages: [...initialMessages],
  }

  adapter.initialize(initialState)

  const runtime: MessageRuntime = {
    currentTurn: [],
    customContext: {},
    abortController: null,
    responseProvider: initialResponseProvider,
  }

  const defaultPlugins: MessageEnginePlugin[] = [thinkingPlugin(), lengthPlugin()]
  const plugins = deduplicatePlugins(defaultPlugins.concat(pluginsFromOptions))
  const pluginCommands = registerPluginCommands(plugins)

  const getState = () => adapter.getState()
  const createMessage = <T extends ChatMessage>(message: T): T => adapter.createMessage(message)
  const subscribe = adapter.subscribe
  const mutate = adapter.mutate

  const objectDataIsValid = (obj: object | null | undefined) => {
    if (!obj || Object.keys(obj).length === 0) {
      return false
    }

    return Object.values(obj).some((value) => Boolean(value))
  }

  const sanitizeMessages = (messages: ChatMessage[]) => {
    let result: Partial<ChatMessage>[] = messages

    if (requestMessageFields.length) {
      result = result.map((message) => pickFields(message, requestMessageFields))
    }

    if (requestMessageFieldsExclude.length) {
      result = result.map((message) => omitFields(message, requestMessageFieldsExclude))
    }

    return result as ChatMessage[]
  }

  // Function to set custom context data
  const setCustomContext = (data: Record<string, unknown>) => {
    Object.assign(runtime.customContext, data)
  }

  const setRequestState = (requestState: RequestState, processingState?: RequestProcessingState) => {
    mutate('requestState', (draft, skipNotify) => {
      if (draft.requestState === requestState && draft.processingState === processingState) {
        skipNotify()
        return
      }

      draft.requestState = requestState
      draft.processingState = requestState === 'processing' ? (processingState ?? 'requesting') : undefined
    })
  }

  const appendMessages = (...messages: ChatMessage[]) => {
    const runtimeMessages = messages.map((message) => createMessage(message))

    mutate('messages', (draft) => {
      draft.messages.push(...runtimeMessages)
    })

    runtime.currentTurn.push(...runtimeMessages)

    return runtimeMessages
  }

  const restoreCurrentTurnForResume = () => {
    const messages = getState().messages
    let startIndex = 0

    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        startIndex = i
        break
      }
    }

    runtime.currentTurn = messages.slice(startIndex)
  }

  // Create base context for plugins
  const getBaseContext = (abortSignal: AbortSignal): BasePluginContext => ({
    getState,
    createMessage,
    mutate,
    abortSignal,
    currentTurn: runtime.currentTurn,
    customContext: runtime.customContext,
    setRequestState,
    setCustomContext,
  })

  const finishTurnAfterRequest = async (abortSignal: AbortSignal) => {
    const context = getBaseContext(abortSignal)

    if (getState().requestState === 'paused') {
      for (const plugin of plugins.filter((plugin) => !isPluginDisabled(plugin, context))) {
        await plugin.onTurnPause?.(context)
      }
      return
    }

    setRequestState('completed')
    for (const plugin of plugins.filter((plugin) => !isPluginDisabled(plugin, context))) {
      await plugin.onTurnEnd?.(context)
    }
  }

  async function runTurnLifecycle(options: RunTurnLifecycleOptions = {}) {
    const ac = new AbortController()
    runtime.abortController = ac
    runtime.customContext = {}
    if (options.resume) {
      restoreCurrentTurnForResume()
    }

    let assistantMessage: ChatMessage | null = null
    const setAssistantMessage = (message: ChatMessage) => {
      assistantMessage = message
    }

    try {
      setRequestState('processing', 'requesting')

      const baseContextAtStart = getBaseContext(ac.signal)
      for (const plugin of plugins.filter((plugin) => !isPluginDisabled(plugin, baseContextAtStart))) {
        if (options.resume) {
          await plugin.onTurnResume?.(baseContextAtStart)
        } else {
          await plugin.onTurnStart?.(baseContextAtStart)
        }
      }

      const turnResponseProvider = runtime.responseProvider

      try {
        await executeRequest(turnResponseProvider, ac.signal, { setAssistantMessage })
        await finishTurnAfterRequest(ac.signal)
      } catch (error) {
        if (
          ac.signal.aborted ||
          error instanceof AbortError ||
          (error instanceof Error && error.name === 'AbortError')
        ) {
          setRequestState('aborted')
        } else {
          throw error
        }
      }
    } catch (error) {
      setRequestState('error')

      let hasOnError = false
      const context = getBaseContext(ac.signal)

      for (const plugin of plugins.filter((plugin) => !isPluginDisabled(plugin, context))) {
        if (plugin.onError) {
          hasOnError = true
          plugin.onError({ ...context, error })
        }
      }

      if (!hasOnError) {
        throw error
      }
    } finally {
      const context = getBaseContext(ac.signal)
      for (const plugin of plugins.filter((plugin) => !isPluginDisabled(plugin, context))) {
        try {
          plugin.onFinally?.(context)
        } catch (error) {
          console.error(`Error in onFinally hook for plugin [${plugin.name || 'Anonymous'}]:`, error)
        }
      }

      runtime.abortController = null
      runtime.currentTurn = []

      mutate('messages', (_, skipNotify) => {
        if (assistantMessage?.loading) {
          assistantMessage.loading = undefined
        } else {
          skipNotify()
        }
      })
    }
  }

  async function executeRequest(
    responseProvider: ResponseProvider,
    abortSignal: AbortSignal,
    options: { setAssistantMessage?: (message: ChatMessage) => void } = {},
  ) {
    // executeRequest 可能递归调用，需要再设置 requesting 状态
    setRequestState('processing', 'requesting')

    const requestBody: MessageRequestBody = { messages: getState().messages }

    // Allow plugins to modify request body (e.g., add tools)
    const baseContext = getBaseContext(abortSignal)
    for (const plugin of plugins.filter((plugin) => !isPluginDisabled(plugin, baseContext))) {
      await plugin.onBeforeRequest?.({ ...baseContext, requestBody })
    }

    // 请求前对消息进行清洗，去掉不必要的字段
    requestBody.messages = sanitizeMessages(requestBody.messages)

    let assistantMessage = { role: 'assistant', content: '', loading: true } as ChatMessage
    ;[assistantMessage] = appendMessages(assistantMessage)
    options.setAssistantMessage?.(assistantMessage)

    const result = responseProvider(requestBody, abortSignal)
    const chunks = normalizeToAsyncGenerator(result)

    let lastChoice: ChatCompletionChoice | undefined = undefined

    for await (const chunk of chunks) {
      setRequestState('processing', 'completing')

      mutate('messages', (_, skipNotify) => {
        if (assistantMessage.loading) {
          assistantMessage.loading = undefined
        } else {
          skipNotify()
        }
      })

      const choice = (chunk.choices || []).find((item) => item.index === 0) ?? chunk.choices?.[0]

      if (!choice) {
        continue
      }

      lastChoice = choice

      const runDefault = () => {
        mutate('messages', () => {
          // Ensure metadata exists
          if (!assistantMessage.metadata) {
            assistantMessage.metadata = {}
          }

          const { created, ...rest } = chunk
          assistantMessage.metadata.createdAt = created
          assistantMessage.metadata.updatedAt = Math.floor(Date.now() / 1000)
          Object.assign(assistantMessage.metadata, rest)

          // 在某些非标准 api 中，choice.message 和 choice.delta 属性可能同时存在，
          // 但其中一个属性为 null 或者空对象，这时需要优先使用另一个属性的数据
          const data =
            ('delta' in choice && objectDataIsValid(choice.delta) && choice.delta) ||
            ('message' in choice && objectDataIsValid(choice.message) && choice.message) ||
            null

          if (data?.role) {
            assistantMessage.role = data.role
          }

          if (data) {
            const { role: _role, ...restData } = data
            combineDeltaData(assistantMessage, restData)
          }
        })
      }

      const updateCurrentMessage = (recipe: (message: ChatMessage) => void) => {
        mutate('messages', () => {
          recipe(assistantMessage)
        })
      }

      if (onCompletionChunk) {
        const currentContext = getBaseContext(abortSignal)
        onCompletionChunk(
          {
            ...currentContext,
            chunk,
            choice,
            currentMessage: assistantMessage,
            updateCurrentMessage,
          },
          runDefault,
        )
      } else {
        runDefault()
      }

      const currentContext = getBaseContext(abortSignal)
      for (const plugin of plugins.filter((plugin) => !isPluginDisabled(plugin, currentContext))) {
        plugin.onCompletionChunk?.({
          ...currentContext,
          abortSignal,
          chunk,
          choice,
          currentMessage: assistantMessage,
          updateCurrentMessage,
        })
      }
    }

    await postRequest(assistantMessage, responseProvider, abortSignal, lastChoice, options)
  }

  async function postRequest(
    currentMessage: ChatMessage,
    responseProvider: ResponseProvider,
    abortSignal: AbortSignal,
    lastChoice?: ChatCompletionChoice,
    options?: { setAssistantMessage?: (message: ChatMessage) => void },
  ) {
    let shouldRequest = false

    const baseContext = getBaseContext(abortSignal)

    const tasks = plugins
      .filter((plugin) => !isPluginDisabled(plugin, baseContext))
      .map((plugin) => {
        if (!plugin.onAfterRequest) {
          return null
        }

        const appendMessage = (message: ChatMessage | ChatMessage[]) => {
          appendMessages(...(Array.isArray(message) ? message : [message]))
        }

        const requestNext = () => {
          shouldRequest = true
        }

        return plugin.onAfterRequest({
          ...baseContext,
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
      await executeRequest(responseProvider, abortSignal, options)
    }
  }

  async function runTurn() {
    await runTurnLifecycle()
  }

  async function sendMessage(content: string) {
    // Validate input content
    if (!content || !content.trim()) {
      console.warn('Cannot send empty message')
      return
    }

    if (getState().requestState === 'processing') {
      console.warn('Cannot send message while processing is in progress')
      return
    }

    const now = Math.floor(Date.now() / 1000)
    appendMessages({
      role: 'user',
      content: content.trim(),
      metadata: { createdAt: now, updatedAt: now },
    })

    await runTurn()
  }

  async function send(...msgs: ChatMessage[]) {
    // Validate current state - only allow sending when not processing
    if (getState().requestState === 'processing') {
      console.warn('Cannot send message while processing is in progress')
      return
    }

    appendMessages(...msgs)

    await runTurn()
  }

  async function abort() {
    runtime.abortController?.abort()

    // 等待直到 isProcessing 变为 false
    if (getState().isProcessing) {
      await new Promise<void>((resolve) => {
        let unsubscribe = () => {}
        unsubscribe = subscribe('requestState', (currentState) => {
          if (!currentState.isProcessing) {
            unsubscribe()
            resolve()
          }
        })
      })
    }
  }

  async function runPluginCommand<T = unknown>(
    pluginName: string,
    commandName: string,
    payload?: unknown,
  ): Promise<PluginCommandResult<T>> {
    const handler = pluginCommands.get(pluginName)?.[commandName]

    if (typeof handler !== 'function') {
      return { success: false, error: new Error(`Plugin command not found: ${pluginName}.${commandName}`) }
    }

    if (getState().requestState === 'processing') {
      const error = new Error('Cannot run plugin command while processing is in progress')
      console.warn(error.message)
      return { success: false, error }
    }

    const ac = new AbortController()
    runtime.abortController = ac

    let shouldRequest = false
    let requestNextOptions: RequestNextOptions | undefined
    let result: T

    try {
      const baseContext = getBaseContext(ac.signal)

      const appendMessage = (message: ChatMessage | ChatMessage[]) => {
        appendMessages(...(Array.isArray(message) ? message : [message]))
      }

      const requestNext = (options?: RequestNextOptions) => {
        shouldRequest = true
        requestNextOptions = options
      }

      result = (await handler(payload, { ...baseContext, appendMessage, requestNext })) as T
    } catch (error) {
      runtime.abortController = null
      runtime.currentTurn = []
      return { success: false, error }
    }

    runtime.abortController = null

    const shouldContinue = shouldRequest && !ac.signal.aborted
    if (shouldContinue) {
      runTurnLifecycle({ resume: requestNextOptions?.resume })
    } else {
      runtime.currentTurn = []
    }

    return { success: true, result }
  }

  return {
    getState,
    subscribe,
    sendMessage,
    send,
    abort,
    setResponseProvider(provider) {
      runtime.responseProvider = provider
    },
    runPluginCommand,
  }
}
