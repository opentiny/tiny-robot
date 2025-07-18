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
    url: 'https://www.demo.com/文档.docx',
    size: 12345,
  },
  {
    url: 'https://www.demo.com/表格.xlsx',
    size: 24576,
  },
])
</script>
