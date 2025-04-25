<template>
  <tr-feedback
    :operations="showOperations ? operations : undefined"
    @operation="handleOperation"
    :sources="sources"
    :actions="actions"
    @action="handleAction"
  ></tr-feedback>

  <hr />
  <tiny-button @click="showOperations = !showOperations">
    {{ showOperations ? '隐藏操作' : '显示操作' }}
  </tiny-button>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const operations = [
  { name: 'operation1', label: '操作一' },
  { name: 'operation2', label: '操作二' },
  { name: 'operation3', label: '操作三' },
]

const sources = [
  { label: '来源1', link: 'https://www.baidu.com' },
  { label: '来源2', link: 'https://www.baidu.com' },
  { label: '来源3', link: 'https://www.baidu.com' },
]

const actions = [
  { name: 'refresh', label: '刷新', icon: 'refresh' },
  { name: 'copy', label: '复制', icon: 'copy' },
  { name: 'like', label: '推荐', icon: 'like' },
  { name: 'dislike', label: '不推荐', icon: 'dislike' },
]

const showOperations = ref(true)

const handleOperation = (name: string) => {
  console.log('operation', name)
}

const handleAction = (name: string) => {
  console.log('action', name)
}
</script>
