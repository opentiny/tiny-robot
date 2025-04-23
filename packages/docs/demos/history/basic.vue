<template>
  <history
    class="tr-history-demo"
    :data="data"
    :tabs="tabs"
    :search-bar="true"
    :selected="selected"
    @item-click="handleItemClick"
    @item-title-change="handleItemTitleChange"
  />
</template>

<script setup lang="ts">
import { History, HistoryGroup, HistoryItem } from '@opentiny/tiny-robot'
import { reactive, ref } from 'vue'
const tabs = [
  { label: '历史对话', value: 'conversations' },
  { label: '历史任务', value: 'tasks' },
]

const selected = ref('2')

const data: Record<string, HistoryGroup[]> = reactive({
  conversations: [
    {
      date: '今天',
      items: [
        { title: '如何训练一只聪明的小狗', id: '1', tag: { text: '成功', type: 'success' } },
        { title: 'How to make a perfect soufflé', id: '2', tag: { text: '警告', type: 'warning' } },
        { title: 'The Art of Origami: Advanced Paper Folding', id: '3', tag: { text: '错误', type: 'error' } },
      ],
    },
    {
      date: '昨天',
      items: [
        {
          title:
            'This is a very long title that demonstrates how the history component handles lengthy conversation titles and ensures proper text wrapping',
          id: '4',
        },
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
})

const handleItemClick = (item: HistoryItem) => {
  selected.value = item.id
}

const handleItemTitleChange = (id: string, title: string, rawData: HistoryItem) => {
  console.log(id, title, rawData)
  rawData.title = title
}
</script>

<style lang="less" scoped>
.tr-history-demo {
  height: 400px;
}
</style>
