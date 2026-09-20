import { computed, shallowRef, watchEffect } from 'vue'
import type { UseConversationReturn } from '@opentiny/tiny-robot-kit'
import type {
  ChatConversation,
  ChatConversationInfo,
  ChatBeforeSend,
  ChatBeforeSendContext,
  ChatRunConfig,
  ChatRuntime,
  ChatSendPayload,
  ChatWritable,
} from '../types'
import {
  areEnabledMcpToolsReady,
  CHAT_RUN_CONFIG_METADATA_KEY,
  cloneRunConfig,
  resolveComposerRunConfig,
} from './runConfig'
import { createDefaultChatTitle, resolveChatConversationTitle } from './defaults'

type TitleGenerator = (text: string) => string
type KitConversationInfo = UseConversationReturn['conversations']['value'][number]
type KitConversation = NonNullable<UseConversationReturn['activeConversation']['value']>
type UseKitChatComposerOptions = ChatRuntime['composer']

interface KitRuntimeSendPayload extends ChatSendPayload {
  readonly conversationId: string | null
  runConfig?: ChatRunConfig
}

export interface UseKitChatRuntimeOptions {
  conversation: UseConversationReturn
  lastError?: ChatWritable<unknown | null>
  titleGenerator?: TitleGenerator
  beforeSend?: ChatBeforeSend
  send?: (payload: KitRuntimeSendPayload) => Promise<void> | void
  composer?: UseKitChatComposerOptions
}
const toChatConversationInfo = (item: KitConversationInfo): ChatConversationInfo => {
  return {
    id: item.id,
    title: resolveChatConversationTitle(item.title),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    metadata: item.metadata,
  }
}

export function useKitChatRuntime(options: UseKitChatRuntimeOptions): ChatRuntime {
  const { conversation, lastError: errorRef, titleGenerator, beforeSend, send, composer: composerOptions } = options
  const conversationErrors = shallowRef<Record<string, unknown | null>>({})
  const resolveTitle = titleGenerator ?? createDefaultChatTitle

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
  const submitDisabled = computed(() => {
    const model = sourceComposer.model
    const selectedModel = model?.options.value.find((item) => item.id === model.selectedId.value)
    const noUsableModel = !send && Boolean(model && (!selectedModel || selectedModel.disabled))
    const active = activeKitConversation.value

    return (
      Boolean(sourceComposer.submitDisabled?.value) ||
      !areEnabledMcpToolsReady(sourceComposer.mcp) ||
      noUsableModel ||
      Boolean(!send && active && !active.engine.canStartTurn.value)
    )
  })
  const composer: ChatRuntime['composer'] = {
    ...sourceComposer,
    submitDisabled,
  }

  function createBeforeSendContext(payload: ChatSendPayload, runConfig?: ChatRunConfig): ChatBeforeSendContext {
    const model = composer.model
    const selectedModel = model?.options.value.find((item) => item.id === model.selectedId.value)
    const mcp = composer.mcp

    return {
      payload: { ...payload },
      runConfig: cloneRunConfig(runConfig),
      model: selectedModel ? { ...selectedModel } : undefined,
      mcp: mcp
        ? {
            servers: mcp.servers.value.map((server) => ({ ...server })),
            tools: Object.fromEntries(
              Object.entries(mcp.tools.value).map(([serverId, tools]) => [
                serverId,
                tools?.map((tool) => ({ ...tool })),
              ]),
            ),
          }
        : undefined,
    }
  }

  async function sendDefaultMessage(payload: KitRuntimeSendPayload, targetConversation: KitConversation) {
    const nextText = payload.text.trim()

    if (!nextText) {
      return null
    }

    if (!targetConversation.title) {
      conversation.updateConversationTitle(targetConversation.id, resolveTitle(nextText))
    }

    const now = Math.floor(Date.now() / 1000)

    await targetConversation.engine.send({
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

    return targetConversation
  }

  async function handleSend(payload: ChatSendPayload): Promise<boolean> {
    const text = payload.text.trim()

    if ((!text && !send) || composer.disabled?.value || composer.submitDisabled?.value) {
      return false
    }

    let targetConversation = conversation.activeConversation.value
    const targetConversationId = targetConversation?.id ?? null
    let errorConversationId = targetConversationId

    const effectivePayload = {
      ...payload,
      text,
      conversationId: targetConversationId,
      runConfig: cloneRunConfig(resolveComposerRunConfig(composer)),
    }

    try {
      const beforeSendResult = await beforeSend?.(
        createBeforeSendContext({ ...payload, text }, effectivePayload.runConfig),
      )

      if (beforeSendResult === 'reject') {
        return false
      }

      if (beforeSendResult === 'handled') {
        return true
      }

      if ((conversation.activeConversation.value?.id ?? null) !== targetConversationId) {
        return false
      }

      if (!send && targetConversation && !targetConversation.engine.canStartTurn.value) {
        return false
      }

      if (!send && !targetConversation) {
        targetConversation = conversation.createConversation({ title: resolveTitle(text) })
        errorConversationId = targetConversation.id
      }

      if (errorConversationId) {
        conversationErrors.value = {
          ...conversationErrors.value,
          [errorConversationId]: null,
        }
      }

      const task = send
        ? Promise.resolve(send(effectivePayload))
        : Promise.resolve(sendDefaultMessage(effectivePayload, targetConversation!))
      await task
      return true
    } catch (error) {
      if (errorConversationId) {
        conversationErrors.value = {
          ...conversationErrors.value,
          [errorConversationId]: error,
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
      clearActiveConversation: () => {
        conversation.activeConversationId.value = null
      },
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
