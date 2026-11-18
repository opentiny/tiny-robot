import { useConversation, type UseConversationOptions, type UseMessagePlugin } from '@opentiny/tiny-robot-kit'
import type { ChatBeforeSend, ChatComposerRuntime, ChatMcpRuntime } from '../types'
import { useChatRuntimeFromConversation } from './useChatRuntimeFromConversation'
import {
  createProviderModelRuntime,
  createProviderRequestPlugin,
  createProviderResponseProvider,
  resolveProviderModels,
  type ChatProviderConfig,
} from './provider'
import { createRunConfigContextPlugin } from './plugins/runConfigContextPlugin'
import { errorStatePlugin } from './plugins/errorStatePlugin'
import { createMcpToolPlugin, type ChatToolCallTool, type ChatToolListTools } from './plugins/mcpToolPlugin'
import { createDefaultMcpAdapter } from './mcp/createDefaultMcpAdapter'
import type { ChatMcpServers } from './mcp/types'
import { createDefaultChatTitle } from './defaults'
import { getCurrentScope, onScopeDispose } from 'vue'

export interface UseChatRuntimeMcpAdapter {
  runtime: ChatMcpRuntime
  listTools: ChatToolListTools
  callTool: ChatToolCallTool
}

export interface UseChatRuntimeOptions {
  conversation?: Omit<UseConversationOptions, 'useMessageOptions'> & {
    useMessageOptions?: Partial<UseConversationOptions['useMessageOptions']>
  }
  titleGenerator?: (text: string) => string
  beforeSend?: ChatBeforeSend
  composer?: Pick<ChatComposerRuntime, 'disabled' | 'submitDisabled'>
  modelProviders?: readonly ChatProviderConfig[]
  mcp?: UseChatRuntimeMcpAdapter
  mcpServers?: ChatMcpServers
}

export function useChatRuntime(options: UseChatRuntimeOptions) {
  const owned = createChatRuntimeResources(options)
  if (getCurrentScope())
    onScopeDispose(() => {
      void owned.dispose().catch((error) => console.error('Runtime disposal failed:', error))
    })
  return owned.runtime
}

/** Internal resource owner used by both Vue and framework-independent entry points. */
export function createChatRuntimeResources(options: UseChatRuntimeOptions) {
  const lifetime = new AbortController()
  const conversationOptions: NonNullable<UseChatRuntimeOptions['conversation']> = options.conversation ?? {}
  const resolveTitle = options.titleGenerator ?? createDefaultChatTitle
  const userUseMessageOptions = conversationOptions.useMessageOptions
  const userResponseProvider = userUseMessageOptions?.responseProvider

  if (options.mcp !== undefined && options.mcpServers !== undefined) {
    throw new Error('useChatRuntime: mcp and mcpServers cannot be configured at the same time.')
  }

  if (options.modelProviders?.length && userResponseProvider) {
    throw new Error('useChatRuntime: modelProviders and responseProvider cannot be configured at the same time.')
  }

  const providerModels = options.modelProviders ? resolveProviderModels(options.modelProviders) : []
  const providerRuntime = providerModels.length > 0 ? createProviderModelRuntime(providerModels) : null
  if (!providerRuntime && !userResponseProvider) {
    throw new Error('useChatRuntime requires conversation.useMessageOptions.responseProvider or modelProviders.')
  }
  const ownedMcp = options.mcpServers !== undefined ? createDefaultMcpAdapter(options.mcpServers) : undefined
  const resolvedMcp = ownedMcp ?? options.mcp
  const composerOptions = options.composer ?? {}
  const builtInPlugins: UseMessagePlugin[] = [
    errorStatePlugin(),
    createRunConfigContextPlugin(providerRuntime?.resolveModel),
  ]

  if (providerRuntime) {
    builtInPlugins.push(createProviderRequestPlugin(providerRuntime.resolveModel))
  }

  if (resolvedMcp) {
    builtInPlugins.push(createMcpToolPlugin(resolvedMcp.listTools, resolvedMcp.callTool))
  }

  const useMessageOptions = {
    ...userUseMessageOptions,
    plugins: [...builtInPlugins, ...(userUseMessageOptions?.plugins ?? [])],
    responseProvider: providerRuntime
      ? createProviderResponseProvider(providerRuntime.resolveModel)
      : userResponseProvider,
  }

  if (!useMessageOptions.responseProvider) {
    throw new Error('useChatRuntime requires conversation.useMessageOptions.responseProvider or modelProviders.')
  }

  let conversation: ReturnType<typeof useConversation>
  try {
    conversation = useConversation({
      autoSaveMessages: true,
      ...conversationOptions,
      useMessageOptions: useMessageOptions as UseConversationOptions['useMessageOptions'],
    })
  } catch (error) {
    void ownedMcp?.dispose().catch((disposeError) => console.error('MCP disposal failed:', disposeError))
    throw error
  }

  const runtime = useChatRuntimeFromConversation({
    signal: lifetime.signal,
    conversation,
    titleGenerator: resolveTitle,
    beforeSend: options.beforeSend,
    composer: {
      ...composerOptions,
      model: providerRuntime?.model,
      mcp: resolvedMcp?.runtime,
    },
  })
  let closing: Promise<void> | undefined
  return {
    runtime,
    dispose() {
      if (closing) return closing
      lifetime.abort()
      closing = Promise.allSettled([conversation.dispose(), ownedMcp?.dispose()]).then((results) => {
        const failures = results.flatMap((result) => (result.status === 'rejected' ? [result.reason] : []))
        if (failures.length) throw Object.assign(new Error('Runtime disposal failed.'), { errors: failures })
      })
      return closing
    },
  }
}
