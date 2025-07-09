<template>
  <tr-attachments v-model:items="items" :file-icons="fileIcons" />
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import type { Component } from 'vue'
import { TrAttachments } from '@opentiny/tiny-robot'
import type { Attachment, FileType } from '@opentiny/tiny-robot'

const fileIcons: Record<FileType, Component> = {
  word: h('span', '📄'),
  excel: h('span', '🐼'),
}

const items = ref<Attachment[]>([
  {
    id: '1',
    name: '这是一个word文档.docx',
    status: 'success',
    fileType: 'word',
    size: 12345,
  },
  {
    id: '2',
    name: '这是一个excel表格.xlsx',
    status: 'success',
    fileType: 'excel',
    size: 24576,
  },
])
</script>
