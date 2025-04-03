<template>
  <div class="chat-container">
    <div class="chat-header">
      <h1>AI 助手</h1>
      <div class="stream-toggle">
        <span>流式响应</span>
        <tiny-switch v-model="useStreamResponse"></tiny-switch>
      </div>
    </div>

    <!-- 需要替换为 TinyRobot Bubble组件-->
    <div class="chat-messages" ref="chatContainer">
      <div 
        v-for="message in messages" 
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
    
    <!-- 需要替换为 TinyRobot InputBox组件-->
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
import { ref, onMounted, nextTick, toRaw } from 'vue'
import { TinySwitch } from '@opentiny/vue';
import { AIClient, type ChatCompletionResponse, type ChatMessage } from '@opentiny/tiny-robot-ai-adapter';

const messages = ref<ChatMessage[]>([]);
const inputMessage = ref('');
const isLoading = ref(false);
const chatContainer = ref<HTMLElement | null>(null);
const useStreamResponse = ref(true); // 流式响应开关状态

const client = new AIClient({
  provider: 'openai',
  apiKey: 'your-api-key',
  defaultModel: 'gpt-3.5-turbo',
  apiUrl: 'http://localhost:3001/v1'
});

const handleMessageResponse = async () => {
  try {
    const response: ChatCompletionResponse  = await client.chat({
      messages: messages.value,
    });
    messages.value.push(response.choices[0].message);
    
    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error('Error fetching AI response:', error);
  } finally {
    isLoading.value = false;
  }
};

const handleStreamMessageResponse = async () => {
  await client.chatStream({ messages: toRaw(messages.value) }, {
    onData: async (data) => {
      isLoading.value = false;
      if (data.choices[0].delta.content) {
        if (messages.value[messages.value.length - 1].role !== 'assistant') {
          messages.value.push({ content: '', role: 'assistant' });
        }
        messages.value[messages.value.length - 1].content += data.choices[0].delta.content;
        await nextTick();
        scrollToBottom();
      }
    },
    onError: (error) => {
      console.error('Error fetching AI response:', error);
    },
    onDone: () => {
      isLoading.value = false;
    },
  });
};

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return;
  
  const userMessage: ChatMessage = {
    content: inputMessage.value,
    role: 'user',
  };
  messages.value.push(userMessage);
  inputMessage.value = '';
  
  await nextTick();
  scrollToBottom();
  
  isLoading.value = true;
  
  if (useStreamResponse.value) {
    await handleStreamMessageResponse(); // 流式请求
  } else {
    await handleMessageResponse();  // 普通请求
  }
};

const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
};

onMounted(() => {
  messages.value.push({
    content: '你好！我是AI助手，有什么可以帮助你的吗？',
    role: 'assistant',
  });
});
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
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
</style>
