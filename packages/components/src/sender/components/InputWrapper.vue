<template>
  <!-- 输入区域容器，处理拖放和布局 -->
  <div class="input-wrapper" @dragover.prevent="handleDragOver" @drop.prevent="handleDrop">
    <!-- 前缀内容插槽 -->
    <div v-if="$slots.prefix" class="prefix">
      <slot name="prefix" />
    </div>

    <!-- 文件上传隐藏input -->
    <input
      ref="fileInput"
      type="file"
      :multiple="multipleFiles"
      :accept="acceptFiles"
      @change="handleFileInput"
      style="display: none"
    />

    <!-- 文本输入区域 -->
    <TinyInput
      ref="textareaRef"
      type="textarea"
      v-model="localValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :autosize="autosize"
      @keydown="handleKeyDown"
      @compositionstart="handleCompositionStart"
      @compositionend="handleCompositionEnd"
    />

    <!-- 后缀操作按钮 -->
    <div class="suffix-actions">
      <!-- 语音输入按钮 -->
      <template v-if="speechEnabled">
        <tiny-tooltip :content="speechButtonText">
          <tiny-button circle :type="speechState.isRecording ? 'danger' : 'text'" @click="toggleSpeech">
            <icon-mic v-if="!speechState.isRecording" />
            <icon-stop v-else />
          </tiny-button>
        </tiny-tooltip>
      </template>

      <!-- 文件上传按钮 -->
      <tiny-tooltip content="上传文件">
        <tiny-button circle @click="triggerFileSelect">
          <icon-attachment />
        </tiny-button>
      </tiny-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { TinyInput, Button as TinyButton, Tooltip as TinyTooltip } from '@opentiny/vue'
import { IconMic, IconStop, IconAttachment } from '@opentiny/vue-icon'

const props = defineProps<any>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'file-change', files: any[]): void
  (e: 'speech-toggle', state: boolean): void
}>()

// 输入值管理
const localValue = ref(props.modelValue)
watch(
  () => props.modelValue,
  (val) => {
    if (val !== localValue.value) localValue.value = val
  },
)
watch(localValue, (val) => {
  emit('update:modelValue', val)
})

// 文件上传相关
const fileInput = ref<HTMLInputElement>()
const triggerFileSelect = () => fileInput.value?.click()

// 处理文件选择
const handleFileInput = async (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files || [])
  const validated = await validateFiles(files)
  emit('file-change', validated)
}

// 文件验证逻辑
const validateFiles = async (files: File[]) => {
  return files
    .map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: 'pending',
      progress: 0,
    }))
    .filter((file) => {
      const validType = props.acceptFiles ? new RegExp(props.acceptFiles.replace('*', '.*')).test(file.file.type) : true
      const validSize = props.maxFileSize ? file.file.size <= props.maxFileSize * 1024 * 1024 : true
      return validType && validSize
    })
}

// 拖放处理
const handleDragOver = (e: DragEvent) => {
  e.dataTransfer!.dropEffect = 'copy'
}
const handleDrop = async (e: DragEvent) => {
  const files = Array.from(e.dataTransfer?.files || [])
  const validated = await validateFiles(files)
  emit('file-change', validated)
}

// 语音识别相关
const speechEnabled = computed(() => props.speechConfig !== undefined)
const speechState = ref({
  isRecording: false,
  isSupported: 'webkitSpeechRecognition' in window,
})
const speechButtonText = computed(() => (speechState.value.isRecording ? '停止录音' : '开始语音输入'))
const toggleSpeech = () => {
  const newState = !speechState.value.isRecording
  speechState.value.isRecording = newState
  emit('speech-toggle', newState)
}

// 输入法状态处理
const isComposing = ref(false)
const handleCompositionStart = () => (isComposing.value = true)
const handleCompositionEnd = () => (isComposing.value = false)

// 键盘事件处理（示例：回车键逻辑）
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !isComposing.value) {
    // 自定义提交逻辑...
  }
}
</script>

<style scoped lang="scss">
.input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--ti-common-color-line-normal);
  border-radius: var(--ti-common-border-radius-normal);
  padding: 8px;
  background: var(--ti-common-color-bg-white);

  &:focus-within {
    border-color: var(--ti-common-color-primary);
    box-shadow: 0 0 0 2px var(--ti-common-color-primary-hover);
  }

  .prefix {
    flex-shrink: 0;
    color: var(--ti-common-color-text-secondary);
  }

  .tiny-textarea {
    flex: 1;
    border: none;
    padding: 0;
    background: transparent;

    &:deep(.tiny-textarea__inner) {
      resize: vertical;
      min-height: 60px;
    }
  }

  .suffix-actions {
    flex-shrink: 0;
    display: flex;
    gap: 4px;
  }
}
</style>
