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
import { HistoryItem } from '@opentiny/tiny-robot'
import { reactive, ref } from 'vue'

const selected = ref('2')

const data: HistoryItem[] = reactive([
  { title: '如何训练一只聪明的小狗', id: '1' },
  { title: 'How to make a perfect soufflé', id: '2' },
  { title: 'The Art of Origami: Advanced Paper Folding', id: '3' },
  {
    title:
      'This is a very long title that demonstrates how the history component handles lengthy conversation titles and ensures proper text wrapping',
    id: '4',
  },
  { title: '历史对话5', id: '5' },
  { title: '历史对话6', id: '6' },
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
