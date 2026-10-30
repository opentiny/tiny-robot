import type { CreateChatRuntimeOptions } from '@opentiny/tiny-robot-chat/experimental'
import { createMockConversationStorage } from './mockConversationStorage'
import { mockResponseProvider } from './modelProviders'

export function createDemoRuntimeOptions(overrides: Partial<CreateChatRuntimeOptions> = {}): CreateChatRuntimeOptions {
  return {
    storage: createMockConversationStorage(),
    responseProvider: mockResponseProvider,
    ...overrides,
  }
}
