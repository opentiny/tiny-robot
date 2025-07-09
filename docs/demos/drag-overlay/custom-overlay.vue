<template>
  <div class="demo-section">
    <p>浮层组件允许你通过插槽完全自定义内容：</p>

    <div
      class="image-upload-area"
      v-drag-aware="{
        onStateChange: handleImageDragStateChange,
        onFilesDropped: handleImageDropped,
        accept: '.jpg,.jpeg,.png,.gif',
        multiple: false,
      }"
      :class="{ dragging: isImageDragging }"
    >
      <div v-if="!uploadedImage" class="upload-placeholder">
        <div class="upload-icon">📷</div>
        <div class="upload-text">点击或拖拽图片到这里</div>
      </div>
      <img v-else :src="uploadedImage" alt="上传的图片" class="uploaded-image" />
    </div>

    <tr-drag-overlay :is-dragging="isImageDragging" :target-rect="targetRect">
      <template #overlay>
        <div class="custom-overlay">
          <div class="custom-overlay-content">
            <div class="custom-icon">🎨</div>
            <div class="custom-text">释放鼠标上传图片</div>
            <div class="custom-hint">支持 JPG、PNG、GIF 格式</div>
          </div>
        </div>
      </template>
    </tr-drag-overlay>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { TrDragOverlay } from '@opentiny/tiny-robot'
import { vDragAware } from '@opentiny/tiny-robot/drag-overlay/directives/vDragAware'

const isImageDragging = ref(false)
const targetRect = ref<DOMRect | null>(null)
const uploadedImage = ref<string>('')

const handleImageDragStateChange = (dragging: boolean, rect: DOMRect | null) => {
  isImageDragging.value = dragging
  targetRect.value = rect
}

const handleImageDropped = (files: File[]) => {
  if (files.length > 0) {
    const file = files[0]
    console.log('上传的文件:', file)

    // 创建预览
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedImage.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}
</script>

<style scoped>
.demo-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.demo-section h3 {
  margin-top: 0;
  color: #333;
}

.demo-section p {
  color: #666;
  margin-bottom: 16px;
}

/* 图片上传区域样式 */
.image-upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.image-upload-area.dragging {
  border-color: #007bff;
  background: rgba(0, 123, 255, 0.05);
}

.upload-placeholder {
  text-align: center;
  color: #666;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 16px;
}

.uploaded-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
}

/* 自定义覆盖层样式 */
.custom-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255, 0, 150, 0.8), rgba(0, 123, 255, 0.8));
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  pointer-events: none;
}

.custom-overlay-content {
  text-align: center;
  color: white;
  padding: 20px;
  border: 2px dashed white;
  border-radius: 8px;
}

.custom-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.custom-text {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.custom-hint {
  font-size: 14px;
  opacity: 0.9;
}
</style>
