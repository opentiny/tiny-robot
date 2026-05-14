<script setup lang="ts">
import { h, shallowRef } from 'vue'
import { TrHistory } from '@opentiny/tiny-robot'
import { IconCheck, IconCopy, IconDelete } from '@opentiny/tiny-robot-svgs'

const selectedId = shallowRef<string | undefined>('2')

const historyItems = shallowRef([
  { title: '已选中会话', id: '1', icon: h(IconCheck, { style: { fontSize: '16px' } }) },
  { title: '已复制消息', id: '2', icon: h(IconCopy, { style: { fontSize: '16px' } }) },
  { title: '待删除记录', id: '3', icon: h(IconDelete, { style: { fontSize: '16px' } }) },
])

function handleItemClick(item: { id: string }) {
  selectedId.value = item.id
}
</script>

<template>
  <TrHistory :data="historyItems" :selected="selectedId" @item-click="handleItemClick" />
</template>
