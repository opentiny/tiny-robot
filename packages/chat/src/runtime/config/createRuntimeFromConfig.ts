import { computed, effectScope, ref } from 'vue'
import type { Attachment } from '@opentiny/tiny-robot'
import type { ChatMessage, ConversationStorageStrategy, UseMessagePlugin } from '@opentiny/tiny-robot-kit'
import { useChatAttachments } from '@/components/attachments/useChatAttachments'
import { detectFileType } from '@/shared/attachments'
import { createChatUiContext } from '@/shared/context'
import { createOpenAICompatibleResponseProvider } from '../transport/openaiCompatibleTransport'
import { useChatKit } from '@/runtime/engine/useChatKit'
import {
  getChatMessageError,
  getChatMessageTurnId,
  isChatMessageEditing,
  isChatMessageOptimistic,
} from '@/runtime/engine/chatMessageState'
import { ensureRuntimeMessageId } from '@/runtime/core/messageIdentity'
import { extractMessageText } from '@/runtime/core/normalizeRuntime'
import { cloneMessages } from '@/runtime/engine/useChatMessages'
import type {
  ChatConversationCreateInput,
  ChatConversationSummary,
  ChatConversationRuntime,
  ChatHistoryRuntime,
  ChatMessageViewState,
  ChatMessageRuntime,
  ChatModelRuntime,
  ChatRuntimeInput,
  ChatSenderRuntime,
  ChatUIMessage,
  ChatWorkspaceRegionRuntime,
  ChatWorkspaceRuntime,
  CreateRuntimeFromConfigResult,
  TrChatConfig,
  TrChatRequestModel,
  ChatWorkspaceRegionConfig,
  ChatWorkspaceShellConfig,
  ModelOption,
} from '@/types'

function createNullStorage(): ConversationStorageStrategy {
  return {
    loadConversations: () => [],
    loadMessages: () => [],
    saveConversation: () => undefined,
    saveMessages: () => undefined,
    deleteConversation: () => undefined,
  }
}

function createTextParts(message: ChatMessage) {
  const parts: ChatUIMessage['parts'] = []

  if (typeof message.content === 'string' && message.content) {
    parts.push({ type: 'text' as const, text: message.content })
  }

  const attachments = (message as unknown as { attachments?: Attachment[] }).attachments
  if (Array.isArray(attachments)) {
    for (const attachment of attachments) {
      parts.push({ type: 'attachment' as const, attachment })
    }
  }

  if (parts.length > 0) {
    return parts
  }

  if (typeof message.content === 'string') {
    return [{ type: 'text' as const, text: message.content }]
  }

  return [{ type: 'unknown' as const, value: message.content }]
}

function createUiMessage(message: ChatMessage): ChatUIMessage {
  const createdAt = (message as unknown as { createdAt?: number }).createdAt
  const turnId = getChatMessageTurnId(message)

  return {
    id: ensureRuntimeMessageId(message),
    role: (message.role ?? '') as ChatUIMessage['role'],
    createdAt: typeof createdAt === 'number' ? createdAt : undefined,
    parts: createTextParts(message),
    meta: turnId ? { turnId } : undefined,
    raw: message,
  }
}

function deriveConversationTitle(messages: ChatMessage[]) {
  const firstTextMessage = messages.find((message) => typeof message.content === 'string' && message.content.trim())
  return typeof firstTextMessage?.content === 'string' ? firstTextMessage.content.slice(0, 20) : undefined
}

