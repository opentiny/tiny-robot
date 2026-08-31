<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import type { ComponentPublicInstance, VNode } from 'vue'
import { computed, onMounted, ref, toRef } from 'vue'
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
const nativePopoverSupported = ref(false)

onMounted(() => {
  nativePopoverSupported.value =
    typeof HTMLElement.prototype.showPopover === 'function' && typeof HTMLElement.prototype.hidePopover === 'function'
})

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

const close = () => {
  if (!nativePopoverSupported.value) {
    open.value = false
    return
  }

  if (!popoverRef.value?.matches(':popover-open')) return
  popoverRef.value.hidePopover()
}

const toggle = () => {
  if (!nativePopoverSupported.value) {
    open.value = !open.value
    return
  }

  if (!popoverRef.value) return

  if (popoverRef.value.matches(':popover-open')) {
    popoverRef.value.hidePopover()
  } else {
    popoverRef.value.showPopover()
  }
}

useEventListener('click', (event: MouseEvent) => {
  if (nativePopoverSupported.value || !open.value || !(event.target instanceof Node)) return
  if (triggerRef.value?.contains(event.target) || popoverRef.value?.contains(event.target)) return

  close()
})

useEventListener('keydown', (event: KeyboardEvent) => {
  if (nativePopoverSupported.value || !open.value || event.key !== 'Escape') return

  close()
  triggerRef.value?.focus()
})

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
      ...(nativePopoverSupported.value
        ? {
            popovertarget: popoverId,
            popovertargetaction: 'toggle',
          }
        : { onClick: toggle }),
    },
  )

const handleToggle = (event: ToggleEvent) => {
  open.value = event.newState === 'open'
}
</script>

<template>
  <component :is="renderAsChildTrigger()" v-if="asChild" />
  <button
    v-else
    ref="triggerRef"
    type="button"
    class="tr-extension-card-popover__trigger"
    :aria-controls="popoverId"
    :aria-expanded="open"
    @click="toggle"
  >
    <slot name="trigger" :popover-id="popoverId" :open="open" />
  </button>
  <div
    :id="popoverId"
    ref="popoverRef"
    v-show="nativePopoverSupported || open"
    :popover="nativePopoverSupported ? 'auto' : undefined"
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
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
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
