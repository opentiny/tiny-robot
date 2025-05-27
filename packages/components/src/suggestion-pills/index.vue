<script setup lang="ts">
import { useScroll } from '@vueuse/core'
import { computed, useTemplateRef } from 'vue'
import { SuggestionPillEmits, SuggestionPillProps } from './index.type'
import SuggestionPopover from '../suggestion-popover'
import { PillButton } from './components'

const props = defineProps<SuggestionPillProps>()

const emit = defineEmits<SuggestionPillEmits>()

const containerRef = useTemplateRef('container')

const { arrivedState } = useScroll(containerRef)

const maskImage = computed(() => {
  if (arrivedState.left) {
    return 'linear-gradient(to right, black 95%, transparent)'
  }

  if (arrivedState.right) {
    return 'linear-gradient(to left, black 95%, transparent)'
  }

  return 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
})
</script>

<template>
  <div class="tr-suggestion-pills__container" ref="container">
    <slot>
      <template v-for="item in props.items" :key="item.id">
        <SuggestionPopover
          v-if="item.action?.type === 'popover'"
          v-bind="item.action.props"
          @item-click="item.action.events?.itemClick"
          @group-click="item.action.events?.groupClick"
          @close="item.action.events?.close"
        >
          <PillButton :item="item" @click="emit('item-click', item)"></PillButton>
          <template v-for="(slotVNode, slotName) in item.action.slots" :key="slotName" #[slotName]>
            <component :is="slotVNode" />
          </template>
        </SuggestionPopover>
        <PillButton v-else :item="item" @click="emit('item-click', item)"></PillButton>
      </template>
    </slot>
  </div>
</template>

<style lang="less" scoped>
.tr-suggestion-pills__container {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;

  mask-image: v-bind('maskImage');
  mask-repeat: no-repeat;
}
</style>
