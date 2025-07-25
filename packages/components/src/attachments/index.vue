<script setup lang="ts">
import { watch, ref, computed } from 'vue'
import { useImagePreview, useListType } from './composables'
import { AttachmentListEmits, AttachmentListProps, Attachment, ActionButton } from './index.type'
import FileCard from './components/FileCard.vue'
import { useFileType } from './composables/useFileType'

const props = withDefaults(defineProps<AttachmentListProps>(), {
  variant: 'auto',
  actions: () => [
    {
      label: '下载',
      type: 'download',
    },
    {
      label: '预览',
      type: 'preview',
    },
  ],
  fileMatchers: () => [],
})

const emit = defineEmits<AttachmentListEmits>()

// 文件列表管理
const fileList = ref<Attachment[]>(props.items || [])

// 自动检测 listType
const { actualListType } = useListType(fileList, props.variant)

// 图片预览逻辑
const { handlePreview, renderPreview } = useImagePreview(fileList, emit, { enableDownload: true })

// 移除文件
function handleRemove(file: Attachment) {
  if (props.disabled) return

  const index = fileList.value.findIndex((item) => item.id === file.id)
  if (index !== -1) {
    fileList.value.splice(index, 1)
    emit('remove', file)
    emit('update:items', fileList.value)
  }
}

// 下载文件
function handleDownload(event: MouseEvent, file: Attachment) {
  emit('download', event, file)
}

// 重试上传
function handleRetry(file: Attachment) {
  emit('retry', file)
}

// 处理自定义操作按钮事件
function handleAction(payload: { action: ActionButton; file: Attachment }) {
  emit('action', payload)
}

const wrapClass = computed(() => (props.wrap ? 'wrap' : 'no-wrap'))

const { normalizeAttachments } = useFileType({
  fileMatchers: props.fileMatchers,
})

// 监听props.items变化
watch(
  () => props.items,
  (newItems) => {
    if (newItems && newItems.length > 0) {
      fileList.value = normalizeAttachments(newItems)
    }
  },
  { deep: true, immediate: true },
)
</script>

<template>
  <div class="tr-attachments">
    <div v-if="fileList.length > 0" :class="['tr-attachments__file-list', wrapClass]" @click.stop>
      <FileCard
        v-for="file in fileList"
        :key="file.id"
        :file="file"
        :variant="actualListType"
        :file-icons="fileIcons"
        :disabled="disabled"
        :actions="actions"
        :show-status="true"
        :file-matchers="fileMatchers"
        @remove="handleRemove"
        @preview="handlePreview"
        @download="handleDownload"
        @retry="handleRetry"
        @action="handleAction"
      />
    </div>

    <!-- 图片预览组件 -->
    <Component :is="renderPreview()" />
  </div>
</template>

<style lang="less" scoped>
// 主容器样式
.tr-attachments {
  position: relative;
  border-radius: 8px;
  color: rgb(25, 25, 25);

  // 文件列表容器
  &__file-list {
    display: flex;
    flex-direction: column;
    width: 100%;
    cursor: default;

    // 不换行模式（水平滚动）
    &.no-wrap {
      flex-direction: row;
      overflow-x: auto;
      padding: 8px 0;

      .tr-file-card {
        margin-bottom: 0;
        flex: 0 0 auto;
      }
    }

    // 换行模式
    &.wrap {
      flex-direction: row;
      flex-wrap: wrap;
    }
  }
}
</style>
