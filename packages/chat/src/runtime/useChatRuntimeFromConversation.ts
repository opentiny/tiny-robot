import { computed, shallowRef, watch } from 'vue'
import type { UseConversationReturn } from '@opentiny/tiny-robot-kit'
import type {
  ChatConversation,
  ChatConversationInfo,
  ChatBeforeSend,
  ChatBeforeSendContext,
  ChatRunConfig,
  ChatRuntime,
  ChatSendPayload,
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

export interface KitRuntimeSendPayload extends ChatSendPayload {
  readonly conversationId: string | null
  runConfig?: ChatRunConfig
}

export interface UseChatRuntimeFromConversationOptions {
  conversation: UseConversationReturn
  titleGenerator?: TitleGenerator
  beforeSend?: ChatBeforeSend
  send?: (payload: KitRuntimeSendPayload) => boolean | void | Promise<boolean | void>
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

export function useChatRuntimeFromConversation(options: UseChatRuntimeFromConversationOptions): ChatRuntime {
  const { conversation, titleGenerator, beforeSend, send, composer: composerOptions } = options
  const conversationNavigationRevision = shallowRef(0)
  const creatingConversationForSend = shallowRef(false)
  const customSendConversationSnapshots = new Set<Set<string>>()
  const occupiedTargets = shallowRef(new Set<string>())
  let previousConversationId = conversation.activeConversationId.value
  watch(
    conversation.activeConversationId,
    (id) => {
      if (id !== previousConversationId) {
        const isCreatedConversation = conversation.conversations.value.some((item) => item.id === id)
        const creationSnapshot =
          id === null
            ? undefined
            : [...customSendConversationSnapshots].find((snapshot) => !snapshot.has(id) && isCreatedConversation)
        const createdForCustomSend = previousConversationId === null && id !== null && Boolean(creationSnapshot)
        previousConversationId = id
        if (createdForCustomSend && creationSnapshot) customSendConversationSnapshots.delete(creationSnapshot)
        else if (!creatingConversationForSend.value) conversationNavigationRevision.value++
      }
    },
    { flush: 'sync' },
  )
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
    }
  })

  const sourceComposer = composerOptions ?? {}
  const getTargetKey = (id: string | null) => (id === null ? 'empty' : `conversation:${id}`)
  const submitDisabled = computed(() => {
    const model = sourceComposer.model
    const selectedModel = model?.options.value.find((item) => item.id === model.selectedId.value)
    const noUsableModel = Boolean(model && (!selectedModel || selectedModel.disabled))
    const active = activeKitConversation.value
    const targetKey = getTargetKey(active?.id ?? null)

    return (
      Boolean(sourceComposer.submitDisabled?.value) ||
      occupiedTargets.value.has(targetKey) ||
      (!send &&
        (!areEnabledMcpToolsReady(sourceComposer.mcp) ||
          noUsableModel ||
          Boolean(active && !active.engine.canStartTurn.value)))
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
      ...(payload.externalPayloads ? { externalPayloads: payload.externalPayloads } : {}),
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
    let targetConversation = conversation.activeConversation.value
    const targetConversationId = targetConversation?.id ?? null
    const targetEngine = targetConversation?.engine
    const navigationRevision = conversationNavigationRevision.value
    const targetKey = getTargetKey(targetConversationId)
    if (occupiedTargets.value.has(targetKey)) return false
    occupiedTargets.value = new Set(occupiedTargets.value).add(targetKey)
    const eligible = () => {
      const model = composer.model
      const selectedModel = model?.options.value.find((item) => item.id === model.selectedId.value)
      return (
        !composer.disabled?.value &&
        !sourceComposer.submitDisabled?.value &&
        (Boolean(send) ||
          (areEnabledMcpToolsReady(composer.mcp) &&
            (!model || Boolean(selectedModel && !selectedModel.disabled)) &&
            (!targetEngine || targetEngine.canStartTurn.value)))
      )
    }
    try {
      if ((!text && !send) || !eligible()) {
        return false
      }

      if (
        (conversation.activeConversation.value?.id ?? null) !== targetConversationId ||
        conversationNavigationRevision.value !== navigationRevision ||
        conversation.activeConversation.value?.engine !== targetEngine
      ) {
        return false
      }

      const effectivePayload = {
        ...payload,
        text,
        conversationId: targetConversationId,
        runConfig: cloneRunConfig(resolveComposerRunConfig(composer)),
      }

      const beforeSendResult = beforeSend
        ? await beforeSend(createBeforeSendContext({ ...payload, text }, effectivePayload.runConfig))
        : undefined

      if (beforeSendResult === 'reject') {
        return false
      }

      if (beforeSendResult === 'handled') {
        return true
      }

      if (
        (conversation.activeConversation.value?.id ?? null) !== targetConversationId ||
        conversationNavigationRevision.value !== navigationRevision ||
        conversation.activeConversation.value?.engine !== targetEngine ||
        !eligible()
      ) {
        return false
      }

      if (send) {
        const customSendSnapshot =
          targetConversationId === null ? new Set(conversation.conversations.value.map((item) => item.id)) : undefined
        if (customSendSnapshot) customSendConversationSnapshots.add(customSendSnapshot)
        try {
          const result = await send(effectivePayload)
          return result !== false
        } finally {
          if (customSendSnapshot) customSendConversationSnapshots.delete(customSendSnapshot)
        }
      }
      if (targetConversationId === null) {
        creatingConversationForSend.value = true
        let created: KitConversation
        try {
          created = conversation.createConversation({ title: resolveTitle(text) })
        } finally {
          creatingConversationForSend.value = false
        }
        targetConversation = created ?? conversation.activeConversation.value
        if (targetConversation) {
          occupiedTargets.value = new Set(occupiedTargets.value).add(getTargetKey(targetConversation.id))
        }
      }
      if (!targetConversation) return false
      await sendDefaultMessage(effectivePayload, targetConversation)
      return true
    } finally {
      const next = new Set(occupiedTargets.value)
      next.delete(targetKey)
      if (targetConversationId === null && targetConversation) next.delete(getTargetKey(targetConversation.id))
      occupiedTargets.value = next
    }
  }

  return {
    conversations,
    activeConversation,
    conversationNavigationRevision,
    composer,
    actions: {
      clearActiveConversation: () => {
        if (conversation.activeConversationId.value === null) return
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
      },
    },
  }
}
