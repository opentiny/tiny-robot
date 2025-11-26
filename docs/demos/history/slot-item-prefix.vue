<template>
  <div style="display: flex; align-items: center; gap: 4px">
    <label>全选</label>
    <input type="checkbox" v-model="allSelection" :indeterminate="isIndeterminate" />
  </div>
  <hr />
  <tr-history
    :data="data"
    :selected="selected"
    :show-rename-controls="isTouchDevice"
    rename-control-on-click-outside="cancel"
    @item-click="(item) => (selected = item.id)"
    @item-title-change="(newTitle, item) => (item.title = newTitle)"
    @item-action="(item) => console.log(item)"
  >
    <template #item-prefix="{ item }">
      <input type="checkbox" v-model="multipleSelection" :value="item.id" @click.stop />
    </template>
  </tr-history>
  <hr />
  <div>
    <div>
      <label>已选：</label>
      <span>{{ multipleSelection.length }} 项</span>
    </div>
    <ul>
      <li v-for="id in multipleSelection" :key="id">
        <span>{{ data.find((item) => item.id === id)?.title }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { TrHistory, useTouchDevice } from '@opentiny/tiny-robot'
import { computed, reactive, ref } from 'vue'

const { isTouchDevice } = useTouchDevice()

const data = reactive([
  { title: '如何训练一只聪明的小狗', id: '1' },
  { title: 'How to make a perfect soufflé', id: '2' },
  { title: 'The Art of Origami: Advanced Paper Folding', id: '3' },
])

const selected = ref<string | undefined>('2')

const multipleSelection = ref<string[]>([])

const allSelection = computed({
  get() {
    return data.every((item) => multipleSelection.value.includes(item.id))
  },
  set(value) {
    if (value) {
      multipleSelection.value = data.map((item) => item.id)
    } else {
      multipleSelection.value = []
    }
  },
})

const isIndeterminate = computed(() => {
  const selectedCount = multipleSelection.value.length
  return selectedCount > 0 && selectedCount < data.length
})
</script>

<style scoped></style>