function toConversationSummary(conversation: unknown): ChatConversationSummary | null {
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

function toModelOption(model: TrChatRequestModel): ModelOption {
  return {
    value: model.id,
    label: model.label ?? model.id,
    providerId: model.providerId,
    icon: model.icon,
    disabled: model.disabled,
  }
}

function resolveWorkspaceShellConfig(config: TrChatConfig): ChatWorkspaceShellConfig {
  const variant = config.workspace?.defaultView ?? (config.workspace?.enabled ? 'workspace' : 'stacked')
  const historyEnabled = config.history?.enabled !== false
  const leftConfig = config.workspace?.left
  const rightConfig = config.workspace?.right

  return {
    variant,
    leftRegion: {
      enabled: leftConfig?.enabled ?? historyEnabled,
      collapsible: leftConfig?.collapsible,
      defaultOpen: leftConfig?.defaultOpen ?? (variant === 'workspace' ? (config.history?.defaultOpen ?? true) : false),
      collapseMode: leftConfig?.collapseMode ?? 'rail',
      width: leftConfig?.width,
      railLabel: leftConfig?.railLabel,
    },
    rightRegion: rightConfig
      ? {
          enabled: rightConfig.enabled ?? true,
          collapsible: rightConfig.collapsible,
          defaultOpen: rightConfig.defaultOpen,
          collapseMode: rightConfig.collapseMode,
          width: rightConfig.width,
          railLabel: rightConfig.railLabel,
        }
      : variant === 'workspace'
        ? {
            enabled: true,
            defaultOpen: false,
            collapseMode: 'hidden',
          }
        : {
            enabled: false,
          },
  }
}

function findMessageById(messages: ChatMessage[], messageId?: string) {
  if (!messageId) {
    return undefined
  }

  return messages.find((message) => ensureRuntimeMessageId(message) === messageId)
}

function createConversationRuntimeFromChatKit(chatKit: ReturnType<typeof useChatKit>): ChatConversationRuntime {
  const messages = computed(() => chatKit.messages.value.map(createUiMessage))

  return {
    messages,
    status: chatKit.status,
    send(input) {
      return chatKit.sendMessage(input.text)
    },
    abort() {
      return chatKit.abort()
    },
    retry(messageId) {
      if (!messageId) {
        return chatKit.retry()
      }

      const target = findMessageById(chatKit.messages.value, messageId)
      if (!target) {
        return false
      }

      const targetTurnId = getChatMessageTurnId(target)
      if (!targetTurnId) {
        return false
      }

      const isRetryableTurn = chatKit.messages.value.some(
        (message) => getChatMessageTurnId(message) === targetTurnId && getChatMessageError(message)?.retryable,
      )

      if (!isRetryableTurn) {
        return false
      }

      return chatKit.retry()
    },
    regenerate(messageId) {
      const currentMessages = chatKit.messages.value
      if (!messageId) {
        return chatKit.regenerate()
      }

      const target = findMessageById(currentMessages, messageId)
      const targetIndex = target ? currentMessages.indexOf(target) : -1
      return targetIndex >= 0 ? chatKit.regenerate(targetIndex) : false
    },
  }
}

function createHistoryRuntimeFromChatKit(chatKit: ReturnType<typeof useChatKit>): ChatHistoryRuntime {
  const conversations = computed(() =>
    chatKit.conversations.value
      .map((conversation) => toConversationSummary(conversation))
      .filter((conversation): conversation is ChatConversationSummary => Boolean(conversation)),
  )

  return {
    conversations,
    activeConversationId: chatKit.activeConversationId,
    createConversation(params?: ChatConversationCreateInput) {
      const createdConversation = chatKit.createConversation({
        title: params?.title,
      })

      return createdConversation?.id ?? ''
    },
    async switchConversation(id) {
      const switchedConversation = await chatKit.switchConversation(id)
      return Boolean(switchedConversation)
    },
    async deleteConversation(id) {
      await chatKit.deleteConversation(id)
      return true
    },
    renameConversation(id, title) {
      chatKit.updateConversationTitle(id, title)
      return true
    },
  }
}

function createResponseProviderForModel(config: TrChatConfig, model: TrChatRequestModel) {
  const transport = config.request.providers[model.providerId]
  if (!transport) {
    throw new Error(
      `[createRuntimeFromConfig] No provider configured for providerId "${model.providerId}". ` +
        `Available providers: ${Object.keys(config.request.providers).join(', ')}`,
    )
  }
  return createOpenAICompatibleResponseProvider({
    providerId: model.providerId,
    model: model.id,
    endpoint: transport.endpoint,
    baseURL: transport.baseURL,
    apiPath: transport.apiPath,
    systemPrompt: transport.systemPrompt ?? config.request.systemPrompt,
    temperature: transport.temperature,
    maxTokens: transport.maxTokens,
    headers: transport.headers,
    credentials: transport.credentials,
  })
}

function createModelsRuntimeFromConfig(
  config: TrChatConfig,
  options?: {
    onSelectModel?: (model: TrChatRequestModel) => void
  },
): ChatModelRuntime {
  const models = computed(() => config.request.models.map(toModelOption))
  const currentModelId = ref(config.request.defaultModelId ?? config.request.models[0]?.id ?? null)

  function selectModel(modelId: string) {
    const target = models.value.find((model) => model.value === modelId && !model.disabled)
    if (!target) {
      return false
    }

    currentModelId.value = target.value
    const resolvedModel = config.request.models.find((model) => model.id === target.value)
    if (resolvedModel) {
      options?.onSelectModel?.(resolvedModel)
    }
    return true
  }

  return {
    models,
    currentModelId,
    selectModel,
  }
}

function createWorkspaceRegionRuntime(
  regionState: ReturnType<typeof createChatUiContext>['workspace']['left'],
  regionConfig: ChatWorkspaceRegionConfig | undefined,
): ChatWorkspaceRegionRuntime {
  return {
    enabled: computed(() => regionConfig?.enabled !== false),
    visible: regionState.visible,
    collapsed: regionState.collapsed,
    width: regionState.width,
    collapseMode: regionState.collapseMode,
    collapsible: computed(() => regionConfig?.collapsible !== false),
    railLabel: computed(() => regionConfig?.railLabel),
    open: regionState.open,
    close: regionState.close,
    toggle: regionState.toggle,
    collapse: regionState.collapse,
    expand: regionState.expand,
    setWidth: regionState.setWidth,
  }
}

function createWorkspaceRuntimeFromConfig(config: TrChatConfig): ChatWorkspaceRuntime {
  const shell = computed(() => resolveWorkspaceShellConfig(config))
  const chatUi = createChatUiContext({
    historyDisplay: 'drawer',
    historyVisible: config.history?.defaultOpen,
    shell,
  })

  return {
    enabled: chatUi.workspace.enabled,
    variant: chatUi.workspace.variant,
    isMobile: chatUi.workspace.isMobile,
    left: createWorkspaceRegionRuntime(chatUi.workspace.left, shell.value.leftRegion),
    right: createWorkspaceRegionRuntime(chatUi.workspace.right, shell.value.rightRegion),
    historyVisible: chatUi.history.visible,
    openHistory: chatUi.history.open,
    closeHistory: chatUi.history.close,
    toggleHistory: chatUi.history.toggle,
    setResponsiveHost: chatUi.workspace.setResponsiveHost,
  }
}

interface ResolvedRuntimeMessage {
  raw: ChatMessage
  ui: ChatUIMessage
  index: number
}

function resolveRuntimeMessage(messages: ChatMessage[], messageId: string): ResolvedRuntimeMessage | undefined {
  for (let index = 0; index < messages.length; index += 1) {
    const raw = messages[index]
    if (ensureRuntimeMessageId(raw) !== messageId) {
      continue
    }

    return {
      raw,
      ui: createUiMessage(raw),
      index,
    }
  }

  return undefined
}

function resolveMessageViewState(message: ChatMessage, config: Pick<TrChatConfig, 'messages'>): ChatMessageViewState {
  const error = getChatMessageError(message)
  const optimistic = isChatMessageOptimistic(message)
  const editing = isChatMessageEditing(message)
  const streaming = Boolean(message.loading)
  const status = error ? 'error' : streaming ? 'streaming' : optimistic ? 'pending' : 'done'

  return {
    status,
    error,
    editing,
    optimistic,
    capabilities: {
      editable: message.role === 'user' && !streaming,
      retryable: message.role === 'assistant' && Boolean(error?.retryable),
      regeneratable: message.role === 'assistant' && !streaming && !error,
      feedbackable: Boolean(config.messages?.feedback?.enabled) && message.role === 'assistant' && !streaming,
    },
  }
}

export function createMessageRuntimeFromChatKit(
  chatKit: ReturnType<typeof useChatKit>,
  config: Pick<TrChatConfig, 'messages'>,
): ChatMessageRuntime {
  function resolveMessage(messageId: string) {
    return resolveRuntimeMessage(chatKit.messages.value, messageId)
  }

  return {
    getViewState(messageId) {
      const resolved = resolveMessage(messageId)
      if (!resolved) {
        return undefined
      }

      return resolveMessageViewState(resolved.raw, config)
    },
    getActions() {
      return config.messages?.actions ?? []
    },
    startEdit(messageId) {
      const resolved = resolveMessage(messageId)
      if (resolved) {
        chatKit.startEditMessage(resolved.index)
      }
    },
    cancelEdit(messageId) {
      const resolved = resolveMessage(messageId)
      if (resolved) {
        chatKit.cancelEditMessage(resolved.index)
      }
    },
    commitEdit(messageId, nextContent) {
      const resolved = resolveMessage(messageId)
      if (!resolved) {
        return false
      }

      chatKit.editMessage(resolved.index, nextContent)
      return true
    },
    async copy(messageId) {
      const resolved = resolveMessage(messageId)
      if (!resolved) {
        return
      }

      const text = extractMessageText(resolved.ui)
      if (!text) {
        return
      }

      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      }
    },
    config: {
      actions: config.messages?.actions,
      actionMode: config.messages?.actionMode,
      renderers: config.messages?.renderers,
      feedback: config.messages?.feedback,
      transforms: config.messages?.transforms,
    },
  }
}

