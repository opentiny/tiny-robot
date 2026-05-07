import { computed, type ComputedRef, type Ref } from 'vue'
import type { BubbleMessage, FeedbackProps } from '@opentiny/tiny-robot'
import type { ChatMessage } from '@opentiny/tiny-robot-kit'
import { useResolvedChatMessages } from '@/shared/messages'
import { getChatRenderSourceMessage, unwrapChatRenderMessages } from '@/runtime/engine/chatRenderMessages'
import { ensureRuntimeMessageId } from '@/runtime/core/messageIdentity'
import type {
  ChatErrorInfo,
  ChatMessageActionContext,
  ChatMessageActionDefinition,
  ChatMessageActionsInput,
  ChatMessageActionsMode,
  ChatRuntime,
  ChatStatus,
} from '@/types'
import { createCopyAction, createEditAction, createRefreshAction } from './actions'
import { useFeedbackVisibility } from './useFeedbackVisibility'
import { useUsageInfo } from './useUsageInfo'
import type { UsageInfo } from './useUsageInfo'

export type { UsageInfo }

interface ChatFeedbackFallbackRuntime {
  activeConversationId: Readonly<Ref<string | null>>
  messages: ComputedRef<ChatMessage[]>
  status: ComputedRef<ChatStatus>
  lastError: ComputedRef<ChatErrorInfo | null>
  startEditMessage: (messageIndex: number) => void
  isMessageEditing: (messageIndex: number) => boolean
  retry: () => Promise<boolean>
  regenerate: (messageIndex?: number) => Promise<boolean>
}

export interface UseChatFeedbackOptions {
  messages: BubbleMessage[]
  messageIndexes: number[]
  role?: string
  enabled?: boolean
  runtime?: ChatRuntime | null
  fallbackRuntime?: ChatFeedbackFallbackRuntime | null
  messageActions?: ChatMessageActionsInput
  messageActionsMode?: ChatMessageActionsMode
}

export function useRuntimeFeedbackEnabled(options: { enabled?: boolean; runtime?: ChatRuntime | null }) {
  return computed(() => options.enabled ?? options.runtime?.message.config?.feedback?.enabled ?? true)
}

