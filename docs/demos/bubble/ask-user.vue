<template>
  <div class="ask-user-demo">
    <TrBubble :content="message.content" :state="message.state" @state-change="handleStateChange" />
  </div>
</template>

<script setup lang="ts">
import { TrBubble, type AskUserContent, type AskUserState, type BubbleMessage } from '@opentiny/tiny-robot'
import { ref } from 'vue'

const content: AskUserContent = {
  type: 'ask_user',
  id: 'project-setup',
  title: '提供详细的问题',
  description: '请完成以下步骤，提交后业务层可以继续处理。',
  steps: [
    {
      id: 'framework',
      title: '选择框架',
      type: 'single',
      required: true,
      options: [
        { label: 'Vue', value: 'vue', description: '适合构建响应式 Web 界面。' },
        { label: 'React', value: 'react', description: '适合构建组件化应用。' },
      ],
    },
    {
      id: 'features',
      title: '选择功能',
      type: 'multiple',
      required: true,
      options: [
        { label: 'TypeScript', value: 'typescript' },
        { label: '自动化测试', value: 'test' },
        { label: '国际化', value: 'i18n' },
      ],
    },
    {
      id: 'notes',
      title: '补充说明',
      type: 'text',
      placeholder: '输入项目的其他要求（可选）',
    },
    {
      id: 'confirm',
      title: '确认配置',
      type: 'confirm',
      required: true,
    },
  ],
}

const message = ref<BubbleMessage<AskUserContent[], { askUser?: AskUserState }>>({
  role: 'assistant',
  content: [content],
  state: {},
})
const handleStateChange = (payload: { key: string; value: unknown }) => {
  message.value.state = {
    ...message.value.state,
    [payload.key]: payload.value,
  }
}
</script>

<style scoped>
.ask-user-demo {
  display: block;
}
</style>
