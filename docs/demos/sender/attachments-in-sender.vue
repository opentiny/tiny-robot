<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { TrAttachments, TrSender, UploadButton } from '@opentiny/tiny-robot'
import type { Attachment, SenderSubmitMeta } from '@opentiny/tiny-robot'

const content = ref('')
const message = ref('')
const attachments = ref<Attachment[]>([])

const createAttachment = (file: File, index: number): Attachment => {
  const isImage = file.type.startsWith('image/')

  return {
    id: `${file.name}-${file.lastModified}-${Date.now()}-${index}`,
    name: file.name,
    rawFile: file,
    size: file.size,
    status: 'success',
    url: isImage ? URL.createObjectURL(file) : undefined,
  }
}

const revokeObjectUrl = (attachment: Attachment) => {
  if (attachment.url?.startsWith('blob:')) {
    URL.revokeObjectURL(attachment.url)
  }
}

const clearAttachments = () => {
  attachments.value.forEach(revokeObjectUrl)
  attachments.value = []
}

const handleFiles = (files: File[]) => {
  attachments.value = [...attachments.value, ...files.map(createAttachment)]
}

const handleSubmit = (text: string, _structuredData?: unknown, meta?: SenderSubmitMeta) => {
  const attachmentNames =
    meta?.externalPayloads.reduce<string[]>((names, payload) => {
      if (payload.sourceId !== 'attachments') {
        return names
      }

      payload.items.forEach((attachment) => {
        names.push(attachment.name || attachment.rawFile?.name || '未命名文件')
      })

      return names
    }, []) ?? []

  message.value = attachmentNames.length
    ? `已提交: ${text || '(无文本)'}，附件: ${attachmentNames.join('、')}`
    : `已提交: ${text}`

  content.value = ''
  clearAttachments()
}

onBeforeUnmount(clearAttachments)
</script>

<template>
  <div class="demo-container">
    <tr-sender
      v-model="content"
      placeholder="输入内容，或直接上传附件后发送..."
      mode="multiple"
      clearable
      @submit="handleSubmit"
    >
      <template v-if="attachments.length" #header>
        <tr-attachments
          v-model:items="attachments"
          class="sender-attachments"
          variant="card"
          wrap
          @remove="revokeObjectUrl"
        />
      </template>

      <template #footer-right>
        <UploadButton accept="*" :multiple="true" tooltip="上传附件" tooltip-placement="top" @select="handleFiles" />
      </template>
    </tr-sender>

    <div v-if="message" class="message">{{ message }}</div>
  </div>
</template>

<style scoped>
.demo-container {
  display: grid;
  gap: 12px;
  padding: 20px;
}

.sender-attachments {
  width: 100%;
}

.message {
  padding: 10px;
  border-radius: 6px;
  background: #e7f3ff;
  color: #1476ff;
}
</style>
