<template>
  <tr-feedback
    :operations="operations"
    :operations-limit="3"
    :actions="actions"
    :actions-limit="3"
    :sources="sources"
    :sources-lines-limit="1"
    @operation="handleOperation"
    @action="handleAction"
  />
  <hr />
</template>

<script setup lang="ts">
import { type FeedbackProps } from '@opentiny/tiny-robot'

const operations: FeedbackProps['operations'] = [
  { name: 'operation1', label: '操作一', onClick: () => console.log('单独监听点击事件', 'operation1') },
  { name: 'operation2', label: '操作二' },
  { name: 'operation3', label: '操作三' },
  { name: 'operation4', label: '操作四' },
  { name: 'operation5', label: '操作五' },
]

const actions: FeedbackProps['actions'] = [
  { name: 'refresh', label: '刷新', icon: 'refresh' },
  { name: 'copy', label: '复制', icon: 'copy' },
  { name: 'like', label: '推荐', icon: 'like' },
  { name: 'dislike', label: '不推荐', icon: 'dislike' },
]

const sources = Array(6)
  .fill([
    { label: '来源1', link: 'https://www.baidu.com' },
    { label: '来源22', link: 'https://www.baidu.com' },
    { label: '来源3333333', link: 'https://www.baidu.com' },
  ])
  .flat()

const handleOperation = (name: string) => {
  console.log('操作:', name)
}

const handleAction = (name: string) => {
  console.log('动作:', name)
}
</script>
