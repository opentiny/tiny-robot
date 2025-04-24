<template>
  <tr-feedback
    :operations="operations"
    @operation="handleOperation"
    :sources="sources"
    :actions="actions"
    @action="handleAction"
  ></tr-feedback>

  <hr />
</template>

<script setup lang="ts">
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

const handleOperation = (name: string) => {
  console.log('operation', name)
}

const handleAction = (name: string) => {
  console.log('action', name)
}
</script>
