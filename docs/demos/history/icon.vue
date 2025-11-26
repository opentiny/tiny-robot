<template>
  <tr-history
    :data="data"
    :selected="selected"
    :show-rename-controls="isTouchDevice"
    rename-control-on-click-outside="cancel"
    @item-click="(item) => (selected = item.id)"
    @item-title-change="(newTitle, item) => (item.title = newTitle)"
    @item-action="(item) => console.log(item)"
  />
</template>

<script setup lang="ts">
import { TrHistory, useTouchDevice } from '@opentiny/tiny-robot'
import { IconCheck, IconCopy, IconDelete } from '@opentiny/tiny-robot-svgs'
import { h, reactive, ref } from 'vue'

const { isTouchDevice } = useTouchDevice()

const data = reactive([
  { title: '如何训练一只聪明的小狗', id: '1', icon: h(IconCheck, { style: { fontSize: '16px' } }) },
  { title: 'How to make a perfect soufflé', id: '2', icon: h(IconCopy, { style: { fontSize: '16px' } }) },
  {
    title: 'The Art of Origami: Advanced Paper Folding',
    id: '3',
    icon: h(IconDelete, { style: { fontSize: '16px' } }),
  },
])

const selected = ref<string | undefined>('2')
</script>
