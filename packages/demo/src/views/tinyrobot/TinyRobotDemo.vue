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
      <tiny-bubble-item
        v-for="(message, index) in messages"
        :key="index"
        :role="message.role === 'user' ? 'user' : 'ai'"
        :content="message.content"
      ></tiny-bubble-item>

      <tiny-bubble-item v-if="messageState.isLoading" role="ai" status="loading"></tiny-bubble-item>
    </div>

    <!-- 需要替换为 TinyRobot InputBox组件-->
    <div class="chat-input">
      <textarea
        v-model="inputMessage"
        placeholder="输入消息..."
        @keydown="handleKeyDown"
        :disabled="messageState.isLoading"
      ></textarea>
      <button v-if="messageState.isResponding" @click="abortRequest" class="abort-button">
        <span>停止</span>
      </button>
      <button v-else @click="sendMessage" :disabled="messageState.isLoading || !inputMessage.trim()">
        <span v-if="!messageState.isLoading">发送</span>
        <span v-else>发送中...</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { TinySwitch } from '@opentiny/vue'
import { AIClient, useMessage } from '@opentiny/tiny-robot-ai-adapter'
import { TinyBubbleItem } from '@opentiny/tiny-robot'
import { IconFullScreen } from '@opentiny/tiny-robot-svgs'

const client = new AIClient({
  provider: 'openai',
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'your-api-key',
  defaultModel: 'gpt-3.5-turbo',
  apiUrl: 'http://localhost:3001/v1',
})

const { messages, messageState, inputMessage, useStream, sendMessage, abortRequest } = useMessage({
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
    if (messageState.isResponding) {
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
