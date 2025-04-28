<template>
  <tr-feedback
    :operations="operations"
    :operations-limit="3"
    @operation="handleOperation"
    :actions="actions"
    :actions-limit="3"
    @action="handleAction"
  ></tr-feedback>
</template>

<script setup lang="ts">
import { IconButton, type FeedbackProps } from '@opentiny/tiny-robot'
import { IconPin } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const operations: FeedbackProps['operations'] = [
  {
    name: 'edit',
    label: '编辑',
  },
  {
    name: 'delete',
    label: '删除',
  },
]

const handleOperation = (name: string) => {
  console.log('operation', name)
}

const actions: FeedbackProps['actions'] = [
  { name: 'refresh', label: '刷新', icon: 'refresh' },
  { name: 'copy', label: '复制', icon: 'copy' },
  { name: 'pin', label: '置顶', icon: h(IconButton, { icon: IconPin, tooltip: '置顶' }) },
  { name: 'like', label: '推荐', icon: 'like' },
  { name: 'dislike', label: '不推荐', icon: 'dislike' },
  { name: 'pin2', label: '置顶2', icon: h(IconButton, { icon: IconPin, tooltip: '置顶' }) },
]

const handleAction = (name: string) => {
  console.log('action', name)
}
</script>
