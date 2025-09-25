const mockTemplates = [
  {
    type: 'hello',
    templates: [
      '你好！我是TinyRobot搭建的AI助手。你可以问我任何问题，我会尽力回答。',
    ],
    condition: (lastMessage) => lastMessage.includes('你好') || lastMessage.includes('hello'),
  },
  {
    type: 'code',
    templates: [
      '这里是一段JS示例代码：\n```javascript\nfunction example() {\n  console.log("Hello World");\n}\n```\n这段代码展示了基本的函数定义。',
      '这里是一段Vue示例代码：\n```vue\n<template>\n  <div>\n      <tiny-button type="primary"> 主要按钮 </tiny-button>\n      <tiny-button type="success"> 成功按钮 </tiny-button>\n  </div>\n</template>\n\n<script setup>\nimport { TinyButton } from \'@opentiny/vue\'\n</script>\n\n<style scoped>\n.tiny-button {\n  margin-bottom: 10px;\n  margin-left: 0;\n  margin-right: 24px;\n}\n</style>\n\n```\n这段代码展示TinyVue Button组件的基本使用。',
    ],
    condition: (lastMessage) => lastMessage.includes('代码') || lastMessage.includes('code'),
  },
  {
    type: 'list',
    templates: [
      '以下是使用TinyCLI创建自己的专属低代码设计器主要步骤：\n1. 执行engine-cli create\n2. 安装依赖 pnpm i  \n3. 启动项目 pnpm dev  \n4. 预览页面测试验证',
    ],
    condition: (lastMessage) => lastMessage.includes('列表') || lastMessage.includes('步骤'),
  },
  {
    type: 'default',
    templates: [
      `这是对 "{{lastMessage}}" 的模拟回复。`
    ],
    condition: () => true,
  },
]

const getMockData = (messages) => {
  const lastMessage = messages[messages.length - 1].content.toLowerCase()

  const templates = mockTemplates.find((template) => template.condition(lastMessage))
  const randomIndex = Math.floor(Math.random() * templates.templates.length)
  const template = templates.templates[randomIndex]
  return template.replace('{{lastMessage}}', lastMessage)
}

function generateStreamResponse(body) {
  const mockData = getMockData(body.messages)
  const responseParts = mockData.split('')

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode('data: {}\n\n'))

      await new Promise((resolve) => setTimeout(resolve, 300))

      for (let i = 0; i < responseParts.length; i++) {
        const part = responseParts[i]
        const data = {
          id: 'mock-' + Date.now(),
          object: 'chat.completion.chunk',
          created: Math.floor(Date.now() / 1000),
          model: body.model || 'gpt-3.5-turbo',
          choices: [
            {
              index: 0,
              delta: {
                content: part,
              },
              finish_reason: i === responseParts.length - 1 ? 'stop' : null,
            },
          ],
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))

        await new Promise((resolve) => setTimeout(resolve, Math.random() * 100 + 50))
      }

      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'TR-Mocked-Response': 'true',
    },
  })
}

const encoder = new TextEncoder()

function generateMockResponse(body) {
  const responseText = getMockData(body.messages)

  const mockData = {
    id: 'mock-' + Date.now(),
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: body.model || 'gpt-3.5-turbo',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: responseText,
        },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: 10,
      completion_tokens: 20,
      total_tokens: 30,
    },
  }

  const delay = Math.random() * 1000 + 500

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        new Response(JSON.stringify(mockData), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-Mocked-Response': 'true',
          },
        }),
      )
    }, delay)
  })
}

function generateResponse(event) {
  return event.request.json().then((body) => {
    if (body.stream) {
      return generateStreamResponse(body)
    } else {
      return generateMockResponse(body)
    }
  }).catch(() => {
    return fetch(event.request)
  })
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  //拦截 /chat/completition 的 POST 请求
  if (event.request.method === 'POST' && url.pathname.endsWith('chat/completions')) {
    event.respondWith(generateResponse(event))
  }
})

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})
