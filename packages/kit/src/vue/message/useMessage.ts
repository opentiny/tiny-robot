import { ref, toRaw, watch } from 'vue'
import { createVueMessageAdapter } from '../../message/adapters'
import { createMessageEngine } from '../../message/core'
import {
  AfterRequestContext as CoreAfterRequestContext,
  BasePluginContext as CoreBasePluginContext,
  BeforeRequestContext as CoreBeforeRequestContext,
  ChatMessage as CoreChatMessage,
  CompletionChunkContext as CoreCompletionChunkContext,
  ResponseProvider as CoreResponseProvider,
  CreateMessageEngineOptions,
  MessageEnginePlugin,
} from '../../message/types'
import { ChatMessage } from '../../types'
import type { VueMessagePluginRuntime } from './types.internal'
import {
  ChatCompletion,
  CompletionChoice,
  MessageRequestBody,
  UseMessageOptions,
  UseMessagePlugin,
  UseMessageReturn,
  BasePluginContext as VueBasePluginContext,
} from './types'

export const useMessage = (options: UseMessageOptions): UseMessageReturn => {
  const {
    initialMessages = [],
    requestMessageFields = [],
    requestMessageFieldsExclude = ['state', 'metadata', 'loading'],
    plugins = [],
    responseProvider: initialResponseProvider,
    onCompletionChunk,
  } = options

  const adapter = createVueMessageAdapter()

  const resolveReactiveMessage = (message: ChatMessage) => {
    return (adapter.messages.value.find(
      (item) => item === message || toRaw(item) === message || toRaw(item) === toRaw(message),
    ) ?? message) as ChatMessage
  }

  const createVueBaseContext = (context: CoreBasePluginContext): VueBasePluginContext => {
    return {
      messages: adapter.messages.value as ChatMessage[],
      currentTurn: context.currentTurn.map((message) => resolveReactiveMessage(message as ChatMessage)),
      requestState: adapter.requestState.value,
      processingState: adapter.processingState.value,
      plugins,
      setRequestState: context.setRequestState,
      abortSignal: context.abortSignal,
      customContext: context.customContext,
      setCustomContext: context.setCustomContext,
    }
  }

  const createCorePlugin = (plugin: UseMessagePlugin): MessageEnginePlugin => {
    const basePlugin = plugin as UseMessagePlugin & {
      __corePluginFactory?: (runtime: VueMessagePluginRuntime) => MessageEnginePlugin
    }

    if (typeof basePlugin.__corePluginFactory === 'function') {
      return basePlugin.__corePluginFactory({
        createCorePlugin,
        createVueBaseContext,
        resolveReactiveMessage,
      })
    }

    const {
      name,
      disabled,
      commands,
      onTurnStart,
      onTurnEnd,
      onTurnResume,
      onTurnPause,
      onBeforeRequest,
      onAfterRequest,
      onCompletionChunk,
      onError,
      onFinally,
    } = plugin

    const corePlugin: MessageEnginePlugin = {}

    if (name !== undefined) {
      corePlugin.name = name
    }

    if (disabled !== undefined) {
      corePlugin.disabled =
        typeof disabled === 'function' ? (context) => disabled(createVueBaseContext(context)) : disabled
    }

    if (commands) {
      corePlugin.commands = Object.fromEntries(
        Object.entries(commands).map(([commandName, handler]) => [
          commandName,
          (payload, context) =>
            handler(payload, {
              ...createVueBaseContext(context),
              appendMessage: context.appendMessage as (message: ChatMessage | ChatMessage[]) => void,
              requestNext: context.requestNext,
            }),
        ]),
      )
    }

    if (onTurnStart) {
      corePlugin.onTurnStart = (context) => onTurnStart(createVueBaseContext(context))
    }

    if (onTurnResume) {
      corePlugin.onTurnResume = (context) => onTurnResume(createVueBaseContext(context))
    }

    if (onTurnEnd) {
      corePlugin.onTurnEnd = (context) => onTurnEnd(createVueBaseContext(context))
    }

    if (onTurnPause) {
      corePlugin.onTurnPause = (context) => onTurnPause(createVueBaseContext(context))
    }

    if (onBeforeRequest) {
      corePlugin.onBeforeRequest = (context: CoreBeforeRequestContext) =>
        onBeforeRequest({
          ...createVueBaseContext(context),
          requestBody: context.requestBody as MessageRequestBody,
        })
    }

    if (onAfterRequest) {
      corePlugin.onAfterRequest = (context: CoreAfterRequestContext) =>
        onAfterRequest({
          ...createVueBaseContext(context),
          currentMessage: resolveReactiveMessage(context.currentMessage as ChatMessage),
          lastChoice: context.lastChoice as CompletionChoice,
          appendMessage: context.appendMessage as (message: ChatMessage | ChatMessage[]) => void,
          requestNext: context.requestNext,
        })
    }

    if (onCompletionChunk) {
      corePlugin.onCompletionChunk = (context: CoreCompletionChunkContext) =>
        onCompletionChunk({
          ...createVueBaseContext(context),
          currentMessage: resolveReactiveMessage(context.currentMessage as ChatMessage),
          choice: context.choice as CompletionChoice,
          chunk: context.chunk as ChatCompletion,
        })
    }

    if (onError) {
      corePlugin.onError = (context) =>
        onError({
          ...createVueBaseContext(context),
          error: context.error,
        })
    }

    if (onFinally) {
      corePlugin.onFinally = (context) => onFinally(createVueBaseContext(context))
    }

    return corePlugin
  }

  const onCompletionChunkHandler: CreateMessageEngineOptions['onCompletionChunk'] = (context, runDefault) => {
    if (!onCompletionChunk) {
      return undefined
    }

    return onCompletionChunk(
      {
        ...createVueBaseContext(context),
        currentMessage: resolveReactiveMessage(context.currentMessage as ChatMessage),
        choice: context.choice as CompletionChoice,
        chunk: context.chunk as ChatCompletion,
      },
      runDefault,
    )
  }

  const engine = createMessageEngine(adapter, {
    initialMessages: initialMessages as CoreChatMessage[],
    requestMessageFields,
    requestMessageFieldsExclude,
    responseProvider: initialResponseProvider as CoreResponseProvider,
    onCompletionChunk: onCompletionChunk ? onCompletionChunkHandler : undefined,
    plugins: plugins.map((plugin) => createCorePlugin(plugin)),
  })

  const responseProvider = ref(initialResponseProvider)

  watch(
    responseProvider,
    (provider) => {
      engine.setResponseProvider(provider as CoreResponseProvider)
    },
    { flush: 'sync' },
  )

  return {
    requestState: adapter.requestState,
    processingState: adapter.processingState,
    messages: adapter.messages,
    responseProvider,
    isProcessing: adapter.isProcessing,
    sendMessage: engine.sendMessage,
    send: engine.send,
    abortRequest: engine.abort,
    runPluginCommand: engine.runPluginCommand,
  } as UseMessageReturn
}
