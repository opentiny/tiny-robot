import { createChatRuntime } from '@opentiny/tiny-robot-chat'
import { localStorageStrategyFactory } from '@opentiny/tiny-robot-kit'
import type { ChatAppConfig } from './config'

export function createAppRuntime(config: ChatAppConfig) {
  return createChatRuntime({
    modelProviders: config.modelProviders,
    mcpServers: config.mcpServers,
    conversation: { storage: localStorageStrategyFactory({ key: 'tiny-robot-ai-conversations' }) },
  })
}
