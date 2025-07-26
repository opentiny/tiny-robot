<template>
  <TrDropdownMenu v-model:show="clickShow" :items="dropdownMenuItems" @item-click="(item) => console.log(item)">
    <template #trigger>
      <TrSuggestionPillButton> Trigger 为 click </TrSuggestionPillButton>
    </template>
  </TrDropdownMenu>
  <hr />
  <TrDropdownMenu
    :items="dropdownMenuItems"
    :show="show"
    trigger="manual"
    @item-click="(item) => console.log(item)"
    @click-outside="handleClickOutside"
  >
    <template #trigger>
      <TrSuggestionPillButton @click="show = !show"> Trigger 为 manual </TrSuggestionPillButton>
    </template>
  </TrDropdownMenu>
  <hr />
  <div style="display: flex; gap: 10px">
    <TrDropdownMenu
      v-model:show="hoverShow"
      :items="dropdownMenuItems"
      trigger="hover"
      @item-click="(item) => console.log(item)"
      append-to="#app"
    >
      <template #trigger>
        <TrSuggestionPillButton> Trigger 为 hover </TrSuggestionPillButton>
      </template>
    </TrDropdownMenu>
    <TrDropdownMenu :items="dropdownMenuItems" trigger="hover" @item-click="(item) => console.log(item)">
      <template #trigger>
        <TrSuggestionPillButton> Trigger 为 hover </TrSuggestionPillButton>
      </template>
    </TrDropdownMenu>
  </div>
  <hr />
  <div style="display: flex; gap: 10px; flex-direction: column; align-items: flex-start">
    <button @click="clickShow = true">点我打开Trigger为click</button>
    <button @click="hoverShow = !hoverShow">点我切换Trigger为hover</button>
  </div>
  <hr />
  <div style="display: flex; gap: 10px; flex-direction: column; align-items: flex-start">
    <button @click="addDropdownMenu">新增菜单项</button>
    <button @click="removeDropdownMenu">删除菜单项</button>
  </div>
</template>

<script setup lang="ts">
import { TrDropdownMenu, TrSuggestionPillButton } from '@opentiny/tiny-robot'
import { ref } from 'vue'

const dropdownMenuItems = ref([
  { id: '1', text: '去续费' },
  { id: '2', text: '去退订' },
  { id: '3', text: '查账单' },
  { id: '4', text: '导账单' },
  { id: '5', text: '对帐单' },
])

const show = ref(false)
const clickShow = ref(false)
const hoverShow = ref(false)

const handleClickOutside = (ev: MouseEvent) => {
  console.log('click-outside', ev)
}

const addDropdownMenu = () => {
  dropdownMenuItems.value.push({ id: String(dropdownMenuItems.value.length + 1), text: '新增' })
}

const removeDropdownMenu = () => {
  dropdownMenuItems.value.pop()
}
</script>
