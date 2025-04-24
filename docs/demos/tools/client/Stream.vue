<script setup lang="ts">
// import { TrBubble, TrSender } from '@opentiny/tiny-robot'
import { ref } from 'vue'
import { AIClient } from '@opentiny/tiny-robot-kit'

const message = ref('')
const content = ref('hello')

let controller: AbortController | null

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
    controller = new AbortController()
    await client.chatStream(
      {
        messages: [{ role: 'user', content }],
        options: {
          signal: controller.signal, // 传递 AbortController 的 signal用于中断请求
          temperature: 0.7,
        },
      },
      {
        onData: (data) => {
          // 处理流式数据
          const content = data.choices[0]?.delta?.content || ''
          message.value += content
        },
        onError: (error) => {
          console.error('流式响应错误:', error)
          controller = null
        },
        onDone: () => {
          console.log('\n流式响应完成')
          controller = null
        },
      },
    )
  } catch (error) {
    console.error('聊天出错:', error)
  }
}

function abortRequest() {
  if (controller) {
    controller.abort()
    controller = null
  }
}
</script>

<template>
  <tr-bubble v-if="message" :content="message"></tr-bubble>
  <tr-sender class="chat-input" v-model="content" @submit="chat(content)" @cancel="abortRequest"></tr-sender>
</template>

<style lang="less" scoped>
.chat-input {
  background-color: transparent;
}
</style>
