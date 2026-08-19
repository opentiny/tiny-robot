<script setup lang="ts">
import type { ComponentPublicInstance, VNode } from 'vue'
import { computed, ref, toRef } from 'vue'
import { useStableId } from '../../shared/composables'
import { useAsChild, useExtensionCardPopoverPosition } from '../composables'
import type { ExtensionCardPopoverPlacement } from '../internal.type'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    asChild?: boolean
    placement?: ExtensionCardPopoverPlacement
  }>(),
  {
    asChild: false,
    placement: 'bottom-end',
  },
)

const popoverId = `tr-extension-card-popover-${useStableId()}`
const triggerRef = ref<HTMLElement | null>(null)
const popoverRef = ref<HTMLElement | null>(null)
const open = ref(false)
const { position } = useExtensionCardPopoverPosition({
  triggerRef,
  popoverRef,
  open,
  placement: toRef(props, 'placement'),
})
const popoverStyle = computed(() => {
  if (!position.value) return

  return {
    left: `${position.value.x}px`,
    top: `${position.value.y}px`,
  }
})

const slots = defineSlots<{
  trigger?: (props: { popoverId: string; open: boolean }) => VNode[]
  content?: (props: { close: () => void }) => VNode[]
}>()

const setTriggerRef = (target: Element | ComponentPublicInstance | null) => {
  const element = target instanceof Element ? target : target?.$el
  triggerRef.value = element instanceof HTMLElement ? element : null
}

const { renderAsChild } = useAsChild({
  getSlot: () => slots.trigger,
  componentName: 'ExtensionCardPopover',
})

const renderAsChildTrigger = () =>
  renderAsChild(
    {
      popoverId,
      open: open.value,
    },
    {
      ref: setTriggerRef,
    },
  )

const close = () => {
  if (!popoverRef.value?.matches(':popover-open')) return
  popoverRef.value.hidePopover()
}

const handleToggle = (event: ToggleEvent) => {
  open.value = event.newState === 'open'
}
</script>

<template>
  <component :is="renderAsChildTrigger()" v-if="asChild" />
  <div v-else ref="triggerRef" class="tr-extension-card-popover__trigger">
    <slot name="trigger" :popover-id="popoverId" :open="open" />
  </div>
  <div
    :id="popoverId"
    ref="popoverRef"
    popover="auto"
    class="tr-extension-card-popover__content"
    :style="popoverStyle"
    @toggle="handleToggle"
  >
    <slot name="content" :close="close" />
  </div>
</template>

<style lang="less" scoped>
.tr-extension-card-popover__trigger {
  display: inline-flex;
}

.tr-extension-card-popover__content {
  position: fixed;
  inset: auto;
  padding: 8px 0;
  margin: 0;
  border: 0;
  border-radius: 8px;
  background-color: var(--tr-dropdown-menu-bg-color);
  box-shadow: var(--tr-dropdown-menu-box-shadow);
  color: var(--tr-dropdown-menu-item-color);
}
</style>
