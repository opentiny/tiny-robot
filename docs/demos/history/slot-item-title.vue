<template>
  <tr-history
    :data="data"
    :selected="selected"
    :show-rename-controls="isTouchDevice"
    rename-control-on-click-outside="cancel"
    @item-click="(item) => (selected = item.id)"
    @item-title-change="(newTitle, item) => (item.title = newTitle)"
    @item-action="(item) => console.log(item)"
  >
    <template #item-title="{ item }">
      <span class="item" :title="item.title">{{ item.title }}</span>
    </template>
  </tr-history>
</template>

<script setup lang="ts">
import { TrHistory, useTouchDevice } from '@opentiny/tiny-robot'
import { reactive, ref } from 'vue'

const { isTouchDevice } = useTouchDevice()

const data = reactive([
  { title: '如何训练一只聪明的小狗', id: '1' },
  { title: 'How to make a perfect soufflé', id: '2' },
  { title: 'The Art of Origami: Advanced Paper Folding', id: '3' },
])

const selected = ref<string | undefined>('2')
</script>

<style scoped>
.item {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-style: italic;
}
</style>
