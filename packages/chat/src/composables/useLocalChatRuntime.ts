import { useConversation, type UseConversationOptions, type UseMessagePlugin } from '@opentiny/tiny-robot-kit'
import type { ChatMcpRuntime } from '../types'
import { useKitChatRuntime, type UseKitChatRuntimeOptions } from './useKitChatRuntime'
import {
  createProviderModelRuntime,
  createProviderRequestPlugin,
  createProviderResponseProvider,
  resolveProviderModels,
  type ChatProviderConfig,
} from '../provider'
import { createRunConfigPlugin } from '../plugins/runConfigPlugin'
import { createToolCallPlugin, type ChatToolCallTool, type ChatToolListTools } from '../plugins/toolCallPlugin'

export interface UseLocalChatRuntimeMcpAdapter {
  runtime: ChatMcpRuntime
  listTools: ChatToolListTools
  callTool: ChatToolCallTool
}

export interface UseLocalChatRuntimeOptions {
  conversation: Omit<UseConversationOptions, 'useMessageOptions'> & {
    useMessageOptions?: Partial<UseConversationOptions['useMessageOptions']>
  }
  titleFallback?: (text: string) => string
  composer?: Omit<NonNullable<UseKitChatRuntimeOptions['composer']>, 'mcp'>
  mcp?: UseLocalChatRuntimeMcpAdapter
  providers?: readonly ChatProviderConfig[]
}

const defaultTitleFallback = (text: string) => text.trim().slice(0, 20) || '新对话'

export function useLocalChatRuntime(options: UseLocalChatRuntimeOptions) {
  const resolveTitle = options.titleFallback ?? defaultTitleFallback
  const providerModels = options.providers ? resolveProviderModels(options.providers) : []
  const providerRuntime = providerModels.length > 0 ? createProviderModelRuntime(providerModels) : null
  const userUseMessageOptions = options.conversation.useMessageOptions
  const composerOptions = options.composer ?? {}
  const builtInPlugins: UseMessagePlugin[] = []

  if (providerRuntime || options.mcp) {
    builtInPlugins.push(createRunConfigPlugin())
  }

  if (providerRuntime) {
    builtInPlugins.push(createProviderRequestPlugin(providerRuntime.resolveModel))
  }

  if (options.mcp) {
    builtInPlugins.push(createToolCallPlugin(options.mcp.listTools, options.mcp.callTool))
  }

  const useMessageOptions = {
    ...userUseMessageOptions,
    plugins: [...builtInPlugins, ...(userUseMessageOptions?.plugins ?? [])],
    responseProvider:
      userUseMessageOptions?.responseProvider ??
      (providerRuntime ? createProviderResponseProvider(providerRuntime.resolveModel) : undefined),
  }

  if (!useMessageOptions.responseProvider) {
    throw new Error('useLocalChatRuntime requires conversation.useMessageOptions.responseProvider or providers.')
  }

  const conversation = useConversation({
    autoSaveMessages: true,
    ...options.conversation,
    useMessageOptions: useMessageOptions as UseConversationOptions['useMessageOptions'],
  })

  return useKitChatRuntime({
    conversation,
    titleFallback: resolveTitle,
    composer: {
      ...composerOptions,
      model: composerOptions.model ?? providerRuntime?.model,
      mcp: options.mcp?.runtime,
    },
  })
}
