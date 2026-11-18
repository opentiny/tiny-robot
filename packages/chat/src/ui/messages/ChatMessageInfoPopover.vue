<script setup lang="ts">
import { computed, inject, nextTick, shallowRef, watch } from 'vue'
import { autoUpdate, computePosition, flip, offset, shift, size } from '@floating-ui/dom'
import type { Placement } from '@floating-ui/dom'
import { onClickOutside } from '@vueuse/core'
import type { ChatMessageInfoItem } from '../../types'
import { CHAT_RENDER_ENVIRONMENT } from '../../composables/useChatRenderContext'

const props = defineProps<{
  title: string
  items: readonly ChatMessageInfoItem[]
  trigger: HTMLButtonElement
  placement: Placement
}>()
const emit = defineEmits<{
  close: []
}>()

const panel = shallowRef<HTMLElement | null>(null)
const positioned = shallowRef(false)
const renderEnvironment = inject(CHAT_RENDER_ENVIRONMENT, undefined)
const trigger = computed(() => props.trigger)
const host = computed(() => {
  const trigger = props.trigger
  const overlayHost = trigger
    .closest('[data-tr-layout-mode="floating"]')
    ?.querySelector<HTMLElement>(':scope > [data-tr-floating-overlay-host]')
  const themeRoot = trigger.closest<HTMLElement>('[data-tr-color-mode]')
  const root = trigger.getRootNode()
  return (
    overlayHost ??
    (themeRoot && themeRoot !== trigger.ownerDocument.documentElement ? themeRoot : null) ??
    (root instanceof ShadowRoot ? root : trigger.ownerDocument.body)
  )
})
onClickOutside(panel, () => emit('close'), { ignore: [trigger] })

watch(
  [trigger, panel, host, () => props.placement, () => renderEnvironment?.scrollRoot.value],
  ([reference, floating], _, onCleanup) => {
    positioned.value = false
    if (!floating) return
    const overflow = {
      boundary: renderEnvironment?.scrollRoot.value ?? ('clippingAncestors' as const),
      altBoundary: true,
      padding: 8,
    }
    let active = true
    const cleanup = autoUpdate(reference, floating, async () => {
      const { x, y } = await computePosition(reference, floating, {
        strategy: 'fixed',
        placement: props.placement,
        middleware: [
          offset(6),
          flip(overflow),
          shift(overflow),
          size({
            ...overflow,
            apply({ availableHeight, availableWidth, elements }) {
              elements.floating.style.maxHeight = `${Math.max(0, availableHeight)}px`
              elements.floating.style.maxWidth = `${Math.max(0, availableWidth)}px`
            },
          }),
        ],
      })
      if (!active) return
      Object.assign(floating.style, { left: `${x}px`, top: `${y}px` })
      const firstPosition = !positioned.value
      positioned.value = true
      if (firstPosition) {
        await nextTick()
        if (active) floating.focus({ preventScroll: true })
      }
    })
    onCleanup(() => {
      active = false
      cleanup()
    })
  },
  { flush: 'post' },
)
function closeWithKeyboard() {
  emit('close')
  props.trigger.focus({ preventScroll: true })
}
</script>

<template>
  <Teleport :to="host">
    <div
      ref="panel"
      class="tr-chat-message-info"
      :class="{ 'is-positioned': positioned }"
      role="dialog"
      tabindex="-1"
      :aria-label="title"
      @keydown.esc.stop.prevent="closeWithKeyboard"
    >
      <strong class="tr-chat-message-info__title">{{ title }}</strong>
      <dl class="tr-chat-message-info__details">
        <div v-for="item in items" :key="item.id" class="tr-chat-message-info__row">
          <dt>{{ item.label }}</dt>
          <dd :class="{ 'is-highlight': item.highlight }">{{ item.value }}</dd>
        </div>
      </dl>
    </div>
  </Teleport>
</template>

<style scoped>
.tr-chat-message-info {
  position: fixed;
  z-index: var(--tr-z-index-popover);
  visibility: hidden;
  pointer-events: auto;
  box-sizing: border-box;
  width: 260px;
  max-width: calc(100vw - 32px);
  padding: 12px 16px;
  border: 1px solid color-mix(in srgb, var(--tr-text-primary) 12%, transparent);
  border-radius: 12px;
  background: var(--tr-tooltip-bg-color);
  color: var(--tr-tooltip-color);
  box-shadow: var(--tr-tooltip-shadow);
  font-size: 12px;
  line-height: 20px;
  overflow: auto;
}
.tr-chat-message-info.is-positioned {
  visibility: visible;
}
.tr-chat-message-info__title {
  display: block;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid color-mix(in srgb, var(--tr-text-primary) 12%, transparent);
  font-size: 13px;
  font-weight: 500;
}
.tr-chat-message-info__details {
  display: grid;
  gap: 8px;
  margin: 0;
}
.tr-chat-message-info__row {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
  gap: 12px;
  overflow-wrap: anywhere;
}
.tr-chat-message-info__row dt {
  color: var(--tr-text-secondary);
}
.tr-chat-message-info__row dd {
  margin: 0;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.tr-chat-message-info__row dd.is-highlight {
  color: var(--tr-text-highlight);
  font-weight: 600;
}
</style>
