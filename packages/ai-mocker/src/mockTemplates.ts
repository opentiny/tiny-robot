import type { ChatCompletionRequestMessage } from './types'

// 模拟响应模板
const mockTemplates = {
  code: [
    '这里是一段JS示例代码：\n```javascript\nfunction example() {\n  console.log("Hello World");\n}\n```\n这段代码展示了基本的函数定义。',
    '这里是一段Vue示例代码：\n```vue\n<template>\n  <div>\n      <tiny-button type="primary"> 主要按钮 </tiny-button>\n      <tiny-button type="success"> 成功按钮 </tiny-button>\n  </div>\n</template>\n\n<script setup>\nimport { TinyButton } from \'@opentiny/vue\'\n</script>\n\n<style scoped>\n.tiny-button {\n  margin-bottom: 10px;\n  margin-left: 0;\n  margin-right: 24px;\n}\n</style>\n\n```\n这段代码展示TinyVue Button组件的基本使用。',
  ],
  list: [
    '以下是使用TinyCLI创建自己的专属低代码设计器主要步骤：\n1. 执行engine-cli create\n2. 安装依赖 pnpm i  \n3. 启动项目 pnpm dev  \n4. 预览页面测试验证',
  ],
  default: [
    (messages: ChatCompletionRequestMessage[]): string => {
      const lastMessage = messages[messages.length - 1]
      return `这是对 "${lastMessage.content}" 的模拟回复。`
    },
  ],
}

// 生成模拟响应
export const generateMockResponse = (messages: ChatCompletionRequestMessage[]): string => {
  const lastMessage = messages[messages.length - 1]
  const content = lastMessage.content.toLowerCase()

  // 根据输入内容特征选择响应类型
  let responseType: keyof typeof mockTemplates
  if (content.includes('代码') || content.includes('code')) {
    responseType = 'code'
  } else if (content.includes('列表') || content.includes('步骤')) {
    responseType = 'list'
  } else {
    responseType = 'default'
  }

  // 从选定类型中随机选择一个响应
  const templates = mockTemplates[responseType]
  const randomIndex = Math.floor(Math.random() * templates.length)
  return typeof templates[randomIndex] === 'function'
    ? (templates[randomIndex] as (msg: ChatCompletionRequestMessage[]) => string)(messages)
    : String(templates[randomIndex])
}
