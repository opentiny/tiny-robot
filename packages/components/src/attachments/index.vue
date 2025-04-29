<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useDragDrop } from './composables/useDragDrop'
import { useFileType } from './composables/useFileType'
import FileCard from './components/FileCard.vue'
import FullScreenOverlay from './components/FullscreenOverlay.vue'
import type { AttachmentsProps, Attachment } from './index.type'
import './index.less'

const props = withDefaults(defineProps<AttachmentsProps>(), {
  overflow: 'wrap',
  disabled: false,
  iconSize: 42,
})

const emit = defineEmits(['update:items', 'files-dropped', 'file-remove', 'file-preview'])

// 文件列表管理
const fileList = ref<Attachment[]>(props.items || [])

// 使用文件类型工具
const { detectFileType, generateUID } = useFileType()

// 拖拽相关
const dropZoneRef = ref<HTMLElement | null>(null)

// 拖拽配置和状态
const isDragEnabled = computed(() => !!props.drag && !props.disabled)
const isDragFullscreen = computed(() => {
  return typeof props.drag === 'object' && props.drag.mode === 'fullscreen'
})

// 初始化拖拽功能
const { dragState, initDrag } = useDragDrop({
  enabled: isDragEnabled.value,
  config: typeof props.drag === 'object' ? props.drag : undefined,
  onDrop: handleDrop,
})

// 处理文件拖放
function handleDrop(files: File[]) {
  if (props.disabled) return

  const newFiles = files.map(
    (file) =>
      ({
        uid: generateUID(),
        name: file.name,
        status: 'uploading',
        fileType: detectFileType(file),
        rawFile: file,
      }) as Attachment,
  )

  fileList.value = [...fileList.value, ...newFiles]
  emit('files-dropped', newFiles)
  emit('update:items', fileList.value)
}

// 移除文件
function handleRemove(file: Attachment) {
  if (props.disabled) return

  const index = fileList.value.findIndex((item) => item.uid === file.uid)
  if (index !== -1) {
    fileList.value.splice(index, 1)
    emit('file-remove', file)
    emit('update:items', fileList.value)
  }
}

// 预览文件
function handlePreview(file: Attachment) {
  emit('file-preview', file)
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

// 拖拽相关的计算属性和状态变更时重新初始化
watch(
  [isDragEnabled, () => props.drag],
  () => {
    onMounted(() => {
      initDrag()
    })
  },
  { immediate: true },
)

// 设置拖拽区域
onMounted(() => {
  if (dropZoneRef.value) {
    if (typeof props.drag === 'object' && props.drag.target === undefined) {
      // TODO: 更新拖拽区域
      // props.drag.target = dropZoneRef.value
    }

    // 确保在DOM加载完成后初始化拖拽
    setTimeout(() => {
      initDrag()
    }, 100)
  }
})
</script>

<template>
  <div
    class="tr-attachments"
    :class="[rootClass, { 'tr-attachments--dragging': dragState.active && !isDragFullscreen }]"
    :style="styles?.root"
  >
    <div ref="dropZoneRef" class="tr-attachments__dropzone">
      <!-- 文件列表展示 -->
      <div
        v-if="fileList.length > 0"
        class="tr-attachments__file-list"
        :class="`tr-attachments__file-list--${overflow}`"
      >
        <FileCard
          v-for="file in fileList"
          :key="file.uid"
          :file="file"
          :file-icons="fileIcons"
          :icon-size="iconSize"
          :disabled="disabled"
          :style="styles?.card"
          @remove="handleRemove"
          @preview="handlePreview"
        />
      </div>

      <!-- 空状态 -->
      <div v-else class="tr-attachments__empty">
        <div class="tr-attachments__empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="#bdbdbd">
            <path
              d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"
            />
          </svg>
        </div>
        <div class="tr-attachments__empty-text">暂无文件</div>
        <div class="tr-attachments__empty-hint">将文件拖拽到此处，或点击上传</div>
      </div>
    </div>

    <!-- 全屏拖拽遮罩 -->
    <FullScreenOverlay
      v-if="isDragFullscreen"
      :visible="dragState.active"
      :config="typeof drag === 'object' ? drag.overlay : undefined"
      :style="styles?.overlay"
    />
  </div>
</template>