export function useChatFeedback(options: UseChatFeedbackOptions) {
  const { messages, messageIndexes, role, fallbackRuntime = null, runtime = null } = options

  // --- Base derived state ---

  const sourceMessages = computed(() => unwrapChatRenderMessages(messages as unknown as ChatMessage[]))
  const chatMessages = useResolvedChatMessages()

  const runtimeActionMode = computed<ChatMessageActionsMode | undefined>(() => runtime?.message.config?.actionMode)
  const messageActionMode = computed<ChatMessageActionsMode>(
    () => options.messageActionsMode ?? runtimeActionMode.value ?? 'append',
  )

  const primaryMessage = computed(() =>
    getChatRenderSourceMessage(sourceMessages.value[sourceMessages.value.length - 1]),
  )

  const messageIds = computed(() =>
    sourceMessages.value
      .map((message) => ensureRuntimeMessageId(message))
      .filter((messageId): messageId is string => Boolean(messageId)),
  )

  const primaryMessageId = computed(() =>
    primaryMessage.value ? ensureRuntimeMessageId(primaryMessage.value) : undefined,
  )

  const primaryViewState = computed(() =>
    runtime && primaryMessageId.value ? runtime.message.getViewState(primaryMessageId.value) : undefined,
  )

  const lastContent = computed(() => {
    const last = [...sourceMessages.value].reverse().find((m) => m.role === 'assistant' || !m.role)
    if (!last?.content) return ''
    return typeof last.content === 'string' ? last.content : JSON.stringify(last.content)
  })

  const lastUserContent = computed(() => {
    if (!fallbackRuntime) return ''
    const allMessages = fallbackRuntime.messages.value
    const firstIndex = messageIndexes[0] ?? 0
    for (let index = firstIndex - 1; index >= 0; index--) {
      if (allMessages[index]?.role === 'user') {
        const content = allMessages[index].content
        return typeof content === 'string' ? content : ''
      }
    }
    return ''
  })

  const userContent = computed(() => {
    const userMessage = sourceMessages.value.find((m) => m.role === 'user')
    if (!userMessage?.content) return ''
    return typeof userMessage.content === 'string' ? userMessage.content : JSON.stringify(userMessage.content)
  })

  const isStreaming = computed(() =>
    primaryViewState.value
      ? primaryViewState.value.status === 'streaming' || primaryViewState.value.status === 'pending'
      : fallbackRuntime
        ? fallbackRuntime.status.value === 'streaming' || fallbackRuntime.status.value === 'submitted'
        : false,
  )

  const actionContext = computed<ChatMessageActionContext>(() => ({
    role,
    messages: sourceMessages.value,
    messageIds: messageIds.value,
    messageIndexes,
    message: primaryMessage.value as ChatMessage | undefined,
    messageIndex: messageIndexes[messageIndexes.length - 1],
    messageId: primaryMessageId.value,
    runtime,
    conversationId:
      runtime?.history?.activeConversationId.value ?? fallbackRuntime?.activeConversationId.value ?? undefined,
  }))

  // --- Visibility ---

  const runtimeFeedbackEnabled = useRuntimeFeedbackEnabled({ enabled: options.enabled, runtime })

  const { shouldRender, isEditing, hasError, isPendingAssistantTurn } = useFeedbackVisibility({
    role,
    messages: sourceMessages,
    primaryMessage,
    primaryMessageId,
    messageIndexes,
    runtime,
    fallbackRuntime,
    runtimeFeedbackEnabled,
  })

  // --- Built-in actions ---

  const builtInActions = computed<ChatMessageActionDefinition[]>(() => {
    if (role === 'user') {
      return [
        createCopyAction({
          role: 'user',
          label: chatMessages.value.feedback.copy,
          content: userContent,
          runtime,
          primaryMessageId,
        }),
        createEditAction({ label: chatMessages.value.feedback.edit, runtime, fallbackRuntime }),
      ]
    }

    if (role === 'assistant') {
      return [
        createCopyAction({
          role: 'assistant',
          label: chatMessages.value.feedback.copy,
          content: lastContent,
          runtime,
          primaryMessageId,
        }),
        createRefreshAction({
          label: chatMessages.value.feedback.regenerate,
          runtime,
          fallbackRuntime,
          primaryMessageId,
          isStreaming,
          lastUserContent,
        }),
      ]
    }

    return []
  })

  // --- Custom actions ---

  const customActions = computed<ChatMessageActionDefinition[]>(() => {
    const { messageActions } = options
    if (messageActions) {
      return typeof messageActions === 'function' ? messageActions(actionContext.value) : messageActions
    }
    if (runtime?.message.getActions) {
      return runtime.message.getActions(actionContext.value) ?? []
    }
    return []
  })

  // --- Resolved actions ---

  const resolvedActions = computed<ChatMessageActionDefinition[]>(() => {
    const actionSource =
      messageActionMode.value === 'replace' ? customActions.value : [...builtInActions.value, ...customActions.value]

    const deduped = new Map<string, ChatMessageActionDefinition>()
    actionSource.forEach((action) => deduped.set(action.id, action))

    return [...deduped.values()]
      .filter((action) => {
        const actionRoles = action.roles
        if (actionRoles?.length && (!role || !actionRoles.includes(role as never))) return false
        if (action.when && action.when(actionContext.value) === false) return false
        return true
      })
      .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
  })

  const feedbackActions = computed<FeedbackProps['actions']>(() =>
    resolvedActions.value
      .filter((action) => (action.placement ?? 'actions') === 'actions')
      .map((action) => ({ name: action.id, label: action.label, icon: action.icon })),
  )

  const feedbackOperations = computed<FeedbackProps['operations']>(() =>
    resolvedActions.value
      .filter((action) => action.placement === 'operations')
      .map((action) => ({ name: action.id, label: action.label })),
  )

  function getActionDefinition(actionId: string, placement?: 'actions' | 'operations') {
    return resolvedActions.value.find(
      (action) => action.id === actionId && (placement === undefined || (action.placement ?? 'actions') === placement),
    )
  }

  // --- Usage info ---

  const usageInfo = useUsageInfo({ role, primaryMessage, isStreaming })

  return {
    shouldRender,
    isEditing,
    hasError,
    isPendingAssistantTurn,
    feedbackActions,
    feedbackOperations,
    getActionDefinition,
    actionContext,
    messageIds,
    userContent,
    usageInfo,
  }
}

/**
 * @deprecated Use `useChatFeedback` directly — `fallbackRuntime` is now an optional param.
 */
export function useChatFeedbackWithFallbackRuntime(options: UseChatFeedbackOptions) {
  return useChatFeedback(options)
}
