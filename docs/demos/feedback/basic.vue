<template>
  <tr-feedback
    :operations="showOperations ? operations : undefined"
    :actions="actions"
    :sources="sources"
    @operation="handleOperation"
    @action="handleAction"
  />
  <hr />
  <tiny-button @click="showOperations = !showOperations" :reset-time="0">
    {{ showOperations ? '隐藏操作' : '显示操作' }}
  </tiny-button>
</template>

<script setup lang="ts">
import { FeedbackProps, TrFeedback } from '@opentiny/tiny-robot'
import { TinyButton } from '@opentiny/vue'
import { ref } from 'vue'

const operations: FeedbackProps['operations'] = [
  {
    name: 'edit',
    label: '编辑',
    onClick: () => console.log('点击了编辑按钮'),
  },
  {
    name: 'delete',
    label: '删除',
  },
]

const showOperations = ref(true)

const actions: FeedbackProps['actions'] = [
  {
    name: 'copy',
    label: '复制',
    icon: 'copy',
  },
  {
    name: 'refresh',
    label: '刷新',
    icon: 'refresh',
  },
]

const sources: FeedbackProps['sources'] = [
  {
    label: '数据来源1',
    link: 'https://example.com/source1',
  },
  {
    label: '数据来源2',
    link: 'https://example.com/source2',
  },
]

const handleOperation = (name: string) => {
  console.log('操作:', name)
}

const handleAction = (name: string) => {
  console.log('动作:', name)
}
</script>
