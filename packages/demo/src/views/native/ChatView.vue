<template>
  <div class="chat-container">
    <div class="chat-header">
      <h1>AI 助手</h1>
    </div>
    
    <div class="chat-messages" ref="chatContainer">
      <div 
        v-for="message in messages" 
        :key="message.id" 
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
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>
      </div>
      
      <div v-if="isLoading" class="message assistant-message">
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
    
    <div class="chat-input">
      <textarea 
        v-model="inputMessage" 
        placeholder="输入消息..." 
        @keydown="handleKeyDown"
        :disabled="isLoading"
      ></textarea>
      <button @click="sendMessage" :disabled="isLoading || !inputMessage.trim()">
        <span v-if="!isLoading">发送</span>
        <span v-else>发送中...</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
}

const messages = ref<Message[]>([]);
const inputMessage = ref('');
const isLoading = ref(false);
const chatContainer = ref<HTMLElement | null>(null);

// 生成唯一ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return;
  
  // 添加用户消息
  const userMessage: Message = {
    id: generateId(),
    content: inputMessage.value,
    role: 'user',
    timestamp: Date.now()
  };
  
  messages.value.push(userMessage);
  const userInput = inputMessage.value;
  inputMessage.value = '';
  
  // 滚动到底部
  await nextTick();
  scrollToBottom();
  
  // 显示加载状态
  isLoading.value = true;
  
  try {
    // 调用AI接口
    const response = await fetch('http://localhost:3001/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userInput,
        history: messages.value.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      }),
    });
    
    // 模拟接口延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 假设接口返回JSON格式的响应
    // const data = await response.json();
    
    // 由于使用mock接口，这里直接模拟响应
    const aiResponse: Message = {
      id: generateId(),
      content: `您好！我是AI助手。您说的是："${userInput}"。我能帮您解答问题、提供信息或者聊天。请问还有什么我可以帮您的吗？`,
      role: 'assistant',
      timestamp: Date.now()
    };
    
    messages.value.push(aiResponse);
    
    // 滚动到底部
    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error('Error fetching AI response:', error);
    // 添加错误消息
    messages.value.push({
      id: generateId(),
      content: '抱歉，连接AI服务时出现了问题，请稍后再试。',
      role: 'assistant',
      timestamp: Date.now()
    });
  } finally {
    isLoading.value = false;
  }
};

// 滚动到底部
const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

// 格式化时间
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// 处理按键事件
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
};

// 添加初始欢迎消息
onMounted(() => {
  messages.value.push({
    id: generateId(),
    content: '你好！我是AI助手，有什么可以帮助你的吗？',
    role: 'assistant',
    timestamp: Date.now()
  });
});
</script>



<style scoped>
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
  background-color: #4a6cf7;
  color: white;
  padding: 15px 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chat-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
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
}

.user-message .message-content {
  flex-direction: row-reverse;
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

.user-message .avatar-icon {
  background-color: #4a6cf7;
  color: white;
}

.assistant-message .avatar-icon {
  background-color: #10b981;
  color: white;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
  word-break: break-word;
}

.user-message .message-bubble {
  background-color: #4a6cf7;
  color: white;
  border-top-right-radius: 4px;
}

.assistant-message .message-bubble {
  background-color: white;
  color: #333;
  border-top-left-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.message-text {
  line-height: 1.5;
  white-space: pre-wrap;
}

.message-time {
  font-size: 0.7rem;
  opacity: 0.7;
  margin-top: 4px;
  text-align: right;
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
}

textarea:focus {
  border-color: #4a6cf7;
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
}

button:hover {
  background-color: #3a5ce5;
}

button:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}

.typing-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
}

.typing-indicator span {
  height: 8px;
  width: 8px;
  margin: 0 2px;
  background-color: #bbb;
  border-radius: 50%;
  display: inline-block;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0% {
    transform: scale(1);
    opacity: 0.4;
  }
  20% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.4;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message-content {
    max-width: 90%;
  }
  
  .chat-header h1 {
    font-size: 1.2rem;
  }
  
  .message-avatar {
    width: 32px;
    height: 32px;
  }
}
</style>