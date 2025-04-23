<script setup lang="ts">
// import { TrBubble, TrSender } from '@opentiny/tiny-robot'
import { ref } from 'vue'
import { AIClient } from '@opentiny/tiny-robot-ai-adapter'

const message = ref('')
const content = ref('hello')

// 发送消息并获取响应
async function chat(content) {
  // 创建客户端
  const client = new AIClient({
    provider: 'openai',
    defaultModel: 'gpt-3.5-turbo',
    apiUrl: location.origin + '/cdocs/tiny-robot/',
    // apiKey: 'your-api-key',
  })
  try {
    const response = await client.chat({
      messages: [{ role: 'user', content }],
      options: {
        temperature: 0.7,
      },
    })

    message.value = response.choices[0].message.content
  } catch (error) {
    console.error('聊天出错:', error)
  }
}
</script>

<template>
  <tr-bubble v-if="message" :content="message"></tr-bubble>
  <tr-sender v-model="content" @submit="chat(content)" class="chat-input"></tr-sender>
</template>

<style lang="less" scoped>
.chat-input {
  background-color: transparent;
}
</style>
