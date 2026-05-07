import { computed, ref } from 'vue'
import type { Attachment } from '@opentiny/tiny-robot'
import { getChatMessageError, isChatMessageEditing, isChatMessageOptimistic } from '@/runtime/engine/chatMessageState'
import type {
  ChatMessageRuntime,
  ChatRuntime,
  ChatRuntimeInput,
  ChatSendInput,
  ChatSenderRuntime,
  ChatUIMessage,
} from '@/types'

function extractText(message: ChatUIMessage): string {
  return message.parts
    .filter((part): part is Extract<ChatUIMessage['parts'][number], { type: 'text' }> => part.type === 'text')
    .map((part) => part.text)
    .join('\n')
}

function createDefaultSenderRuntime(runtimeInput: ChatRuntimeInput): ChatSenderRuntime {
  const draft = ref('')
  const pendingAttachments = ref<Attachment[]>([])
  const canSend = computed(() => {
    const hasText = Boolean(draft.value.trim())
    const status = runtimeInput.conversation.status.value
    return hasText && status !== 'submitted' && status !== 'streaming'
  })

  async function send(input: Partial<ChatSendInput> = {}) {
    const text = input.text ?? draft.value
    if (!text.trim()) {
      return
    }

    await runtimeInput.conversation.send({
      text,
      attachments: input.attachments ?? pendingAttachments.value,
      modelId: input.modelId ?? null,
    })
    draft.value = ''
    pendingAttachments.value = []
  }

  return {
    draft,
    pendingAttachments,
    canSend,
    setDraft(value) {
      draft.value = value
    },
    send,
    addPendingAttachments(attachments) {
      pendingAttachments.value = [...pendingAttachments.value, ...attachments]
    },
    setPendingAttachments(attachments) {
      pendingAttachments.value = [...attachments]
    },
    removePendingAttachment(target) {
      pendingAttachments.value = pendingAttachments.value.filter((item) => item !== target)
    },
    clearPendingAttachments() {
      pendingAttachments.value = []
    },
  }
}

function createDefaultMessageRuntime(runtimeInput: ChatRuntimeInput): ChatMessageRuntime {
  function resolveMessage(messageId: string) {
    return runtimeInput.conversation.messages.value.find((message) => message.id === messageId)
  }

  return {
    getViewState(messageId) {
      const message = resolveMessage(messageId)
      if (!message) {
        return undefined
      }

      const raw = message.raw
      const status =
        raw && typeof raw === 'object' && 'loading' in raw && raw.loading
          ? 'streaming'
          : getChatMessageError(raw)
            ? 'error'
            : isChatMessageOptimistic(raw)
              ? 'pending'
              : 'done'

      return {
        status,
        error: getChatMessageError(raw),
        editing: isChatMessageEditing(raw),
        optimistic: isChatMessageOptimistic(raw),
        capabilities: {
          editable: message.role === 'user',
          retryable: message.role === 'assistant',
          regeneratable: message.role === 'assistant',
          feedbackable: message.role === 'assistant',
        },
      }
    },
    startEdit() {
      console.warn(
        '[TrChat] message.startEdit() called on the default message runtime. Provide a full ChatMessageRuntime to enable editing.',
      )
    },
    cancelEdit() {
      console.warn(
        '[TrChat] message.cancelEdit() called on the default message runtime. Provide a full ChatMessageRuntime to enable editing.',
      )
    },
    async commitEdit() {
      console.warn(
        '[TrChat] message.commitEdit() called on the default message runtime. Provide a full ChatMessageRuntime to enable editing.',
      )
      return false
    },
    async copy(messageId) {
      const message = resolveMessage(messageId)
      const text = message ? extractText(message) : ''
      if (!text) {
        return
      }

      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      }
    },
  }
}

export function normalizeChatRuntime(runtimeInput: ChatRuntimeInput): ChatRuntime {
  return {
    ...runtimeInput,
    sender: runtimeInput.sender ?? createDefaultSenderRuntime(runtimeInput),
    message: runtimeInput.message ?? createDefaultMessageRuntime(runtimeInput),
  }
}

export function extractMessageText(message: ChatUIMessage | undefined) {
  if (!message) {
    return ''
  }

  return extractText(message)
}

export function getMessageEditingState(message: ChatUIMessage | undefined) {
  return Boolean(message?.raw && isChatMessageEditing(message.raw))
}
