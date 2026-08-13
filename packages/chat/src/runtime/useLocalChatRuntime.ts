import { useConversation, type UseConversationOptions, type UseMessagePlugin } from '@opentiny/tiny-robot-kit'
import type { ChatComposerRuntime, ChatMcpRuntime } from '../types'
import { useKitChatRuntime } from './useKitChatRuntime'
import {
  createProviderModelRuntime,
  createProviderRequestPlugin,
  createProviderResponseProvider,
  resolveProviderModels,
  type ChatProviderConfig,
} from './provider'
import { createRunConfigContextPlugin } from './plugins/runConfigContextPlugin'
import { createMcpToolPlugin, type ChatToolCallTool, type ChatToolListTools } from './plugins/mcpToolPlugin'
import { createDefaultMcpAdapter } from './mcp/createDefaultMcpAdapter'
import type { ChatMcpServers } from './mcp/types'
import { createDefaultChatTitle } from './defaults'

export interface UseLocalChatRuntimeMcpAdapter {
  runtime: ChatMcpRuntime
  listTools: ChatToolListTools
  callTool: ChatToolCallTool
}

export interface UseLocalChatRuntimeOptions {
  conversation?: Omit<UseConversationOptions, 'useMessageOptions'> & {
    useMessageOptions?: Partial<UseConversationOptions['useMessageOptions']>
  }
  titleGenerator?: (text: string) => string
  composer?: Pick<ChatComposerRuntime, 'disabled' | 'submitDisabled'>
  modelProviders?: readonly ChatProviderConfig[]
  mcp?: UseLocalChatRuntimeMcpAdapter
  mcpServers?: ChatMcpServers
}

export function useLocalChatRuntime(options: UseLocalChatRuntimeOptions) {
  const conversationOptions: NonNullable<UseLocalChatRuntimeOptions['conversation']> = options.conversation ?? {}
  const resolveTitle = options.titleGenerator ?? createDefaultChatTitle
  const userUseMessageOptions = conversationOptions.useMessageOptions
  const userResponseProvider = userUseMessageOptions?.responseProvider

  if (options.mcp !== undefined && options.mcpServers !== undefined) {
    throw new Error('useLocalChatRuntime: mcp and mcpServers cannot be configured at the same time.')
  }

  if (options.modelProviders?.length && userResponseProvider) {
    throw new Error('useLocalChatRuntime: modelProviders and responseProvider cannot be configured at the same time.')
  }

  const providerModels = options.modelProviders ? resolveProviderModels(options.modelProviders) : []
  const providerRuntime = providerModels.length > 0 ? createProviderModelRuntime(providerModels) : null
  const resolvedMcp = options.mcpServers !== undefined ? createDefaultMcpAdapter(options.mcpServers) : options.mcp
  const composerOptions = options.composer ?? {}
  const builtInPlugins: UseMessagePlugin[] = [createRunConfigContextPlugin()]

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
    throw new Error('useLocalChatRuntime requires conversation.useMessageOptions.responseProvider or modelProviders.')
  }

  const conversation = useConversation({
    autoSaveMessages: true,
    ...conversationOptions,
    useMessageOptions: useMessageOptions as UseConversationOptions['useMessageOptions'],
  })

  return useKitChatRuntime({
    conversation,
    titleGenerator: resolveTitle,
    composer: {
      ...composerOptions,
      model: providerRuntime?.model,
      mcp: resolvedMcp?.runtime,
    },
  })
}
