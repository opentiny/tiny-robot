import { computed } from 'vue'
import type { ChatMessage } from '@opentiny/tiny-robot-kit'
import { getChatMessageError } from '@/runtime/engine/chatMessageState'
import type { UseChatAttachmentsReturn } from '@/components/attachments/useChatAttachments'
import type {
  ChatAttachmentsFeaturePreset,
  ChatMessagesOverrides,
  ReadonlyRef,
  ChatConversationSummary,
  ChatUIMessage,
  ChatRuntime,
  ChatWorkspaceRegionRuntime,
  TrChatRootUiConfig,
  ChatWorkspaceRegionConfig,
  ChatWorkspaceShellConfig,
} from '@/types'
import type { UseChatKitReturn } from '@/types/core'
import type { ChatPageInputsValue } from '@/shared/context'
import { extractMessageText, getMessageEditingState } from '@/runtime/core/normalizeRuntime'

function toLegacyChatMessage(message: ChatUIMessage): ChatMessage {
  if (message.raw && typeof message.raw === 'object') {
    return message.raw as ChatMessage
  }

  return {
    role: message.role || 'assistant',
    content: extractMessageText(message),
  } as ChatMessage
}

function createAttachmentsManager(runtime: ChatRuntime): UseChatAttachmentsReturn | undefined {
  if (!runtime.attachments) {
    return undefined
  }

  return {
    items: runtime.sender.pendingAttachments,
    addFiles(files) {
      const prepared = runtime.attachments?.prepareFiles(files) ?? []
      runtime.sender.addPendingAttachments(prepared)
    },
    setItems(items) {
      runtime.sender.setPendingAttachments(items)
    },
    removeItem(item) {
      runtime.sender.removePendingAttachment(item)
    },
    clear() {
      runtime.sender.clearPendingAttachments()
    },
  }
}

function createConversationSummary(conversation: unknown): ChatConversationSummary | null {
  if (!conversation || typeof conversation !== 'object') {
    return null
  }

  const candidate = conversation as { id?: unknown; title?: unknown }
  if (typeof candidate.id !== 'string') {
    return null
  }

  return {
    id: candidate.id,
    title: typeof candidate.title === 'string' ? candidate.title : undefined,
  }
}

function createShellRegionConfig(
  region: ChatWorkspaceRegionRuntime | undefined,
  fallback: ChatWorkspaceRegionConfig | undefined,
): ChatWorkspaceRegionConfig | undefined {
  const enabled = region?.enabled.value ?? fallback?.enabled

  if (enabled === false) {
    return {
      enabled: false,
    }
  }

  if (!region && !fallback) {
    return undefined
  }

  return {
    enabled: enabled ?? true,
    collapsible: region?.collapsible.value ?? fallback?.collapsible,
    defaultOpen: region ? region.visible.value && !region.collapsed.value : fallback?.defaultOpen,
    collapseMode: region?.collapseMode.value ?? fallback?.collapseMode,
    width: region?.width.value ?? fallback?.width,
    railLabel: region?.railLabel.value ?? fallback?.railLabel,
  }
}

function createWorkspaceShellConfig(runtime: ChatRuntime): ChatWorkspaceShellConfig | undefined {
  if (!runtime.workspace) {
    return undefined
  }

  return {
    variant: runtime.workspace.variant.value,
    leftRegion: createShellRegionConfig(runtime.workspace.left, {
      enabled: Boolean(runtime.history),
      collapseMode: 'rail',
    }),
    rightRegion: createShellRegionConfig(runtime.workspace.right, undefined),
  }
}

