<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { useBubbleStateChangeFn, useMessageContent } from '@opentiny/tiny-robot'
import type { BubbleContentRendererProps } from '@opentiny/tiny-robot'

const props = defineProps<BubbleContentRendererProps>()
const emitStateChange = useBubbleStateChangeFn()
const { contentText } = useMessageContent(props)
const draft = ref(contentText.value)
const textarea = ref<HTMLTextAreaElement>()
const saving = ref(false)

async function adjustHeight() {
  await nextTick()
  if (!textarea.value) return
  textarea.value.style.height = 'auto'
  textarea.value.style.height = `${textarea.value.scrollHeight}px`
}

function save() {
  if (saving.value || !draft.value.trim()) return
  saving.value = true
  emitStateChange('chat-edit:save', {
    text: draft.value,
    complete: (accepted: boolean) => {
      saving.value = false
      if (accepted) draft.value = ''
    },
  })
}

function cancel() {
  if (saving.value) return
  emitStateChange('chat-edit:cancel', {})
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault()
    save()
  } else if (event.key === 'Escape') {
    event.preventDefault()
    cancel()
  }
}

onMounted(() => {
  textarea.value?.focus()
  void adjustHeight()
})
</script>

<template>
  <div class="tr-chat-message-edit-input">
    <textarea
      ref="textarea"
      v-model="draft"
      rows="1"
      aria-label="编辑消息"
      placeholder="编辑消息内容..."
      :disabled="saving"
      @input="adjustHeight"
      @keydown="handleKeydown"
    />
    <div class="tr-chat-message-edit-input__actions">
      <button type="button" :disabled="saving" @click="cancel">取消</button>
      <button type="button" :disabled="saving || !draft.trim()" @click="save">
        {{ saving ? '保存中...' : '保存' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.tr-chat-message-edit-input {
  --tr-chat-edit-save-bg: #191919;
  --tr-chat-edit-save-bg-hover: #595959;
  --tr-chat-edit-save-border: transparent;
  --tr-chat-edit-save-border-hover: transparent;
  --tr-chat-edit-save-color: #ffffff;
  box-sizing: border-box;
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--tr-color-primary);
  border-radius: 8px;
  background: var(--tr-container-bg-default);
}

:global([data-tr-color-mode='dark'] .tr-chat-message-edit-input) {
  --tr-chat-edit-save-bg: transparent;
  --tr-chat-edit-save-bg-hover: transparent;
  --tr-chat-edit-save-border: #808080;
  --tr-chat-edit-save-border-hover: #c2c2c2;
  --tr-chat-edit-save-color: #e6e6e6;
}

.tr-chat-message-edit-input textarea {
  display: block;
  box-sizing: border-box;
  width: 100%;
  min-height: 24px;
  resize: none;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--tr-text-primary);
  font: inherit;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.tr-chat-message-edit-input__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.tr-chat-message-edit-input__actions button {
  min-height: 28px;
  padding: 3px 20px;
  border: 1px solid var(--tr-border-color-default);
  border-radius: 999px;
  background: transparent;
  color: var(--tr-text-primary);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  line-height: 1.5;
  transition: all 0.2s ease;
}

.tr-chat-message-edit-input__actions button:first-child:hover:not(:disabled) {
  border-color: var(--tr-border-color-hover);
}

.tr-chat-message-edit-input__actions button:last-child {
  border-color: var(--tr-chat-edit-save-border);
  background: var(--tr-chat-edit-save-bg);
  color: var(--tr-chat-edit-save-color);
}

.tr-chat-message-edit-input__actions button:last-child:hover:not(:disabled) {
  border-color: var(--tr-chat-edit-save-border-hover);
  background: var(--tr-chat-edit-save-bg-hover);
}

@media (max-width: 640px) {
  .tr-chat-message-edit-input__actions button {
    transition: none;
  }
}

.tr-chat-message-edit-input__actions button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
</style>
