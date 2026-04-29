<template>
  <div class="attachments-test">
    <h2>Attachments 组件测试</h2>
    <p>这里用于验证附件数据规范化后的渲染表现。</p>

    <section class="attachments-test__section" data-testid="url-only-section">
      <div class="attachments-test__header">
        <h3>URL 无 size</h3>
        <button data-testid="url-only-clear" type="button" @click="urlOnlyItems = []">清空列表</button>
      </div>
      <TrAttachments v-model:items="urlOnlyItems" variant="card" />
    </section>

    <section class="attachments-test__section" data-testid="custom-type-section">
      <h3>显式 fileType 保留</h3>
      <TrAttachments v-model:items="customTypeItems" variant="card" />
    </section>

    <section class="attachments-test__section" data-testid="name-priority-section">
      <h3>name 优先于无后缀 URL</h3>
      <TrAttachments v-model:items="namePriorityItems" variant="card" />
    </section>

    <section class="attachments-test__section" data-testid="query-filename-section">
      <h3>query filename 推断</h3>
      <TrAttachments v-model:items="queryFilenameItems" variant="card" />
    </section>

    <section class="attachments-test__section" data-testid="query-hash-url-section">
      <h3>query + hash URL 推断</h3>
      <TrAttachments v-model:items="queryHashItems" variant="card" />
    </section>

    <section class="attachments-test__section" data-testid="local-full-fields-section">
      <h3>本地文件全量字段优先按 rawFile 识别</h3>
      <TrAttachments v-model:items="localFullFieldItems" variant="card" />
    </section>

    <section class="attachments-test__section" data-testid="local-file-section">
      <h3>本地文件 + 预览 URL</h3>
      <TrAttachments v-model:items="localItems" variant="card" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { TrAttachments } from '@opentiny/tiny-robot'
import type { Attachment } from '@opentiny/tiny-robot'

const createdObjectUrls: string[] = []

const createLocalAttachment = (): Attachment => {
  const rawFile = new File(['hello attachments'], 'notes.txt', { type: 'text/plain' })
  const objectUrl = URL.createObjectURL(rawFile)
  createdObjectUrls.push(objectUrl)

  return {
    id: 'local-file',
    rawFile,
    url: objectUrl,
    status: 'success',
  }
}

const urlOnlyItems = ref<Attachment[]>([
  {
    id: 'url-only',
    url: 'https://example.com/files/project-summary.pdf',
    status: 'success',
  },
])

const customTypeItems = ref<Attachment[]>([
  {
    id: 'custom-type',
    name: 'README.md',
    url: 'https://example.com/files/README.bin',
    fileType: 'md',
    size: 1024,
    status: 'success',
  },
])

const namePriorityItems = ref<Attachment[]>([
  {
    id: 'name-priority',
    name: 'meeting-notes.docx',
    url: 'https://example.com/download?id=18',
    status: 'success',
  },
])

const queryFilenameItems = ref<Attachment[]>([
  {
    id: 'query-filename',
    url: 'https://example.com/download?filename=quarterly-report.pdf&token=abc',
    status: 'success',
  },
])

const queryHashItems = ref<Attachment[]>([
  {
    id: 'query-hash',
    url: 'https://example.com/assets/image-cover.png?token=1#viewer',
    status: 'success',
  },
])

const localFullFieldItems = ref<Attachment[]>([
  {
    id: 'local-full-fields',
    rawFile: new File(['contract body'], 'contract.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }),
    name: 'contract.docx',
    size: 2048,
    url: 'https://example.com/previews/upload-success.png',
    status: 'success',
  },
])

const localItems = ref<Attachment[]>([createLocalAttachment()])

onUnmounted(() => {
  createdObjectUrls.forEach((url) => URL.revokeObjectURL(url))
})
</script>

<style scoped>
.attachments-test {
  max-width: 960px;
  margin: 0 auto;
  padding: 20px;
}

.attachments-test__section {
  margin-top: 24px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.attachments-test__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.attachments-test__header button {
  border: 1px solid #d1d5db;
  background: #fff;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
}

.attachments-test__header button:hover {
  background: #f9fafb;
}
</style>
