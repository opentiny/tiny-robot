<template>
  <div class="demo-container">
    <h2>DragUploadWrapper 与 Container 集成演示</h2>

    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="control-item">
        <label>显示容器：</label>
        <tiny-switch v-model="show"></tiny-switch>
      </div>
      <div class="control-item">
        <label>全屏模式：</label>
        <tiny-switch v-model="fullscreen"></tiny-switch>
      </div>
      <div class="control-item">
        <label>拖拽模式：</label>
        <tiny-select v-model="dragMode" :options="dragModeOptions" />
      </div>
    </div>

    <!-- Container 容器 -->
    <tr-container v-model:show="show" v-model:fullscreen="fullscreen">
      <!-- 标题插槽 -->
      <template #title>
        <h3>{{ fullscreen ? '全屏聊天窗口' : '侧边栏聊天窗口' }}</h3>
      </template>

      <!-- 操作按钮插槽 -->
      <template #operations>
        <tr-icon-button size="28" svg-size="20" :icon="IconNewSession" @click="clearMessages" />
      </template>

      <!-- 主要内容 - 包装在 DragUploadWrapper 中 -->
      <tr-drag-upload-wrapper
        :key="dragMode"
        :multiple="true"
        accept="image/*,.pdf,.doc,.docx,.txt,.md"
        :overlay-title="dragMode === 'container' ? '拖拽文件到聊天区域' : '拖拽文件到任意位置'"
        :overlay-description="overlayDescription"
        @files-dropped="handleFilesDropped"
        @files-rejected="handleFilesRejected"
        @drag-enter="handleDragEnter"
        @drag-leave="handleDragLeave"
      >
        <template #default="{ isDragging }">
          <div class="chat-container" :class="{ dragging: isDragging }">
            <!-- 聊天消息区域 -->
            <div class="chat-messages">
              <div v-if="messages.length === 0" class="empty-state">
                <div class="empty-icon">💬</div>
                <div class="empty-text">开始对话吧！</div>
                <div class="empty-hint">你可以拖拽文件到这里进行上传</div>
              </div>

              <div v-for="message in messages" :key="message.id" class="message">
                <div class="message-avatar">
                  <div v-if="message.type === 'user'" class="user-avatar">👤</div>
                  <div v-else class="bot-avatar">🤖</div>
                </div>
                <div class="message-content">
                  <div class="message-text">{{ message.text }}</div>
                  <div v-if="message.files && message.files.length > 0" class="message-files">
                    <div v-for="file in message.files" :key="file.name" class="file-item">
                      <span class="file-icon">📎</span>
                      <span class="file-name">{{ file.name }}</span>
                      <span class="file-size">({{ formatFileSize(file.size) }})</span>
                    </div>
                  </div>
                  <div class="message-time">{{ message.time }}</div>
                </div>
              </div>
            </div>

            <!-- 拖拽状态指示器 -->
            <!-- <div v-if="isDragging && dragMode === 'container'" class="drag-indicator">
              <div class="drag-indicator-content">
                <div class="drag-indicator-icon">📁</div>
                <div class="drag-indicator-text">松手即可上传文件</div>
              </div>
            </div> -->
          </div>
        </template>
      </tr-drag-upload-wrapper>

      <!-- 底部输入区域 -->
      <template #footer>
        <div class="chat-input-area">
          <div class="input-wrapper">
            <input v-model="inputText" type="text" placeholder="输入消息..." @keyup.enter="sendMessage" />
            <button @click="sendMessage" :disabled="!inputText.trim()">发送</button>
          </div>
        </div>
      </template>
    </tr-container>

    <!-- 事件日志 -->
    <div v-if="events.length > 0" class="event-log">
      <h3>事件日志</h3>
      <div class="event-list">
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
import { ref, computed } from 'vue'
import { TrContainer, TrIconButton, TrDragUploadWrapper } from '@opentiny/tiny-robot'
import { IconNewSession } from '@opentiny/tiny-robot-svgs'
import { TinySwitch, TinySelect } from '@opentiny/vue'

interface Message {
  id: string
  type: 'user' | 'bot'
  text: string
  files?: File[]
  time: string
}

interface Event {
  time: string
  type: string
  message: string
}

const show = ref(true)
const fullscreen = ref(false)
const dragMode = ref('container')
const inputText = ref('')
const messages = ref<Message[]>([])
const events = ref<Event[]>([])

const dragModeOptions = [
  { label: '容器拖拽', value: 'container' },
  { label: '全屏拖拽', value: 'fullscreen' },
]

const overlayDescription = computed(() => {
  if (dragMode.value === 'fullscreen') {
    return ['支持图片、PDF、Word、文本文档', '可同时上传多个文件']
  }
  return ['支持多种文件格式', '拖拽到聊天区域即可上传']
})

