import { localStorageStrategyFactory } from '@opentiny/tiny-robot-kit'
import { ref } from 'vue'
import { createChatRuntimeLifecycle, type UseChatRuntimeOptions } from '../../runtime/useChatRuntime'
import { acquireDefaultStorageOwner } from './ownedRuntimeRegistry'
import type { CreateChatRuntimeOptions, CreateChatRuntimeResult } from './types'

export const DEFAULT_CHAT_STORAGE_KEY = 'tiny-robot-ai-conversations'

export function createChatRuntime(options: CreateChatRuntimeOptions): CreateChatRuntimeResult {
  const storageKey = options.storageKey ?? DEFAULT_CHAT_STORAGE_KEY
  const usesDefaultStorageKey = options.storage === undefined && storageKey === DEFAULT_CHAT_STORAGE_KEY
  const storage = options.storage ?? (options.storageKey ? localStorageStrategyFactory({ key: storageKey }) : undefined)
  const conversation: NonNullable<UseChatRuntimeOptions['conversation']> = {
    ...(storage ? { storage } : {}),
    ...(options.autoSaveMessages === undefined ? {} : { autoSaveMessages: options.autoSaveMessages }),
    ...(options.autoSaveThrottle === undefined ? {} : { autoSaveThrottle: options.autoSaveThrottle }),
    ...(options.onLoad ? { onLoad: (items) => options.onLoad?.(items) } : {}),
    useMessageOptions: {
      ...(options.responseProvider ? { responseProvider: options.responseProvider } : {}),
      ...(options.initialMessages ? { initialMessages: [...options.initialMessages] } : {}),
      ...(options.plugins ? { plugins: [...options.plugins] } : {}),
    },
  }
  const lifecycle = createChatRuntimeLifecycle({
    conversation,
    titleGenerator: options.titleGenerator,
    beforeSend: options.beforeSend,
    transformSendPayload: options.transformSendPayload,
    composer: options.composer
      ? {
          disabled: options.composer.disabled === undefined ? undefined : ref(options.composer.disabled),
          submitDisabled:
            options.composer.submitDisabled === undefined ? undefined : ref(options.composer.submitDisabled),
        }
      : undefined,
    modelProviders: options.modelProviders,
    mcp: options.mcp,
    mcpServers: options.mcpServers,
  })
  const releaseOwner = usesDefaultStorageKey ? acquireDefaultStorageOwner() : () => undefined
  let disposePromise: Promise<void> | undefined

  return {
    runtime: lifecycle.runtime,
    dispose() {
      if (!disposePromise) {
        disposePromise = lifecycle.dispose().finally(releaseOwner)
      }
      return disposePromise
    },
  }
}

export type { CreateChatRuntimeComposerOptions, CreateChatRuntimeOptions, CreateChatRuntimeResult } from './types'
