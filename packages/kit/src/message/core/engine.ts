import { ChatCompletion, ChatCompletionChunk } from 'openai/resources'
import { lengthPlugin, thinkingPlugin } from '../plugins'
import {
  BasePluginContext,
  ChatMessage,
  CreateMessageEngineOptions,
  InternalMessageState,
  MessageEngine,
  MessageEnginePlugin,
  MessageEngineInitResult,
  MessagePluginCommandRegistration,
  MessageRequestBody,
  MessageRuntime,
  MessageStateAdapter,
  RequestProcessingState,
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
  createTurnId,
} from '../utils'

type ChatCompletionChoice = ChatCompletion.Choice | ChatCompletionChunk.Choice

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

  const createMessage = <T extends ChatMessage>(message: T): T => adapter.createMessage(message)

  const defaultPlugins: MessageEnginePlugin[] = [thinkingPlugin(), lengthPlugin()]
  const plugins = deduplicatePlugins(defaultPlugins.concat(pluginsFromOptions))
  const runtimeMessages = initialMessages.map((message) => createMessage(message))
  let initializedMessages = runtimeMessages

  const initialState: InternalMessageState = {
    requestState: 'idle',
    processingState: undefined,
    messages: runtimeMessages,
  }

  adapter.initialize(initialState)

  const runtime: MessageRuntime = {
    turnId: null,
    currentTurn: [],
    customContext: {},
    abortController: null,
    responseProvider: initialResponseProvider,
    commandHandlers: new Map<string, MessagePluginCommandRegistration>(),
  }

  const getState = () => adapter.getState()
  const subscribe = adapter.subscribe
  const mutate = adapter.mutate

  for (const plugin of plugins) {
    if (!plugin.commands) {
      continue
    }

    for (const [commandName, handler] of Object.entries(plugin.commands)) {
      if (runtime.commandHandlers.has(commandName)) {
        throw new Error(`Duplicate command name "${commandName}" detected.`)
      }

      runtime.commandHandlers.set(commandName, { handler, owner: plugin })
    }
  }

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

  // Create base context for plugins
  const getBaseContext = (abortSignal: AbortSignal): BasePluginContext => ({
    getState,
    createMessage,
    mutate,
    abortSignal,
    currentTurn: runtime.currentTurn,
    turnId: runtime.turnId,
    plugins,
    customContext: runtime.customContext,
    setRequestState,
    setCustomContext,
  })

  const applyInitResult = (result: MessageEngineInitResult) => {
    if (result.messages) {
      const nextMessages = result.messages.map((message) => createMessage(message))
      initializedMessages = nextMessages
      mutate('messages', (draft) => {
        draft.messages = nextMessages
      })
    }

    if (result.currentTurn !== undefined) {
      runtime.currentTurn = result.currentTurn.map((message) => createMessage(message))
    }
    if (result.turnId !== undefined) {
      runtime.turnId = result.turnId
    }
    if (result.customContext !== undefined) {
      runtime.customContext = result.customContext
    }
    if (result.requestState) {
      setRequestState(result.requestState, result.processingState)
    }
  }

  const initSignal = new AbortController().signal
  for (const plugin of plugins.filter((plugin) => !isPluginDisabled(plugin, getBaseContext(initSignal)))) {
    const result = plugin.onInit?.({
      ...getBaseContext(initSignal),
      initialMessages: initializedMessages,
    })

    if (result && typeof result === 'object' && 'then' in result) {
      throw new Error(`Plugin [${plugin.name || 'Anonymous'}] onInit must be synchronous.`)
    }

    if (result) {
      applyInitResult(result)
    }
  }

  const finishTurnAfterRequest = async (abortSignal: AbortSignal) => {
    const context = getBaseContext(abortSignal)

    if (getState().requestState === 'paused') {
      for (const plugin of plugins.filter((plugin) => !isPluginDisabled(plugin, context))) {
        await plugin.onPaused?.(context)
      }
      return
    }

    setRequestState('completed')
    for (const plugin of plugins.filter((plugin) => !isPluginDisabled(plugin, context))) {
      await plugin.onTurnEnd?.(context)
    }
  }

  const notifyTurnAbort = async (abortSignal: AbortSignal) => {
    const context = getBaseContext(abortSignal)
    for (const plugin of plugins.filter((plugin) => !isPluginDisabled(plugin, context))) {
      await plugin.onTurnAbort?.(context)
    }
  }

  async function runTurnLifecycle(options: { resume?: boolean } = {}) {
    const ac = new AbortController()
    runtime.abortController = ac

    let assistantMessage: ChatMessage | null = null
    const setAssistantMessage = (message: ChatMessage) => {
      assistantMessage = message
    }

    try {
      if (options.resume) {
        const resumeContext = getBaseContext(ac.signal)
        for (const plugin of plugins.filter((plugin) => !isPluginDisabled(plugin, resumeContext))) {
          await plugin.onResumed?.(resumeContext)
        }
      } else {
        runtime.turnId ??= createTurnId()
        runtime.customContext = {}
      }

      setRequestState('processing', 'requesting')

      const baseContextAtStart = getBaseContext(ac.signal)
      for (const plugin of plugins.filter((plugin) => !isPluginDisabled(plugin, baseContextAtStart))) {
        if (!options.resume) {
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

      // 暂停态保留当前回合，方便外部命令恢复时继续沿用同一轮上下文。
      if (getState().requestState !== 'paused') {
        runtime.currentTurn = []
        runtime.turnId = null
      }

      mutate('messages', (_, skipNotify) => {
        if (assistantMessage?.loading) {
          assistantMessage.loading = undefined
        } else {
          skipNotify()
        }
      })
    }
  }

  const dispatchCommand = async <Result = unknown>(command: string, payload?: unknown): Promise<Result> => {
    const registration = runtime.commandHandlers.get(command)

    if (!registration) {
      throw new Error(`Unknown command "${command}"`)
    }

    const { handler, owner } = registration

    if (getState().requestState === 'processing') {
      const hasAwaitingApprovalToolCall = getState().messages.some((message) => {
        if (message.role !== 'assistant' || !Array.isArray(message.tool_calls) || message.tool_calls.length === 0) {
          return false
        }

        const toolCallState = (message.state?.toolCall as Record<string, { status?: string }> | undefined) ?? {}
        return message.tool_calls.some((toolCall) => {
          const status = toolCallState[toolCall.id]?.status
          return status === 'awaiting-approval'
        })
      })

      if (!hasAwaitingApprovalToolCall) {
        throw new Error('Cannot run plugin command while processing is in progress')
      }

      await new Promise<void>((resolve) => {
        let unsubscribe = () => {}
        const checkState = (currentState = getState()) => {
          if (currentState.requestState !== 'processing') {
            unsubscribe()
            resolve()
            return true
          }

          return false
        }

        unsubscribe = subscribe('requestState', (currentState) => {
          checkState(currentState)
        })

        checkState()
      })
    }

    const previousAbortController = runtime.abortController
    const ac = new AbortController()
    runtime.abortController = ac
    const wasPaused = getState().requestState === 'paused'

    let shouldRequest = false
    let requestNextResume: boolean | undefined
    let commandSucceeded = false
    let shouldFinishTurn = false
    let result: Result

    try {
      const baseContext = getBaseContext(ac.signal)
      if (isPluginDisabled(owner, baseContext)) {
        throw new Error(`Plugin command "${command}" is disabled.`)
      }

      const appendMessage = (message: ChatMessage | ChatMessage[]) => {
        appendMessages(...(Array.isArray(message) ? message : [message]))
      }

      const requestNext = (resume?: boolean) => {
        shouldRequest = true
        requestNextResume = resume
      }

      result = (await handler(payload, { ...baseContext, appendMessage, requestNext })) as Result
      commandSucceeded = true
      shouldFinishTurn = wasPaused && !shouldRequest && getState().requestState !== 'paused'
    } finally {
      runtime.abortController = previousAbortController
      if (
        !previousAbortController &&
        (!shouldRequest || !commandSucceeded) &&
        getState().requestState !== 'paused' &&
        !shouldFinishTurn
      ) {
        runtime.currentTurn = []
      }
    }

    if (commandSucceeded && getState().requestState === 'paused') {
      const pausedContext = getBaseContext(ac.signal)
      for (const plugin of plugins.filter((plugin) => !isPluginDisabled(plugin, pausedContext))) {
        await plugin.onPaused?.(pausedContext)
      }
    }

    if (ac.signal.aborted && (getState().requestState === 'processing' || getState().requestState === 'paused')) {
      setRequestState('aborted')
      runtime.currentTurn = []
      runtime.turnId = null
    }

    if (shouldRequest && !ac.signal.aborted) {
      await runTurnLifecycle({ resume: requestNextResume === true })
    }

    if (shouldFinishTurn) {
      await finishTurnAfterRequest(ac.signal)
      runtime.currentTurn = []
      runtime.turnId = null
    }

    return result
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

        const requestNext = (_resume?: boolean) => {
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

    if (getState().requestState === 'processing' || getState().requestState === 'paused') {
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
    if (getState().requestState === 'processing' || getState().requestState === 'paused') {
      console.warn('Cannot send message while processing is in progress')
      return
    }

    appendMessages(...msgs)

    await runTurn()
  }

  async function abort() {
    if (getState().requestState === 'paused') {
      // 暂停状态下插件命令可能仍在异步处理中。
      // 安装清理钩子使用的 controller 前，先取消该命令。
      runtime.abortController?.abort()
      const ac = new AbortController()
      runtime.abortController = ac

      try {
        await notifyTurnAbort(ac.signal)

        if (getState().requestState === 'paused') {
          setRequestState('aborted')
        }
      } finally {
        runtime.abortController = null
        runtime.currentTurn = []
        runtime.turnId = null
      }

      return
    }

    const activeAbortController = runtime.abortController
    activeAbortController?.abort()

    if (getState().requestState === 'processing') {
      await notifyTurnAbort(activeAbortController?.signal ?? new AbortController().signal)
    }

    // 仅等待实际请求结束；paused 是等待确认，不存在可 abort 的请求。
    if (getState().requestState === 'processing') {
      await new Promise<void>((resolve) => {
        let unsubscribe = () => {}
        unsubscribe = subscribe('requestState', (currentState) => {
          if (currentState.requestState !== 'processing') {
            unsubscribe()
            resolve()
          }
        })
      })
    }
  }

  return {
    getState,
    subscribe,
    sendMessage,
    send,
    abort,
    dispatchCommand,
    setResponseProvider(provider) {
      runtime.responseProvider = provider
    },
  }
}
