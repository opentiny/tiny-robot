import { useConversation, type UseConversationOptions, type UseMessagePlugin } from '@opentiny/tiny-robot-kit'
import type { ChatBeforeSend, ChatComposerRuntime } from '../types'
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
import { createMcpToolPlugin } from './plugins/mcpToolPlugin'
import { createDefaultMcpAdapter } from './mcp/createDefaultMcpAdapter'
import { createCompositeMcpAdapter, type ChatMcpAdapter } from './mcp/compositeMcpAdapter'
import type { ChatMcpServers } from './mcp/types'
import { createDefaultChatTitle } from './defaults'

export type UseChatRuntimeMcpAdapter = ChatMcpAdapter

export interface UseChatRuntimeMcpOptions {
  servers?: ChatMcpServers
  adapters?: readonly UseChatRuntimeMcpAdapter[]
}

export type UseChatRuntimeMcp = UseChatRuntimeMcpAdapter | UseChatRuntimeMcpOptions

export interface UseChatRuntimeOptions {
  conversation?: Omit<UseConversationOptions, 'useMessageOptions'> & {
    useMessageOptions?: Partial<UseConversationOptions['useMessageOptions']>
  }
  titleGenerator?: (text: string) => string
  beforeSend?: ChatBeforeSend
  composer?: Pick<ChatComposerRuntime, 'disabled' | 'submitDisabled'>
  modelProviders?: readonly ChatProviderConfig[]
  /**
   * Unified MCP configuration.
   *
   * Passing a single adapter directly is retained for compatibility but is deprecated;
   * use `{ adapters: [adapter] }` instead.
   */
  mcp?: UseChatRuntimeMcp
  /**
   * @deprecated Use `mcp.servers` instead. This option remains for backward compatibility.
   */
  mcpServers?: ChatMcpServers
}

function isChatMcpAdapter(value: UseChatRuntimeMcp): value is UseChatRuntimeMcpAdapter {
  return 'runtime' in value && 'listTools' in value && 'callTool' in value
}

export function useChatRuntime(options: UseChatRuntimeOptions) {
  const conversationOptions: NonNullable<UseChatRuntimeOptions['conversation']> = options.conversation ?? {}
  const resolveTitle = options.titleGenerator ?? createDefaultChatTitle
  const userUseMessageOptions = conversationOptions.useMessageOptions
  const userResponseProvider = userUseMessageOptions?.responseProvider

  if (options.modelProviders?.length && userResponseProvider) {
    throw new Error('useChatRuntime: modelProviders and responseProvider cannot be configured at the same time.')
  }

  const providerModels = options.modelProviders ? resolveProviderModels(options.modelProviders) : []
  const providerRuntime = providerModels.length > 0 ? createProviderModelRuntime(providerModels) : null
  const mcpOptions = options.mcp
    ? isChatMcpAdapter(options.mcp)
      ? { adapters: [options.mcp] }
      : options.mcp
    : undefined

  if (options.mcpServers !== undefined && mcpOptions?.servers !== undefined) {
    throw new Error('useChatRuntime: mcp.servers and mcpServers cannot be configured at the same time.')
  }

  const configuredServers = mcpOptions?.servers ?? options.mcpServers
  const customMcpAdapters = mcpOptions?.adapters ?? []
  const hasMcp = options.mcp !== undefined || options.mcpServers !== undefined
  const registryAdapter = hasMcp ? createDefaultMcpAdapter(configuredServers ?? []) : undefined
  const mcpAdapters = [registryAdapter, ...customMcpAdapters].filter(
    (adapter): adapter is ChatMcpAdapter => adapter !== undefined,
  )
  const resolvedMcp =
    mcpAdapters.length > 1
      ? createCompositeMcpAdapter({ adapters: mcpAdapters, registrationAdapter: registryAdapter })
      : mcpAdapters[0]
  const composerOptions = options.composer ?? {}
  const builtInPlugins: UseMessagePlugin[] = [errorStatePlugin(), createRunConfigContextPlugin()]

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

  const conversation = useConversation({
    autoSaveMessages: true,
    ...conversationOptions,
    useMessageOptions: useMessageOptions as UseConversationOptions['useMessageOptions'],
  })

  return useChatRuntimeFromConversation({
    conversation,
    titleGenerator: resolveTitle,
    beforeSend: options.beforeSend,
    composer: {
      ...composerOptions,
      model: providerRuntime?.model,
      mcp: resolvedMcp?.runtime,
    },
  })
}
