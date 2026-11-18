import { computed, shallowRef, watch } from 'vue'
import { isAutoContinuationMessage } from '@opentiny/tiny-robot-kit'
import { CHAT_ACTION_METADATA_KEY, getMessageActionId } from './messageActionIdentity'
import type { UseConversationReturn } from '@opentiny/tiny-robot-kit'
import type {
  ChatConversation,
  ChatConversationInfo,
  ChatMessageItem,
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
  readRunConfigFromMessage,
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

export { CHAT_ACTION_METADATA_KEY } from './messageActionIdentity'
function generateActionId() {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
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

  const bubbleActionViews = computed(() => {
    const active = activeConversation.value
    if (!active) return undefined
    const messages = active.messages
    let latestUserIndex = -1
    messages.forEach((message, index) => {
      if (message.role === 'user' && !isAutoContinuationMessage(message)) latestUserIndex = index
    })
    const result: Record<
      string,
      { canEdit: boolean; canRegenerate: boolean; turnState: ChatConversation['requestState'] | 'unknown' }
    > = {}
    const usersById = new Map<string, number>()
    const assistantsByUserId = new Map<string, number[]>()
    messages.forEach((message, index) => {
      const metadata = message.metadata?.[CHAT_ACTION_METADATA_KEY] as
        { id?: string; userMessageId?: string } | undefined
      if (message.role === 'user') {
        const id = getMessageActionId(message)
        if (id) usersById.set(id, index)
      } else if (message.role === 'assistant' && metadata?.userMessageId) {
        const indexes = assistantsByUserId.get(metadata.userMessageId) ?? []
        indexes.push(index)
        assistantsByUserId.set(metadata.userMessageId, indexes)
      }
    })
    for (const [index, message] of messages.entries()) {
      const metadata = message.metadata?.[CHAT_ACTION_METADATA_KEY] as
        { id?: string; userMessageId?: string; turnState?: ChatConversation['requestState'] } | undefined
      const id = getMessageActionId(message)
      if (typeof id !== 'string') continue
      const userMessageId = message.role === 'user' ? id : metadata?.userMessageId
      const linkedUserIndex = userMessageId ? (usersById.get(userMessageId) ?? -1) : -1
      const linkedAssistantIndex = userMessageId
        ? assistantsByUserId.get(userMessageId)?.find((assistantIndex) => assistantIndex > linkedUserIndex)
        : undefined
      const linkedAssistant = linkedAssistantIndex === undefined ? undefined : messages[linkedAssistantIndex]
      const linkedAssistantMetadata = linkedAssistant?.metadata?.[CHAT_ACTION_METADATA_KEY] as
        { turnState?: ChatConversation['requestState'] } | undefined
      const plainText = typeof messages[linkedUserIndex]?.content === 'string'
      const attachments = (messages[linkedUserIndex] as { externalPayloads?: unknown } | undefined)?.externalPayloads
      const hasAttachments = Array.isArray(attachments) ? attachments.length > 0 : Boolean(attachments)
      const turnEnd = messages.findIndex(
        (item, i) => i > linkedUserIndex && item.role === 'user' && !isAutoContinuationMessage(item),
      )
      const turnMessages = messages.slice(linkedUserIndex + 1, turnEnd < 0 ? undefined : turnEnd)
      const hasTools = turnMessages.some((item) => item.role === 'tool' || Boolean(item.tool_calls?.length))
      const state = metadata?.turnState ?? linkedAssistantMetadata?.turnState ?? 'unknown'
      const canReplay = Boolean(
        userMessageId &&
        !isSendingDisabled() &&
        linkedUserIndex === latestUserIndex &&
        plainText &&
        !hasAttachments &&
        !hasTools &&
        state !== 'processing' &&
        active.requestState !== 'processing' &&
        active.requestState !== 'paused' &&
        active.requestState !== 'idle' &&
        canReplayRunConfig(messages[linkedUserIndex]),
      )
      if (message.role === 'assistant' && linkedAssistant !== message) continue
      result[id] = {
        canEdit: message.role === 'user' && index === latestUserIndex && canReplay,
        canRegenerate:
          (message.role === 'assistant' && linkedAssistant === message && canReplay) ||
          (message.role === 'user' && index === latestUserIndex && Boolean(linkedAssistant) && canReplay),
        turnState: state,
      }
    }
    return result
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

  function isSendingDisabled() {
    return Boolean(sourceComposer.disabled?.value || sourceComposer.submitDisabled?.value)
  }

  function createBeforeSendContext(payload: ChatSendPayload, runConfig?: ChatRunConfig): ChatBeforeSendContext {
    const model = composer.model
    const selectedModel = model?.options.value.find(
      (item) => item.id === (runConfig?.modelId ?? model.selectedId.value),
    )
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

    if (!nextText && !payload.externalPayloads?.length) {
      return null
    }

    if (!targetConversation.title) {
      conversation.updateConversationTitle(targetConversation.id, resolveTitle(nextText))
    }

    const now = Math.floor(Date.now() / 1000)

    const messageId = generateActionId()
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
        [CHAT_ACTION_METADATA_KEY]: { id: messageId, turnState: 'processing' },
      },
    })

    return targetConversation
  }

  function getMessageCapabilities(target: { conversationId: string; userMessageId: string }) {
    const active = activeConversation.value
    if (!active || active.id !== target.conversationId)
      return { canEdit: false, canRegenerate: false, turnState: 'unknown' as const }
    const record = bubbleActionViews.value?.[target.userMessageId]
    return record ?? { canEdit: false, canRegenerate: false, turnState: 'unknown' as const }
  }

  async function rerunMessage(target: { conversationId: string; userMessageId: string; text?: string }) {
    const active = activeConversation.value
    if (!active || active.id !== target.conversationId) return false
    const targetEngine = activeKitConversation.value?.engine
    const navigationRevision = conversationNavigationRevision.value
    const capabilities = getMessageCapabilities(target)
    if (target.text === undefined ? !capabilities.canRegenerate : !capabilities.canEdit) return false
    const targetMessage = active.messages.find((message) => getMessageActionId(message) === target.userMessageId)
    if (!targetMessage) return false
    const targetMetadata = targetMessage?.metadata?.[CHAT_ACTION_METADATA_KEY] as { userMessageId?: string } | undefined
    const userMessage =
      targetMessage?.role === 'user'
        ? targetMessage
        : active.messages.find((message) => {
            return (
              message.role === 'user' &&
              Boolean(targetMetadata?.userMessageId) &&
              getMessageActionId(message) === targetMetadata?.userMessageId
            )
          })
    if (!userMessage || typeof userMessage.content !== 'string') return false
    const originalSuffix = active.messages.slice(active.messages.indexOf(userMessage) + 1)
    const suffixSnapshot = JSON.stringify(originalSuffix)
    const originalText = userMessage.content
    const text = (target.text ?? originalText).trim()
    if (!text) return false
    const runConfig = readRunConfigFromMessage(userMessage)
    const rerunTarget = userMessage as unknown as Parameters<UseConversationReturn['rerunMessage']>[1]
    const key = getTargetKey(target.conversationId)
    if (occupiedTargets.value.has(key)) return false
    occupiedTargets.value = new Set(occupiedTargets.value).add(key)
    try {
      const eligible = () => {
        const capability = getMessageCapabilities(target)
        return (
          !isSendingDisabled() &&
          Boolean(targetEngine?.canStartTurn.value) &&
          (target.text === undefined ? capability.canRegenerate : capability.canEdit)
        )
      }
      if (!eligible()) return false
      const beforeSendResult = beforeSend ? await beforeSend(createBeforeSendContext({ text }, runConfig)) : undefined
      if (beforeSendResult === 'reject') return false
      if (beforeSendResult === 'handled') return true
      if (
        conversation.activeConversation.value?.id !== target.conversationId ||
        conversationNavigationRevision.value !== navigationRevision ||
        conversation.activeConversation.value?.engine !== targetEngine ||
        !targetEngine?.messages.value.includes(rerunTarget) ||
        userMessage.content !== originalText ||
        !originalSuffix.every(
          (message, index) =>
            targetEngine.messages.value[targetEngine.messages.value.indexOf(rerunTarget) + 1 + index] === message,
        ) ||
        JSON.stringify(targetEngine.messages.value.slice(targetEngine.messages.value.indexOf(rerunTarget) + 1)) !==
          suffixSnapshot ||
        JSON.stringify(readRunConfigFromMessage(userMessage)) !== JSON.stringify(runConfig) ||
        !eligible()
      )
        return false
      const replacement =
        target.text === undefined
          ? undefined
          : ({
              ...userMessage,
              content: text,
              role: 'user' as const,
              metadata: {
                ...userMessage.metadata,
                updatedAt: Math.floor(Date.now() / 1000),
                [CHAT_ACTION_METADATA_KEY]: { id: getMessageActionId(userMessage), turnState: 'processing' },
              },
            } as unknown as Parameters<UseConversationReturn['rerunMessage']>[2])
      return await conversation.rerunMessage(target.conversationId, rerunTarget, replacement)
    } finally {
      const next = new Set(occupiedTargets.value)
      next.delete(key)
      occupiedTargets.value = next
    }
  }

  function canReplayRunConfig(message?: ChatMessageItem) {
    const config = readRunConfigFromMessage(message)
    if (!config?.modelId) return false
    const model = composer.model?.options.value.find((item) => item.id === config.modelId)
    if (composer.model && (!model || model.disabled)) return false
    return !Object.values(config.mcp?.toolIds ?? {}).some((ids) => ids.length > 0)
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
        !isSendingDisabled() &&
        (Boolean(send) ||
          (areEnabledMcpToolsReady(composer.mcp) &&
            (!model || Boolean(selectedModel && !selectedModel.disabled)) &&
            (!targetEngine || targetEngine.canStartTurn.value)))
      )
    }
    try {
      if ((!text && !payload.externalPayloads?.length && !send) || !eligible()) {
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
      getMessageCapabilities,
      editMessage: ({ conversationId, userMessageId, text }) => rerunMessage({ conversationId, userMessageId, text }),
      regenerateMessage: ({ conversationId, userMessageId }) => rerunMessage({ conversationId, userMessageId }),
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
