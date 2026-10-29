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
  const resolvedMcp = options.mcpServers !== undefined ? createDefaultMcpAdapter(options.mcpServers) : options.mcp
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
