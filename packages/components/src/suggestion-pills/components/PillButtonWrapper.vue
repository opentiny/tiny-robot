<script lang="ts" setup>
import { CSSProperties } from 'vue'
import DropdownMenu from '../../dropdown-menu'
import SuggestionPopover from '../../suggestion-popover'
import { SuggestionPillButtonProps, SuggestionPillItem } from '../index.type'
import PillButton from './PillButton.vue'

defineProps<Required<SuggestionPillButtonProps> & { style?: CSSProperties }>()
const emit = defineEmits<{
  (e: 'click', ev: MouseEvent, item: SuggestionPillItem): void
}>()
</script>

<template>
  <SuggestionPopover
    v-if="item.action?.type === 'popover'"
    :style="style"
    v-bind="item.action.props"
    @item-click="item.action.events?.itemClick"
    @group-click="item.action.events?.groupClick"
    @open="item.action.events?.open"
    @close="item.action.events?.close"
    @click-outside="item.action.events?.clickOutside"
  >
    <PillButton :item="item" @pointerup="emit('click', $event, item)"></PillButton>
    <template v-for="(slotVNode, slotName) in item.action.slots" :key="slotName" #[slotName]>
      <component :is="slotVNode" />
    </template>
  </SuggestionPopover>
  <DropdownMenu
    v-else-if="item.action?.type === 'menu'"
    :style="style"
    v-bind="item.action.props"
    @item-click="item.action.events?.itemClick"
    @click-outside="item.action.events?.clickOutside"
  >
    <template #trigger>
      <PillButton :item="item" @pointerup="emit('click', $event, item)"></PillButton>
    </template>
  </DropdownMenu>
  <PillButton v-else :item="item" :style="style" @pointerup="emit('click', $event, item)"></PillButton>
</template>