function createFallbackChatKit(runtimeRef: ReadonlyRef<ChatRuntime>): UseChatKitReturn {
  const messages = computed(() => runtimeRef.value.conversation.messages.value.map(toLegacyChatMessage))
  const conversations = computed(() => {
    const history = runtimeRef.value.history
    if (!history) {
      return []
    }

    return history.conversations.value
      .map((conversation) => createConversationSummary(conversation))
      .filter((conversation): conversation is ChatConversationSummary => Boolean(conversation))
  })
  const activeConversationId = computed(() => runtimeRef.value.history?.activeConversationId.value ?? null)
  const activeConversation = computed(() => {
    const currentId = activeConversationId.value
    if (!currentId) {
      return null
    }

    return conversations.value.find((conversation) => conversation.id === currentId) ?? null
  })
  const lastError = computed(() => {
    const lastMessage = [...runtimeRef.value.conversation.messages.value]
      .reverse()
      .find((message) => runtimeRef.value.message.getViewState(message.id)?.error)

    return lastMessage ? (getChatMessageError(lastMessage.raw) ?? null) : null
  })
  const placeholderRuntime = {
    activeEngine: computed(() => null),
    requestState: computed(() => 'idle'),
    processingState: computed(() => undefined),
    isProcessing: computed(() => runtimeRef.value.conversation.status.value === 'streaming'),
    clear: () => undefined,
    saveMessages: () => undefined,
  } as UseChatKitReturn['runtime']

  async function retry() {
    return runtimeRef.value.conversation.retry()
  }

  async function regenerate(messageIndex?: number) {
    const target =
      typeof messageIndex === 'number' ? runtimeRef.value.conversation.messages.value[messageIndex] : undefined
    return runtimeRef.value.conversation.regenerate(target?.id)
  }

  async function abort() {
    await runtimeRef.value.conversation.abort()
  }

  return {
    conversations,
    activeConversationId,
    activeConversation,
    createConversation(params?: { title?: string }) {
      const result = runtimeRef.value.history?.createConversation(params?.title ? { title: params.title } : undefined)

      if (typeof result === 'string') {
        return result
      }

      return ''
    },
    switchConversation(id: string) {
      return runtimeRef.value.history?.switchConversation(id) ?? false
    },
    deleteConversation(id: string) {
      return runtimeRef.value.history?.deleteConversation(id) ?? false
    },
    updateConversationTitle(id: string, title: string) {
      runtimeRef.value.history?.renameConversation?.(id, title)
    },
    abortActiveRequest: abort,
    messages,
    status: runtimeRef.value.conversation.status,
    lastError,
    sendMessage(content: string) {
      return runtimeRef.value.sender.send({ text: content })
    },
    startEditMessage(messageIndex: number) {
      const message = runtimeRef.value.conversation.messages.value[messageIndex]
      if (message) {
        runtimeRef.value.message.startEdit(message.id)
      }
    },
    cancelEditMessage(messageIndex: number) {
      const message = runtimeRef.value.conversation.messages.value[messageIndex]
      if (message) {
        runtimeRef.value.message.cancelEdit(message.id)
      }
    },
    isMessageEditing(messageIndex: number) {
      const message = runtimeRef.value.conversation.messages.value[messageIndex]
      return runtimeRef.value.message.getViewState(message?.id ?? '')?.editing ?? getMessageEditingState(message)
    },
    editMessage(messageIndex: number, newContent: string) {
      const message = runtimeRef.value.conversation.messages.value[messageIndex]
      if (message) {
        return runtimeRef.value.message.commitEdit(message.id, newContent)
      }
    },
    updateResponseProvider(_provider: unknown) {
      // Root bootstrap does not manage a provider swap path yet.
    },
    abort,
    retry,
    regenerate,
    runtime: placeholderRuntime,
  } as unknown as UseChatKitReturn
}

function createPageInputs(uiRef: ReadonlyRef<TrChatRootUiConfig | undefined>, runtimeRef: ReadonlyRef<ChatRuntime>) {
  return computed<ChatPageInputsValue>(() => ({
    header: {
      title: uiRef.value?.brand?.title,
      showHistory: Boolean(runtimeRef.value.history),
      showClose: false,
    },
    layout: {
      show: true,
      contentLayout: uiRef.value?.contentLayout,
      bubbleRenderers: runtimeRef.value.message.config?.renderers,
    },
    welcome: uiRef.value?.welcome
      ? {
          title: uiRef.value.welcome.title,
          description: uiRef.value.welcome.description,
          icon: uiRef.value.welcome.icon ?? uiRef.value.brand?.logo,
          prompts: uiRef.value.welcome.prompts,
        }
      : undefined,
    messageList: {
      autoScroll: true,
      variant: 'bubble',
      messageActions: runtimeRef.value.message.config?.actions,
      messageActionsMode: runtimeRef.value.message.config?.actionMode,
      onActionClick: undefined,
      groupStrategy: undefined,
      showFeedback: runtimeRef.value.message.config?.feedback?.enabled ?? false,
    },
    history: {
      enabled: Boolean(runtimeRef.value.history),
    },
    appearance: uiRef.value?.appearance,
    shell: createWorkspaceShellConfig(runtimeRef.value),
    modelSelector: {
      enabled: Boolean(runtimeRef.value.models),
      models: runtimeRef.value.models?.models.value,
      defaultModel: runtimeRef.value.models?.currentModelId.value ?? undefined,
    },
    updateModel(model) {
      runtimeRef.value.models?.selectModel(model.value)
    },
  }))
}

export function createRootBootstrapState(
  runtimeRef: ReadonlyRef<ChatRuntime>,
  uiRef: ReadonlyRef<TrChatRootUiConfig | undefined>,
) {
  const attachmentsManager = computed(() => createAttachmentsManager(runtimeRef.value))
  const attachmentsFeature = computed<ChatAttachmentsFeaturePreset | undefined>(() => {
    if (!runtimeRef.value.attachments) {
      return undefined
    }

    return {
      enabled: runtimeRef.value.attachments.enabled.value,
      upload: runtimeRef.value.attachments.uploadConfig?.value,
      list: runtimeRef.value.attachments.listConfig?.value,
    }
  })
  const fallbackChatKit = createFallbackChatKit(runtimeRef)

  return {
    chatKit: computed<UseChatKitReturn>(() => fallbackChatKit),
    messages: computed<ChatMessagesOverrides | undefined>(() => uiRef.value?.labels),
    shell: computed(() => createWorkspaceShellConfig(runtimeRef.value)),
    pageInputs: createPageInputs(uiRef, runtimeRef),
    attachmentsManager,
    attachmentsFeature,
  }
}