const addEvent = (type: string, message: string) => {
  const now = new Date().toLocaleTimeString()
  events.value.unshift({
    time: now,
    type,
    message,
  })

  // 只保留最近 8 条事件
  if (events.value.length > 8) {
    events.value = events.value.slice(0, 8)
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const addMessage = (type: 'user' | 'bot', text: string, files?: File[]) => {
  const message: Message = {
    id: Date.now().toString(),
    type,
    text,
    files,
    time: new Date().toLocaleTimeString(),
  }
  messages.value.push(message)
}

const sendMessage = () => {
  if (!inputText.value.trim()) return

  addMessage('user', inputText.value)
  const userMessage = inputText.value
  inputText.value = ''

  // 模拟机器人回复
  setTimeout(() => {
    addMessage('bot', `收到你的消息："${userMessage}"`)
  }, 1000)
}

const clearMessages = () => {
  messages.value = []
  addEvent('clear', '清空了所有消息')
}

const handleFilesDropped = (files: File[]) => {
  addEvent('files-dropped', `上传了 ${files.length} 个文件: ${files.map((f) => f.name).join(', ')}`)

  // 添加文件消息
  addMessage('user', `上传了 ${files.length} 个文件`, files)

  // 模拟机器人回复
  setTimeout(() => {
    const fileNames = files.map((f) => f.name).join('、')
    addMessage('bot', `我收到了你上传的文件：${fileNames}。正在处理中...`)
  }, 1000)
}

const handleFilesRejected = (rejection: { reason: string; files: File[] }) => {
  addEvent('files-rejected', `文件被拒绝: ${rejection.reason}, 文件数量: ${rejection.files.length}`)

  // 添加错误消息
  addMessage('bot', `抱歉，有 ${rejection.files.length} 个文件格式不支持，请上传支持的文件格式。`)
}

const handleDragEnter = () => {
  addEvent('drag-enter', `拖拽进入 (${dragMode.value} 模式)`)
}

const handleDragLeave = () => {
  addEvent('drag-leave', `拖拽离开 (${dragMode.value} 模式)`)
}

// 初始化一些示例消息
addMessage('bot', '你好！我是智能助手。你可以发送消息或拖拽文件给我。')
addMessage('user', '你好！')
addMessage('bot', '有什么我可以帮助你的吗？')
</script>

<style scoped>
.demo-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.control-panel {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
  flex-wrap: wrap;
}

.control-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-item label {
  font-weight: 500;
  min-width: 80px;
}

/* 聊天容器样式 */
.chat-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.3s ease;
}

.chat-container.dragging {
  background: rgba(20, 118, 255, 0.02);
}

.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  max-height: 400px;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 14px;
  color: #999;
}

/* 消息样式 */
.message {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.message-avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.user-avatar {
  background: #007bff;
  color: white;
}

.bot-avatar {
  background: #f0f0f0;
}

.message-content {
  flex: 1;
  max-width: calc(100% - 44px);
}

.message-text {
  background: #f1f3f4;
  padding: 8px 12px;
  border-radius: 12px;
  margin-bottom: 4px;
  word-wrap: break-word;
}

.message-files {
  margin-top: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #e3f2fd;
  border-radius: 6px;
  margin-bottom: 4px;
  font-size: 14px;
}

.file-icon {
  font-size: 16px;
}

.file-name {
  font-weight: 500;
  color: #1976d2;
}

.file-size {
  color: #666;
  font-size: 12px;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

/* 拖拽指示器样式 */
.drag-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
  pointer-events: none;
}

.drag-indicator-content {
  background: rgba(0, 123, 255, 0.9);
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.drag-indicator-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.drag-indicator-text {
  font-size: 14px;
  font-weight: 500;
}

/* 全屏覆盖层样式 */
.fullscreen-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  pointer-events: none;
}

.fullscreen-overlay-content {
  text-align: center;
  padding: 40px;
  border: 2px dashed #1976d2;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.8);
}

.fullscreen-overlay-icon img {
  width: 64px;
  height: 64px;
  filter: brightness(0) saturate(100%) invert(44%) sepia(96%) saturate(1352%) hue-rotate(202deg) brightness(95%)
    contrast(95%);
  margin-bottom: 16px;
}

.fullscreen-overlay-title {
  font-size: 20px;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 12px;
}

.fullscreen-overlay-description {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #666;
  font-size: 14px;
}

/* 输入区域样式 */
.chat-input-area {
  padding: 12px 16px;
  border-top: 1px solid #e0e0e0;
  background: white;
}

.input-wrapper {
  display: flex;
  gap: 8px;
}

.input-wrapper input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
  font-size: 14px;
}

.input-wrapper input:focus {
  border-color: #007bff;
}

.input-wrapper button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.input-wrapper button:hover:not(:disabled) {
  background: #0056b3;
}

.input-wrapper button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 事件日志样式 */
.event-log {
  margin-top: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.event-log h3 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 16px;
}

.event-list {
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
  font-family: monospace;
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
