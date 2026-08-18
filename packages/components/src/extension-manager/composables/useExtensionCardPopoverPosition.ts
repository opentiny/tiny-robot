import { useEventListener } from '@vueuse/core'
import type { Ref } from 'vue'
import { nextTick, ref, watch } from 'vue'
import type { ExtensionCardPopoverPlacement } from '../internal.type'

interface ExtensionCardPopoverPosition {
  x: number
  y: number
  placement: ExtensionCardPopoverPlacement
}

interface UseExtensionCardPopoverPositionOptions {
  triggerRef: Ref<HTMLElement | null>
  popoverRef: Ref<HTMLElement | null>
  open: Ref<boolean>
  placement: Readonly<Ref<ExtensionCardPopoverPlacement>>
}

export const useExtensionCardPopoverPosition = ({
  triggerRef,
  popoverRef,
  open,
  placement,
}: UseExtensionCardPopoverPositionOptions) => {
  const position = ref<ExtensionCardPopoverPosition>()

  const updatePosition = () => {
    if (!open.value || !triggerRef.value || !popoverRef.value) return

    const triggerRect = triggerRef.value.getBoundingClientRect()
    const popoverRect = popoverRef.value.getBoundingClientRect()
    const viewportPadding = 8
    const gap = 8
    const maxLeft = Math.max(
      viewportPadding,
      document.documentElement.clientWidth - popoverRect.width - viewportPadding,
    )
    const maxTop = Math.max(
      viewportPadding,
      document.documentElement.clientHeight - popoverRect.height - viewportPadding,
    )
    const left = Math.min(maxLeft, Math.max(viewportPadding, triggerRect.right - popoverRect.width))
    const bottomTop = triggerRect.bottom + gap
    const topTop = triggerRect.top - popoverRect.height - gap
    const fitsBottom = bottomTop + popoverRect.height <= document.documentElement.clientHeight - viewportPadding
    const fitsTop = topTop >= viewportPadding
    let resolvedPlacement = placement.value

    if (resolvedPlacement === 'bottom-end' && !fitsBottom && fitsTop) {
      resolvedPlacement = 'top-end'
    } else if (resolvedPlacement === 'top-end' && !fitsTop && fitsBottom) {
      resolvedPlacement = 'bottom-end'
    }

    const preferredTop = resolvedPlacement === 'bottom-end' ? bottomTop : topTop
    const top = Math.min(maxTop, Math.max(viewportPadding, preferredTop))

    position.value = {
      x: left,
      y: top,
      placement: resolvedPlacement,
    }
  }

  watch(
    [open, placement],
    async ([isOpen]) => {
      if (!isOpen) return
      await nextTick()
      updatePosition()
    },
    { flush: 'post' },
  )

  useEventListener('resize', updatePosition, { passive: true })
  useEventListener('scroll', updatePosition, {
    capture: true,
    passive: true,
  })

  return {
    position,
  }
}
