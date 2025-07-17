<template>
  <div class="demo-container">
    <div class="demo-section">
      <h4>自定义下载处理器（模拟授权访问）</h4>
      <tr-attachments v-model:items="secureFiles" :download-handler="handleSecureDownload" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrAttachments } from '@opentiny/tiny-robot'
import type { Attachment } from '@opentiny/tiny-robot'

// 需要授权访问的文件示例
const secureFiles = ref<Attachment[]>([
  {
    id: '1',
    name: '机密文档.pdf',
    fileType: 'pdf',
    size: 1024 * 1024 * 2, // 2MB
    status: 'success',
    previewUrl: 'https://secure-api.example.com/files/secret-doc.pdf',
  },
  {
    id: '2',
    name: '内部资料.docx',
    fileType: 'word',
    size: 1024 * 1024 * 1.8, // 1.8MB
    status: 'success',
    previewUrl: 'https://secure-api.example.com/files/internal-doc.docx',
  },
])

// 安全下载处理器（模拟授权访问）
const handleSecureDownload = async (file: Attachment) => {
  console.log('处理安全文件下载:', file.name)

  try {
    // 模拟获取授权token
    const token = 'mock-auth-token-123'

    // 模拟授权请求
    const response = await fetch(file.previewUrl!, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('授权失败')
    }

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    link.click()

    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 100)
  } catch (error) {
    alert(`下载失败: ${error.message}`)
  }
}
</script>

<style scoped>
.demo-container {
  padding: 10px;
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
