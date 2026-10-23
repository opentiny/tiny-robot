<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrDragOverlay } from '@opentiny/tiny-robot'
import { TrChatUI, type ChatUIData, type SenderDragPayload } from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'

const dragTarget = shallowRef<HTMLElement | null>(null)
const isDragging = shallowRef(false)
const receivedFiles = shallowRef<string[]>([])

const data: ChatUIData = {
  sender: { submitDisabled: true },
}

function handleDragEnter({ event, target }: SenderDragPayload) {
  if (!event.dataTransfer?.types.includes('Files')) return
  dragTarget.value = target
  isDragging.value = true
}

function handleDragOver({ event }: SenderDragPayload) {
  if (event.dataTransfer?.types.includes('Files')) event.preventDefault()
}

function handleDragLeave({ event, target }: SenderDragPayload) {
  if (!target.contains(event.relatedTarget as Node | null)) {
    isDragging.value = false
  }
}

function handleDrop({ event }: SenderDragPayload) {
  isDragging.value = false
  receivedFiles.value = Array.from(event.dataTransfer?.files ?? []).map((file) => file.name)
}

function handlePaste(event: ClipboardEvent) {
  const files = Array.from(event.clipboardData?.files ?? [])
  if (files.length) receivedFiles.value = files.map((file) => file.name)
}
</script>

<template>
  <section class="chat-file-drop-demo">
    <p class="chat-file-drop-demo__help">将图片拖到输入框，或复制图片后粘贴。此示例只显示文件名，不会上传文件。</p>
    <TrChatUI
      :data="data"
      @sender-drag-enter="handleDragEnter"
      @sender-drag-over="handleDragOver"
      @sender-drag-leave="handleDragLeave"
      @sender-drop="handleDrop"
      @sender-paste="handlePaste"
    />
    <TrDragOverlay :is-dragging="isDragging" :drag-target="dragTarget">
      <template #overlay>
        <div class="chat-file-drop-demo__drop-hint">释放图片以添加附件</div>
      </template>
    </TrDragOverlay>
    <p class="chat-file-drop-demo__result" aria-live="polite">
      {{ receivedFiles.length ? `收到：${receivedFiles.join('、')}` : '尚未收到文件' }}
    </p>
  </section>
</template>

<style scoped>
.chat-file-drop-demo {
  --tr-layout-height: 100%;
  display: flex;
  flex-direction: column;
  height: min(560px, calc(100vh - 240px));
  min-height: 460px;
}

.chat-file-drop-demo__help,
.chat-file-drop-demo__result {
  margin: 0;
  padding: 10px 14px;
  color: var(--tr-text-secondary, #575d6c);
  font-size: 13px;
}

.chat-file-drop-demo :deep(.tr-chat-ui) {
  flex: 1;
  min-height: 0;
}

.chat-file-drop-demo :deep(.tr-drag-overlay) {
  padding: 0;
  overflow: hidden;
  background: transparent;
  backdrop-filter: none;
}

.chat-file-drop-demo__drop-hint {
  display: grid;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  place-items: center;
  border: 1px dashed rgb(64 158 255 / 75%);
  border-radius: 16px;
  background: rgb(64 158 255 / 12%);
  color: var(--tr-text-primary, #252b3a);
  font-size: 14px;
  font-weight: 600;
}
</style>
