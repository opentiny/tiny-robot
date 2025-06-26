<template>
  <TrDropdownMenu :items="dropdownMenuItems" @item-click="(item) => console.log(item)">
    <template #trigger>
      <TrSuggestionPillButton> 点我打开Dropdown Menu </TrSuggestionPillButton>
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
    <TrDropdownMenu :items="dropdownMenuItems" trigger="hover" @item-click="(item) => console.log(item)">
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

const handleClickOutside = (ev: MouseEvent) => {
  console.log('click-outside', ev)
}
</script>
