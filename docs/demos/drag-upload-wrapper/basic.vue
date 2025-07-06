<template>
  <div class="demo-container">
    <h2>拖拽上传包装器演示</h2>

    <!-- 基本用法 -->
    <div class="demo-section">
      <h3>基本用法</h3>
      <p>将任何内容包装在 DragUploadWrapper 中，就可以获得拖拽上传功能：</p>

      <tr-drag-upload-wrapper
        :multiple="true"
        accept="image/*,.pdf,.doc,.docx"
        @files-dropped="handleFilesDropped"
        @files-rejected="handleFilesRejected"
      >
        <template #default="{ isDragging }">
          <div class="chat-container" :class="{ dragging: isDragging }">
            <div class="chat-header">
              <h4>聊天窗口</h4>
              <span v-if="isDragging" class="drag-indicator">📁 拖拽文件到这里</span>
            </div>
            <div class="chat-content">
              <div class="message">
                <div class="message-content">你好！这是一个聊天界面的演示。</div>
              </div>
              <div class="message">
                <div class="message-content">你可以将文件拖拽到这个区域来上传文件。</div>
              </div>
            </div>
            <div class="chat-input">
              <input type="text" placeholder="输入消息..." />
              <button>发送</button>
            </div>
          </div>
        </template>
      </tr-drag-upload-wrapper>
    </div>

    <!-- 自定义覆盖层 -->
    <div class="demo-section">
      <h3>自定义覆盖层</h3>
      <p>可以自定义拖拽时显示的覆盖层：</p>

      <tr-drag-upload-wrapper :multiple="false" accept=".jpg,.jpeg,.png,.gif" @files-dropped="handleImageDropped">
        <template #default="{ isDragging }">
          <div class="image-upload-area" :class="{ dragging: isDragging }">
            <div v-if="!uploadedImage" class="upload-placeholder">
              <div class="upload-icon">📷</div>
              <div class="upload-text">点击或拖拽图片到这里</div>
            </div>
            <img v-else :src="uploadedImage" alt="上传的图片" class="uploaded-image" />
          </div>
        </template>

        <template #overlay>
          <div class="custom-overlay">
            <div class="custom-overlay-content">
              <div class="custom-icon">🎨</div>
              <div class="custom-text">释放鼠标上传图片</div>
              <div class="custom-hint">支持 JPG、PNG、GIF 格式</div>
            </div>
          </div>
        </template>
      </tr-drag-upload-wrapper>
    </div>

    <!-- 禁用状态 -->
    <div class="demo-section">
      <h3>禁用状态</h3>
      <p>可以禁用拖拽功能：</p>

      <tr-drag-upload-wrapper :disabled="true" @files-dropped="handleFilesDropped">
        <template #default="{ disabled }">
          <div class="disabled-area" :class="{ disabled: disabled }">
            <div class="disabled-content">
              <div class="disabled-icon">🚫</div>
              <div class="disabled-text">拖拽功能已禁用</div>
            </div>
          </div>
        </template>
      </tr-drag-upload-wrapper>
    </div>

    <!-- 事件日志 -->
    <div v-if="events.length > 0" class="demo-section">
      <h3>事件日志</h3>
      <div class="event-log">
        <div v-for="(event, index) in events" :key="index" class="event-item">
          <span class="event-time">{{ event.time }}</span>
          <span class="event-type">{{ event.type }}</span>
          <span class="event-message">{{ event.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrDragUploadWrapper } from '@opentiny/tiny-robot'

interface Event {
  time: string
  type: string
  message: string
}

const events = ref<Event[]>([])
const uploadedImage = ref<string>('')

const addEvent = (type: string, message: string) => {
  const now = new Date().toLocaleTimeString()
  events.value.unshift({
    time: now,
    type,
    message,
  })

  // 只保留最近 10 条事件
  if (events.value.length > 10) {
    events.value = events.value.slice(0, 10)
  }
}

const handleFilesDropped = (files: File[]) => {
  addEvent('files-dropped', `上传了 ${files.length} 个文件: ${files.map((f) => f.name).join(', ')}`)
  console.log('上传的文件:', files)
}

const handleFilesRejected = (rejection: { reason: string; files: File[] }) => {
  addEvent('files-rejected', `文件被拒绝: ${rejection.reason}, 文件数量: ${rejection.files.length}`)
  console.log('被拒绝的文件:', rejection)
}

const handleImageDropped = (files: File[]) => {
  if (files.length > 0) {
    const file = files[0]
    addEvent('image-dropped', `上传了图片: ${file.name}`)

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
.demo-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

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

/* 聊天容器样式 */
.chat-container {
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.chat-container.dragging {
  border-color: #007bff;
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.3);
}

.chat-header {
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h4 {
  margin: 0;
  color: #333;
}

.drag-indicator {
  color: #007bff;
  font-weight: bold;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.chat-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.message {
  margin-bottom: 12px;
}

.message-content {
  background: #f1f3f4;
  padding: 8px 12px;
  border-radius: 18px;
  display: inline-block;
  max-width: 70%;
}

.chat-input {
  padding: 12px 16px;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 8px;
}

.chat-input input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
}

.chat-input button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
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

/* 禁用状态样式 */
.disabled-area {
  border: 2px solid #ccc;
  border-radius: 8px;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.disabled-area.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.disabled-content {
  text-align: center;
  color: #666;
}

.disabled-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.disabled-text {
  font-size: 14px;
}

/* 事件日志样式 */
.event-log {
  background: #f8f9fa;
  border-radius: 4px;
  padding: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.event-item {
  display: flex;
  gap: 12px;
  padding: 4px 0;
  border-bottom: 1px solid #e9ecef;
  font-size: 14px;
}

.event-item:last-child {
  border-bottom: none;
}

.event-time {
  color: #666;
  min-width: 80px;
}

.event-type {
  color: #007bff;
  font-weight: bold;
  min-width: 120px;
}

.event-message {
  color: #333;
  flex: 1;
}
</style>
