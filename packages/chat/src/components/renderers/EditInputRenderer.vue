<script setup lang="ts">
import { nextTick, onMounted, ref, watch, inject } from 'vue'
import { useMessageContent, type BubbleContentRendererProps } from '@opentiny/tiny-robot'
import { ensureChatMessageState } from '@/runtime/engine/chatMessageState'
import { getChatRenderMessageIndex, getChatRenderSourceMessage } from '@/runtime/engine/chatRenderMessages'
import { getRuntimeMessageId } from '@/runtime/core/messageIdentity'
import { CHAT_KIT_KEY, CHAT_RUNTIME_KEY } from '@/shared/context'
import { useResolvedChatMessages } from '@/shared/messages'
import type { ChatRuntime } from '@/types'
import type { UseChatKitReturn } from '@/types/core'

const props = defineProps<BubbleContentRendererProps>()
const chatKit = inject<UseChatKitReturn>(CHAT_KIT_KEY)
const chatRuntime = inject<ChatRuntime | null>(CHAT_RUNTIME_KEY, null)
const chatMessages = useResolvedChatMessages()

const { contentText } = useMessageContent(props)

const localContent = ref(contentText.value || '')
const textareaRef = ref<HTMLTextAreaElement>()
const isSaving = ref(false)

watch(
  () => props.message,
  (message) => {
    if (message) {
      ensureChatMessageState(message)
    }
  },
  { immediate: true },
)

const adjustHeight = async () => {
  await nextTick()
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`
  }
}

function resolveSourceMessage() {
  return getChatRenderSourceMessage(props.message as never) ?? (props.message as never)
}

function resolveMessageId() {
  return getRuntimeMessageId(resolveSourceMessage())
}

function resolveMessageIndex() {
  const sourceMessage = resolveSourceMessage()
  return (
    getChatRenderMessageIndex(props.message as never) ??
    chatKit!.messages.value.findIndex((message) => message === sourceMessage)
  )
}

const handleSave = async () => {
  if (!localContent.value.trim()) {
    console.warn('Message content cannot be empty')
    return
  }

  isSaving.value = true
  try {
    const messageId = resolveMessageId()
    if (chatRuntime && messageId) {
      chatRuntime.message.cancelEdit(messageId)
      await nextTick()
      await chatRuntime.message.commitEdit(messageId, localContent.value)
      return
    }

    const messageIndex = resolveMessageIndex()
    if (messageIndex === -1) {
      console.error('Current message could not be found')
      return
    }

    chatKit!.cancelEditMessage(messageIndex)
    await nextTick()
    chatKit!.editMessage(messageIndex, localContent.value)
  } finally {
    isSaving.value = false
  }
}

const handleCancel = () => {
  const messageId = resolveMessageId()
  if (chatRuntime && messageId) {
    chatRuntime.message.cancelEdit(messageId)
    return
  }

  const messageIndex = resolveMessageIndex()
  if (messageIndex !== -1) {
    chatKit!.cancelEditMessage(messageIndex)
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault()
    handleSave()
  } else if (event.key === 'Escape') {
    event.preventDefault()
    handleCancel()
  }
}

onMounted(() => {
  adjustHeight()
})
</script>

<template>
  <Transition name="slide-in-right" appear>
    <div class="edit-input-container">
      <div class="edit-textarea-wrapper">
        <textarea
          ref="textareaRef"
          v-model="localContent"
          rows="1"
          @keydown="handleKeydown"
          @input="adjustHeight"
          :placeholder="chatMessages.editMessage.placeholder"
          autofocus
        />
      </div>
      <div class="edit-input-actions">
        <button class="cancel-btn" @click="handleCancel">
          <span>{{ chatMessages.editMessage.cancel }}</span>
        </button>
        <button class="save-btn" @click="handleSave" :disabled="isSaving">
          <span>{{ isSaving ? chatMessages.editMessage.saving : chatMessages.editMessage.save }}</span>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.edit-input-container {
  width: 100%;
  box-sizing: border-box;
  background: var(--chat-edit-surface-bg);
  border: 1px solid var(--chat-edit-surface-border);
  border-radius: 12px;
  box-shadow: var(--chat-edit-surface-shadow);
  padding: 10px 14px;

  textarea {
    display: flex;
    width: 100%;
    min-height: 28px;
    border: none;
    outline: none;
    resize: none;
    font-size: 15px;
    line-height: 1.5;
    background: transparent;
    color: var(--chat-edit-text);
    font-family: inherit;

    &:focus {
      outline: none;
    }

    &::placeholder {
      color: var(--chat-edit-placeholder);
    }
  }

  .edit-input-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 8px;

    button {
      padding: 4px 18px;
      border-radius: 999px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.5;
      transition: all 0.2s ease;

      @media (max-width: 640px) {
        transition: none;
      }
    }

    .cancel-btn {
      border: 1px solid var(--chat-edit-cancel-border);
      background: var(--chat-edit-cancel-bg);
      color: var(--chat-edit-cancel-text);

      &:hover {
        background: var(--chat-edit-cancel-bg-hover);
      }
    }

    .save-btn {
      border: 1px solid var(--chat-edit-save-border);
      background: var(--chat-edit-save-bg);
      color: var(--chat-edit-save-text);

      &:hover {
        background: var(--chat-edit-save-bg-hover);
        border-color: var(--chat-edit-save-bg-hover);
      }
    }
  }
}

.slide-in-right-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);

  @media (max-width: 640px) {
    transition: none;
  }
}

.slide-in-right-enter-from {
  transform: translateX(20px);
  opacity: 0;

  @media (max-width: 640px) {
    transform: translateX(0);
    opacity: 1;
  }
}

.slide-in-right-enter-to {
  transform: translateX(0);
  opacity: 1;
}
</style>
