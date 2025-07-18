<template>
  <div class="demo-section">
    <p>将 v-dropzone 指令应用到任何元素上，就可以获得拖拽上传功能：</p>
    <!-- 目标元素 -->
    <div
      class="chat-container"
      v-dropzone="{
        accept,
        multiple,
        onDrop: handleFilesDropped,
        onError: handleFilesRejected,
        onDraggingChange: handleDraggingChange,
      }"
    >
      <div class="chat-header">
        <h4>聊天窗口</h4>
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

    <!-- 浮层组件 -->
    <tr-drag-overlay
      :overlay-title="overlayTitle"
      :overlay-description="overlayDescription"
      :is-dragging="isDragging"
      :drag-target="targetElement"
    />

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

  <!-- accept 和 multiple 属性响应式示例 -->
  <div>
    <h4>accept 和 multiple 属性响应式示例</h4>
    <p>accept 属性用于限制文件类型，multiple 属性用于限制文件数量</p>
    <p>更改属性后，拖拽区域配置会自动更新，无需重新挂载指令</p>
    <div class="demo-section-property">
      <!-- accept 属性 -->
      <div class="demo-section-body">
        <label style="margin-right: 8px">accept:</label>
        <TinySelect v-model="accept">
          <TinyOption label="图片" value="image/*" />
          <TinyOption label="视频" value="video/*" />
          <TinyOption label="音频" value="audio/*" />
          <TinyOption label="其他" value="application/*" />
        </TinySelect>
      </div>

      <!-- multiple 属性 radio 示例 -->
      <div class="demo-section-body">
        <label style="margin-right: 8px">multiple:</label>
        <TinySwitch v-model="multiple" :true-value="true" :false-value="false" />
        <p style="font-weight: bold">{{ multiple ? '多选' : '单选' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TinySwitch, TinySelect, TinyOption } from '@opentiny/vue'
import { TrDragOverlay, vDropzone, type FileRejection } from '@opentiny/tiny-robot'

interface Event {
  time: string
  type: string
  message: string
}

const events = ref<Event[]>([])
const overlayTitle = '将图片拖到此处完成上传'
const overlayDescription = ['总计最多上传3个图片（每个10MB以内）', '支持图片格式 JPG/JPEG/PNG']

const isDragging = ref(false)
const targetElement = ref<HTMLElement | null>(null)
const accept = ref('image/*')
const multiple = ref(true)

function handleDraggingChange(dragging: boolean, element: HTMLElement | null) {
  isDragging.value = dragging
  targetElement.value = element
}

function addEvent(type: string, message: string) {
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

function handleFilesDropped(files: File[]) {
  addEvent('files-dropped', `上传了 ${files.length} 个文件: ${files.map((f) => f.name).join(', ')}`)
  console.log('上传的文件:', files)
}

function handleFilesRejected(rejection: FileRejection) {
  addEvent(
    'files-rejected',
    `文件被拒绝: ${rejection.message} (${rejection.code}), 文件数量: ${rejection.files.length}`,
  )
  console.log('被拒绝的文件:', rejection)
}
</script>

<style scoped>
.demo-section {
  margin-bottom: 10px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.demo-section-body {
  display: flex;
  align-items: center;
  gap: 8px;
}

.demo-section-property {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  margin-bottom: 10px;
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
