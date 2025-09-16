<template>
  <tr-history
    :data="data"
    :selected="selected"
    :menu-items="menuItems"
    @item-click="(item) => (selected = item.id)"
    @item-title-change="(newTitle, item) => (item.title = newTitle)"
    @item-action="(action, item) => handleAction(action, item)"
  />
</template>

<script setup lang="ts">
import { TrHistory } from '@opentiny/tiny-robot'
import { IconEditPen, IconDelete, IconCopy } from '@opentiny/tiny-robot-svgs'
import { reactive, ref } from 'vue'

const data = reactive([
  { title: '如何训练一只聪明的小狗', id: '1' },
  { title: 'How to make a perfect soufflé', id: '2' },
  { title: 'The Art of Origami: Advanced Paper Folding', id: '3' },
  { title: '历史对话4', id: '4' },
  { title: '历史对话5', id: '5' },
])

const selected = ref<string | undefined>('2')

// 自定义菜单项
const menuItems = [
  { id: 'rename', text: '重命名', icon: IconEditPen },
  { id: 'copy', text: '复制', icon: IconCopy },
  { id: 'delete', text: '删除', icon: IconDelete },
]

const handleAction = (action: { id: string; text: string }, item: { id?: string; title: string }) => {
  console.log(`执行操作: ${action.text}`, { action, item })

  switch (action.id) {
    case 'rename':
      // 重命名逻辑
      break
    case 'copy':
      // 复制逻辑
      break
    case 'delete':
      // 删除逻辑
      break
  }
}
</script>

<style lang="less" scoped></style>
