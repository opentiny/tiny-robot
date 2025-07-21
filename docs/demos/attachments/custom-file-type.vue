<template>
  <div class="demo-container">
    <div class="demo-section">
      <h4>支持自定义文件类型（txt、md、json）</h4>
      <tr-attachments v-model:items="customFiles" :file-matchers="fileMatchers" wrap />

      <h4>添加自定义文件类型</h4>
      <input type="file" @change="handleFileChange" accept=".txt,.md,.json" style="margin-bottom: 16px" />
      <p>选择 .txt、.md 或 .json 文件来测试自定义匹配器</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { TrAttachments } from '@opentiny/tiny-robot'
import type { Attachment, FileTypeMatcher } from '@opentiny/tiny-robot'

// 自定义图标组件
const TextIcon = h('div', { style: { color: '#52c41a', fontSize: '20px' } }, '📄')
const MDIcon = h('div', { style: { color: '#1890ff', fontSize: '20px' } }, '📝')
const JsonIcon = h('div', { style: { color: '#fa8c16', fontSize: '20px' } }, '📊')

// 自定义文件类型匹配器
const fileMatchers: FileTypeMatcher[] = [
  {
    type: 'txt',
    matcher: (file: File | string) => {
      if (typeof file !== 'string') {
        return file.type === 'text/plain' || file.name.endsWith('.txt')
      }
      return file.toLowerCase().endsWith('.txt')
    },
    icon: TextIcon,
  },
  {
    type: 'md',
    matcher: (file: File | string) => {
      if (typeof file !== 'string') {
        return file.name.endsWith('.md') || file.name.endsWith('.markdown')
      }
      return file.toLowerCase().endsWith('.md') || file.toLowerCase().endsWith('.markdown')
    },
    icon: MDIcon,
  },
  {
    type: 'json',
    matcher: (file: File | string) => {
      if (typeof file !== 'string') {
        return file.type === 'application/json' || file.name.endsWith('.json')
      }
      return file.toLowerCase().endsWith('.json')
    },
    icon: JsonIcon,
  },
]

// 自定义文件类型示例
const customFiles = ref<Attachment[]>([
  {
    id: '1',
    name: 'README.md',
    fileType: 'md',
    size: 1024 * 2, // 2KB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/book.md',
    status: 'success',
  },
  {
    id: '2',
    name: 'config.json',
    fileType: 'json',
    size: 1024 * 1.5, // 1.5KB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/book.json',
    status: 'success',
  },
  {
    id: '3',
    name: 'notes.txt',
    fileType: 'txt',
    size: 1024 * 3, // 3KB
    url: 'https://res.hc-cdn.com/tiny-vue-web-doc/3.23.0.20250521142915/static/images/book.txt',
    status: 'success',
  },
])

// 处理文件选择
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (files && files.length > 0) {
    const file = files[0]

    customFiles.value.push({ rawFile: file })
  }

  // 清空输入框
  target.value = ''
}
</script>

<style scoped>
.demo-container {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.demo-section {
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
}

.demo-section h4 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #333;
}
</style>
