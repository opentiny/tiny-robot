<script setup lang="ts">
import { watch, ref } from 'vue'
import { useImagePreview, useListType } from './composables'
import { AttachmentsEmits, AttachmentsProps, Attachment } from './index.type'
import FileCard from './components/FileCard.vue'
import './index.less'

const props = withDefaults(defineProps<AttachmentsProps>(), {
  overflow: 'wrap',
  listType: 'auto', // 默认自动检测
})

const emit = defineEmits<AttachmentsEmits>()

// 文件列表管理
const fileList = ref<Attachment[]>(props.items || [])

// 自动检测 listType
const { actualListType } = useListType(fileList, props.listType)

// 图片预览逻辑
const { handlePreview, renderPreview } = useImagePreview(fileList, emit, { enableDownload: true })

// 移除文件
function handleRemove(file: Attachment) {
  if (props.disabled) return

  const index = fileList.value.findIndex((item) => item.uid === file.uid)
  if (index !== -1) {
    // 清理预览URL
    if (file.previewUrl && file.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(file.previewUrl)
    }

    fileList.value.splice(index, 1)
    emit('file-remove', file)
    emit('update:items', fileList.value)
  }
}

// 下载文件
function handleDownload(file: Attachment) {
  emit('file-download', file)
}

// 重试上传
function handleRetry(file: Attachment) {
  emit('file-retry', file)
}

// 处理自定义操作按钮事件
// eslint-disable-next-line
function handleAction(payload: any) {
  emit('action', payload)
}

// 监听props.items变化
watch(
  () => props.items,
  (newItems) => {
    if (newItems) {
      fileList.value = newItems
    }
  },
  { deep: true },
)
</script>

<template>
  <div class="tr-attachments">
    <div
      v-if="fileList.length > 0"
      class="tr-attachments__file-list"
      :class="`tr-attachments__file-list--${overflow}`"
      @click.stop
    >
      <FileCard
        v-for="file in fileList"
        :key="file.uid"
        :file="file"
        :list-type="actualListType"
        :file-icons="fileIcons"
        :disabled="disabled"
        :status-type="statusType"
        :custom-actions="customActions"
        :show-status="true"
        @remove="handleRemove"
        @preview="handlePreview"
        @download="handleDownload"
        @retry="handleRetry"
        @file-preview="handlePreview"
        @action="handleAction"
      />
    </div>

    <!-- 图片预览组件 -->
    <Component :is="renderPreview()" />
  </div>
</template>
