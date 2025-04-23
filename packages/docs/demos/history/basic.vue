<template>
  <history class="tr-history-demo" :data="data" :tabs="tabs" :selected="selected" />
</template>

<script setup lang="ts">
import { History, HistoryGroup } from '@opentiny/tiny-robot'
import { ref } from 'vue'
const tabs = [
  { label: '历史对话', value: 'conversations' },
  { label: '历史任务', value: 'tasks' },
]

const selected = ref('2')

const data: Record<string, HistoryGroup[]> = {
  conversations: [
    {
      date: '今天',
      items: [
        { title: '历史对话默认', id: '1' },
        { title: '历史对话默认', id: '2' },
        { title: '历史对话被选中', id: '3' },
      ],
    },
    {
      date: '昨天',
      items: [
        { title: '历史对话默认', id: '4' },
        { title: '历史对话默认', id: '5' },
        { title: '历史对话hover', id: '6' },
      ],
    },
    {
      date: '5月13日',
      items: [
        { title: '历史对话默认', id: '7' },
        { title: '历史对话默认', id: '8' },
      ],
    },
    { date: '5月12日', items: [] },
  ],
  tasks: [],
}
</script>

<style lang="less" scoped>
.tr-history-demo {
  height: 400px;
}
</style>
