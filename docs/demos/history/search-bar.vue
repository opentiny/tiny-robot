<template>
  <tr-history
    class="tr-history-demo"
    tab-title="历史对话"
    :search-bar="true"
    search-placeholder="自定义搜索"
    :search-query="searchQuery"
    :search-fn="searchFn"
    :data="data"
  />
</template>

<script setup lang="ts">
import { HistoryGroup, HistoryItem } from '@opentiny/tiny-robot'
import { reactive, ref } from 'vue'

const searchQuery = ref('')

const searchFn = (query: string, item: HistoryItem) => {
  console.log('searching')
  return item.title.toLowerCase().includes(query.toLowerCase())
}

const data: HistoryGroup[] = reactive([
  {
    date: '今天',
    items: [
      { title: '如何训练一只聪明的小狗', id: '1' },
      { title: 'How to make a perfect soufflé', id: '2' },
      { title: 'The Art of Origami: Advanced Paper Folding', id: '3' },
    ],
  },
])
</script>

<style lang="less" scoped>
.tr-history-demo {
  height: 400px;
}
</style>
