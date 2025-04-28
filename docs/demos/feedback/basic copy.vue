<template>
  <tr-feedback
    :operations="showOperations ? operations : undefined"
    :operations-limit="3"
    @operation="handleOperation"
    :actions="actions"
    :actions-limit="3"
    @action="handleAction"
    :sources="sources"
    :sources-lines-limit="1"
  ></tr-feedback>

  <hr />
  <tiny-button @click="showOperations = !showOperations" :reset-time="0">
    {{ showOperations ? '隐藏操作' : '显示操作' }}
  </tiny-button>
</template>

<script setup lang="ts">
import { IconButton, type FeedbackProps } from '@opentiny/tiny-robot'
import { IconArrowUp } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'

const operations = [
  { name: 'operation1', label: '操作一', onClick: () => console.log('单独监听点击事件', 'operation1') },
  { name: 'operation2', label: '操作二' },
  { name: 'operation3', label: '操作三' },
  { name: 'operation4', label: '操作四' },
  { name: 'operation5', label: '操作五' },
]

const showOperations = ref(true)

const handleOperation = (name: string) => {
  console.log('operation', name)
}

const actions: FeedbackProps['actions'] = [
  { name: 'refresh', label: '刷新', icon: 'refresh' },
  { name: 'copy', label: '复制', icon: 'copy' },
  // 自定义icon
  { name: 'arrow-up', label: '向上', icon: h(IconButton, { icon: IconArrowUp, tooltip: '向上' }) },
  { name: 'like', label: '推荐', icon: 'like' },
  { name: 'dislike', label: '不推荐', icon: 'dislike' },
  // 单独监听点击事件
  { name: 'arrow-down', label: '向下', onClick: () => console.log('单独监听点击事件', 'arrow-down') },
]

const handleAction = (name: string) => {
  console.log('action', name)
}

const sources = Array(6)
  .fill([
    { label: '来源1', link: 'https://www.baidu.com' },
    { label: '来源22', link: 'https://www.baidu.com' },
    { label: '来源3333333', link: 'https://www.baidu.com' },
  ])
  .flat()
</script>
