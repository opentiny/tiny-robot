<template>
  <TrDropdownMenu :items="dropdownMenuItems" @item-click="(item) => console.log(item)">
    <TrSuggestionPillButton> 点我打开Dropdown Menu </TrSuggestionPillButton>
  </TrDropdownMenu>
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
</script>
