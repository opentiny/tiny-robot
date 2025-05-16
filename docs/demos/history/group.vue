<template>
  <tr-history
    class="tr-history-demo"
    tab-title="历史对话"
    :data="data"
    :selected="selected"
    @item-click="handleItemClick"
    @close="handleClose"
  />
</template>

<script setup lang="ts">
import { HistoryGroup, HistoryItem } from '@opentiny/tiny-robot'
import { reactive, ref } from 'vue'

const selected = ref('2')

const data: HistoryGroup[] = reactive([
  {
    group: '今天',
    items: [
      { title: '如何训练一只聪明的小狗', id: '1' },
      { title: 'How to make a perfect soufflé', id: '2' },
      { title: 'The Art of Origami: Advanced Paper Folding', id: '3' },
    ],
  },
  {
    group: '昨天',
    items: [
      {
        title:
          'This is a very long title that demonstrates how the history component handles lengthy conversation titles and ensures proper text wrapping',
        id: '4',
      },
      { title: '历史对话5', id: '5' },
      { title: '历史对话6', id: '6' },
    ],
  },
  {
    group: '5月13日',
    items: [
      { title: '历史对话7', id: '7' },
      { title: '历史对话8', id: '8' },
    ],
  },
  { group: '5月12日', items: [] },
])

const handleItemClick = (item: HistoryItem) => {
  selected.value = item.id
}

const handleClose = () => {
  alert('close')
}
</script>

<style lang="less" scoped>
.tr-history-demo {
  height: 400px;
}
</style>
