<template>
  <div class="chat-container">
    <div class="chat-header">
      <h1>AI 助手</h1>
      <div class="stream-toggle">
        <span>流式响应</span>
        <tiny-switch v-model="useStream"></tiny-switch>
        <icon-full-screen class="full-screen-icon"></icon-full-screen>
      </div>
    </div>

    <!-- 需要替换为 TinyRobot Bubble组件-->
    <div class="chat-messages" ref="chatContainer">
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="['message', message.role === 'user' ? 'user-message' : 'assistant-message']"
      >
        <div class="message-content">
          <div class="message-avatar">
            <div class="avatar-icon">
              {{ message.role === 'user' ? '👤' : '🤖' }}
            </div>
          </div>
          <div class="message-bubble">
            <div class="message-text">{{ message.content }}</div>
            <div v-if="message.role === 'assistant' && index > 0" class="message-actions">
              <button class="action-button retry-button" @click="retryRequest(index)">
                <span class="retry-icon">↻</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="messageState.status === STATUS.PROCESSING" class="message assistant-message">
        <div class="message-content">
          <div class="message-avatar">
            <div class="avatar-icon">🤖</div>
          </div>
          <div class="message-bubble">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 需要替换为 TinyRobot InputBox组件-->
    <div class="chat-input">
      <textarea
        v-model="inputMessage"
        placeholder="输入消息..."
        @keydown="handleKeyDown"
        :disabled="messageState.status === STATUS.PROCESSING"
      ></textarea>
      <button v-if="GeneratingStatus.includes(messageState.status)" @click="abortRequest" class="abort-button">
        <span>停止</span>
      </button>
      <button v-else @click="sendMessage" :disabled="messageState.status === STATUS.PROCESSING || !inputMessage.trim()">
        <span>发送</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { TinySwitch } from '@opentiny/vue'
import { AIClient, useMessage, STATUS, GeneratingStatus } from '@opentiny/tiny-robot-ai-adapter'
import { IconFullScreen } from '@opentiny/tiny-robot-svgs'

const client = new AIClient({
  provider: 'openai',
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'your-api-key',
  defaultModel: 'gpt-3.5-turbo',
  apiUrl: 'http://localhost:3001/v1',
})

const { messages, messageState, inputMessage, useStream, sendMessage, abortRequest, retryRequest } = useMessage({
  client,
  useStreamByDefault: true,
  initialMessages: [
    {
      content: '你好！我是AI助手，有什么可以帮助你的吗？',
      role: 'assistant',
    },
  ],
})

watch(
  () => messages.value[messages.value.length - 1].content,
  () => {
    if (GeneratingStatus.includes(messageState.status)) {
      scrollToBottom()
    }
  },
)

const chatContainer = ref<HTMLElement | null>(null)

const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}
</script>

<style scoped lang="less">
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 900px;
  margin: 0 auto;
  background-color: #f5f5f5;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chat-header {
  background-color: #6daec2;
  color: white;
  padding: 15px 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .stream-toggle {
    display: flex;
    align-items: center;
    font-size: 0.9rem;
    span {
      margin-right: 8px;
    }
  }
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  margin-bottom: 8px;
}

.message-content {
  display: flex;
  max-width: 80%;
}

.user-message {
  justify-content: flex-end;

  .message-content {
    flex-direction: row-reverse;
  }

  .avatar-icon {
    background-color: #4a6cf7;
    color: white;
  }

  .message-bubble {
    background-color: #4a6cf7;
    color: white;
    border-top-right-radius: 4px;
  }
}

.assistant-message {
  .avatar-icon {
    background-color: #10b981;
    color: white;
  }

  .message-bubble {
    background-color: white;
    color: #333;
    border-top-left-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
}

.message-avatar {
  width: 40px;
  height: 40px;
  margin: 0 8px;
  flex-shrink: 0;
}

.avatar-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e0e0e0;
  border-radius: 50%;
  font-size: 20px;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
  word-break: break-word;
}

.message-text {
  line-height: 1.5;
  white-space: pre-wrap;
}

// 消息操作区域样式
.message-actions {
  position: absolute;
  right: 10px;
  bottom: -20px;
  display: flex;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 10;
}

.message-bubble:hover .message-actions {
  opacity: 1;
}

.action-button {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  cursor: pointer;
  margin-left: 5px;
  padding: 0;
  transition: all 0.2s ease;

  &:hover {
    background-color: #e0e0e0;
    transform: scale(1.1);
  }
}

.retry-button {
  background-color: #f8f9fa;
  color: #4a6cf7;

  &:hover {
    background-color: #e8f0fe;
    color: #3a5ce5;
  }
}

.retry-icon {
  font-size: 16px;
  font-weight: bold;
}

.chat-input {
  display: flex;
  padding: 15px;
  background-color: white;
  border-top: 1px solid #e0e0e0;
}

textarea {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 12px 16px;
  resize: none;
  height: 50px;
  font-family: inherit;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: #4a6cf7;
  }
}

button {
  margin-left: 10px;
  background-color: #4a6cf7;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 0 20px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;

  &:hover {
    background-color: #3a5ce5;
  }

  &:disabled {
    background-color: #a0a0a0;
    cursor: not-allowed;
  }
}

.abort-button {
  background-color: #e74c3c;

  &:hover {
    background-color: #c0392b;
  }
}

.typing-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;

  span {
    height: 8px;
    width: 8px;
    margin: 0 2px;
    background-color: #bbb;
    border-radius: 50%;
    display: inline-block;
    animation: typing 1.4s infinite ease-in-out both;

    &:nth-child(1) {
      animation-delay: 0s;
    }

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

@keyframes typing {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}
.full-screen-icon {
  width: 20px;
  height: 20px;
}
</style>