function normalizeAttachment(file: File): Attachment {
  return {
    rawFile: file,
    url: URL.createObjectURL(file),
    name: file.name,
    size: file.size,
    fileType: detectFileType(file),
    status: 'success',
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`))
    reader.readAsDataURL(file)
  })
}

async function resolveAttachmentUrls(attachments: Attachment[]): Promise<Attachment[]> {
  return Promise.all(
    attachments.map(async (attachment) => {
      const url = attachment.url
      // Already a usable URL (data: or https:)
      if (typeof url === 'string' && !url.startsWith('blob:')) {
        return attachment
      }

      // Convert rawFile to data URL, then drop rawFile so it survives JSON serialization
      if (attachment.rawFile) {
        const dataUrl = await fileToDataUrl(attachment.rawFile)

        const { rawFile: _, ...rest } = attachment as unknown as Record<string, unknown>
        return { ...rest, url: dataUrl } as Attachment
      }

      return attachment
    }),
  )
}

function createSenderRuntimeFromChatKit(
  chatKit: ReturnType<typeof useChatKit>,
  config: TrChatConfig,
  attachmentsManager: ReturnType<typeof useChatAttachments>,
  resolveModelId: () => string | null,
): ChatSenderRuntime {
  const draft = ref('')
  const canSend = computed(() => {
    const status = chatKit.status.value
    return Boolean(draft.value.trim()) && status !== 'submitted' && status !== 'streaming'
  })

  return {
    draft,
    pendingAttachments: attachmentsManager.items,
    canSend,
    setDraft(value) {
      draft.value = value
    },
    async send(input = {}) {
      const payload = {
        text: input.text ?? draft.value,
        attachments: input.attachments ?? attachmentsManager.items.value,
        modelId: input.modelId ?? resolveModelId(),
      }

      if (config.lifecycle?.beforeSend) {
        const result = await config.lifecycle.beforeSend({ text: payload.text, attachments: payload.attachments })
        if (result === false) {
          return
        }

        payload.text = result?.text ?? payload.text
        if (result && 'attachments' in result && result.attachments) {
          payload.attachments = result.attachments
        }
      }

      if (!payload.text.trim()) {
        return
      }

      if (payload.attachments.length > 0) {
        const resolved = await resolveAttachmentUrls(payload.attachments)
        chatKit.sendMessage(payload.text, { attachments: resolved })
      } else {
        chatKit.sendMessage(payload.text)
      }

      draft.value = ''
      attachmentsManager.clear()
    },
    addPendingAttachments(attachments) {
      attachmentsManager.setItems([...attachmentsManager.items.value, ...attachments])
    },
    setPendingAttachments(attachments) {
      attachmentsManager.setItems(attachments)
    },
    removePendingAttachment(target) {
      attachmentsManager.removeItem(target)
    },
    clearPendingAttachments() {
      attachmentsManager.clear()
    },
    defaults: {
      placeholder: config.sender?.placeholder,
      mode: config.sender?.mode,
      maxLength: config.sender?.maxLength,
      wordCount: config.sender?.wordCount,
      voice: config.sender?.voice,
    },
  }
}

export function createRuntimeFromConfig(
  config: TrChatConfig,
  options: { plugins?: UseMessagePlugin[] } = {},
): CreateRuntimeFromConfigResult {
  const scope = effectScope(true)
  const result = scope.run(() => {
    const defaultModelId = config.request.defaultModelId ?? config.request.models[0]?.id
    const model = config.request.models.find((item) => item.id === defaultModelId) ?? config.request.models[0]
    if (!model) {
      throw new Error('[createRuntimeFromConfig] request.models must declare at least one model')
    }

    const responseProvider = createResponseProviderForModel(config, model)

    const chatKit = useChatKit({
      responseProvider,
      plugins: options.plugins,
      storage: config.conversation?.persistence ?? createNullStorage(),
      initialMessages: config.conversation?.initialMessages,
      messageTransforms: config.messages?.transforms,
      onAfterReceive: (message) => {
        config.lifecycle?.afterReceive?.(message)
      },
      onError: (error) => {
        config.lifecycle?.error?.(error)
      },
    })
    const models = createModelsRuntimeFromConfig(config, {
      onSelectModel(selectedModel) {
        chatKit.updateResponseProvider(createResponseProviderForModel(config, selectedModel))
      },
    })
    if (config.conversation?.initialMessages?.length && !chatKit.activeConversationId.value) {
      const createdConversation = chatKit.createConversation({
        title: deriveConversationTitle(config.conversation.initialMessages),
      })

      if (createdConversation.engine.messages.value.length === 0) {
        createdConversation.engine.messages.value.splice(
          0,
          createdConversation.engine.messages.value.length,
          ...cloneMessages(config.conversation.initialMessages),
        )
        chatKit.runtime.saveMessages()
      }
    }
    const attachmentsManager = useChatAttachments()
    const conversation = createConversationRuntimeFromChatKit(chatKit)
    const sender = createSenderRuntimeFromChatKit(
      chatKit,
      config,
      attachmentsManager,
      () => models.currentModelId.value ?? null,
    )
    const message = createMessageRuntimeFromChatKit(chatKit, config)
    const history = createHistoryRuntimeFromChatKit(chatKit)
    const workspace = createWorkspaceRuntimeFromConfig(config)

    const runtime: ChatRuntimeInput = {
      conversation,
      sender,
      message,
      history,
      models,
      workspace,
      attachments: {
        enabled: computed(() => config.attachments?.enabled !== false),
        prepareFiles(files) {
          return files.map(normalizeAttachment)
        },
        uploadConfig: computed(() => config.attachments?.upload),
        listConfig: computed(() => config.attachments?.list),
      },
    }

    return {
      runtime,
      ui: {
        brand: config.ui?.brand,
        welcome: config.ui?.welcome,
        appearance: config.ui?.appearance,
        contentLayout: config.ui?.contentLayout,
        labels: config.ui?.labels,
      },
    }
  })

  if (!result) {
    throw new Error('[createRuntimeFromConfig] Failed to initialize runtime scope')
  }

  return {
    ...result,
    dispose: () => scope.stop(),
  }
}
