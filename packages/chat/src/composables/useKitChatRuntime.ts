import { computed, shallowRef, watchEffect } from 'vue'
import type { UseConversationReturn } from '@opentiny/tiny-robot-kit'
import type {
  ChatConversation,
  ChatConversationInfo,
  ChatRunConfig,
  ChatRuntime,
  ChatSubmitPayload,
  ChatWritable,
} from '../types'
import {
  areEnabledMcpToolsReady,
  CHAT_RUN_CONFIG_METADATA_KEY,
  cloneRunConfig,
  resolveComposerRunConfig,
} from '../utils/runConfig'

type TitleFallback = (text: string) => string
type KitConversationInfo = UseConversationReturn['conversations']['value'][number]
type UseKitChatComposerOptions = ChatRuntime['composer']

interface KitRuntimeSendPayload extends ChatSubmitPayload {
  runConfig?: ChatRunConfig
}

export interface UseKitChatRuntimeOptions {
  conversation: UseConversationReturn
  lastError?: ChatWritable<unknown | null>
  titleFallback?: TitleFallback
  send?: (payload: KitRuntimeSendPayload) => Promise<void> | void
  composer?: UseKitChatComposerOptions
}
const defaultTitleFallback = (text: string) => text.trim().slice(0, 20) || '新对话'

const toChatConversationInfo = (item: KitConversationInfo): ChatConversationInfo => {
  return {
    id: item.id,
    title: item.title || '新对话',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    metadata: item.metadata,
  }
}

export function useKitChatRuntime(options: UseKitChatRuntimeOptions): ChatRuntime {
  const { conversation, lastError: errorRef, titleFallback, send, composer: composerOptions } = options
  const conversationErrors = shallowRef<Record<string, unknown | null>>({})
  const resolveTitle = titleFallback ?? defaultTitleFallback

  const activeKitConversation = computed(() => conversation.activeConversation.value)
  const conversations = computed(() => conversation.conversations.value.map(toChatConversationInfo))

  const activeConversation = computed<ChatConversation | null>(() => {
    const active = activeKitConversation.value

    if (!active) {
      return null
    }

    return {
      ...toChatConversationInfo(active),
      messages: active.engine.messages.value,
      requestState: active.engine.requestState.value,
      processingState: active.engine.processingState.value,
      lastError: conversationErrors.value[active.id] ?? null,
    }
  })

  if (errorRef) {
    watchEffect(() => {
      errorRef.value = activeConversation.value?.lastError ?? null
    })
  }

  const sourceComposer = composerOptions ?? {}
  const submitDisabled = computed(
    () => Boolean(sourceComposer.submitDisabled?.value) || !areEnabledMcpToolsReady(sourceComposer.mcp),
  )
  const composer: ChatRuntime['composer'] = {
    ...sourceComposer,
    submitDisabled,
  }

  const sendMessage =
    send ??
    (async (payload: KitRuntimeSendPayload) => {
      const nextText = payload.text.trim()

      if (!nextText) {
        return
      }

      let active = activeKitConversation.value

      if (!active) {
        active = conversation.createConversation({ title: resolveTitle(nextText) })
      } else if (!active.title) {
        conversation.updateConversationTitle(active.id, resolveTitle(nextText))
      }

      const now = Math.floor(Date.now() / 1000)

      await active.engine.send({
        role: 'user',
        content: nextText,
        metadata: {
          createdAt: now,
          updatedAt: now,
          ...(payload.runConfig
            ? {
                [CHAT_RUN_CONFIG_METADATA_KEY]: cloneRunConfig(payload.runConfig),
              }
            : {}),
        },
      })
    })

  async function handleSend(payload: ChatSubmitPayload): Promise<boolean> {
    const text = payload.text.trim()

    if (!text || composer.disabled?.value || composer.submitDisabled?.value) {
      return false
    }

    let conversationId = conversation.activeConversation.value?.id ?? null

    const effectivePayload = {
      ...payload,
      text,
      runConfig: cloneRunConfig(resolveComposerRunConfig(composer)),
    }

    try {
      const task = Promise.resolve(sendMessage(effectivePayload))
      conversationId = conversation.activeConversation.value?.id ?? conversationId

      if (conversationId) {
        conversationErrors.value = {
          ...conversationErrors.value,
          [conversationId]: null,
        }
      }
      await task
      return true
    } catch (error) {
      if (conversationId) {
        conversationErrors.value = {
          ...conversationErrors.value,
          [conversationId]: error,
        }
      }

      throw error
    }
  }

  return {
    conversations,
    activeConversation,
    composer,
    actions: {
      send: handleSend,
      abort: async () => {
        await conversation.abortActiveRequest()
      },
      createConversation: (payload) => {
        conversation.createConversation(payload)
      },
      switchConversation: async (id) => {
        await conversation.switchConversation(id)
      },
      renameConversation: (id, title) => {
        conversation.updateConversationTitle(id, title)
      },
      deleteConversation: async (id) => {
        await conversation.deleteConversation(id)

        const { [id]: _removedConversationError, ...restConversationErrors } = conversationErrors.value
        conversationErrors.value = restConversationErrors
      },
    },
  }
}
