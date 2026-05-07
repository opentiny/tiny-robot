import { ref, nextTick, onScopeDispose, watch } from 'vue'
import { computePosition, flip, shift, offset, autoUpdate } from '@floating-ui/dom'
import { onClickOutside, useEventListener } from '@vueuse/core'

export function useFloatingDropdown(
  referenceEl: ReturnType<typeof ref<HTMLElement | null>>,
  floatingEl: ReturnType<typeof ref<HTMLElement | null>>,
) {
  const isOpen = ref(false)
  let cleanupAutoUpdate: (() => void) | null = null

  const updatePosition = async () => {
    if (!referenceEl.value || !floatingEl.value) return

    const { x, y } = await computePosition(referenceEl.value, floatingEl.value, {
      placement: 'bottom-start',
      strategy: 'absolute',
      middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 })],
    })

    const dpr = window.devicePixelRatio || 1
    const roundedX = Math.round(x * dpr) / dpr
    const roundedY = Math.round(y * dpr) / dpr

    Object.assign(floatingEl.value.style, {
      left: '0',
      top: '0',
      transform: `translate(${roundedX}px, ${roundedY}px)`,
    })
  }

  const startAutoUpdate = () => {
    if (!referenceEl.value || !floatingEl.value) return
    cleanupAutoUpdate = autoUpdate(referenceEl.value, floatingEl.value, updatePosition)
  }

  const stopAutoUpdate = () => {
    cleanupAutoUpdate?.()
    cleanupAutoUpdate = null
  }

  onClickOutside(
    floatingEl,
    () => {
      if (!isOpen.value) {
        return
      }

      isOpen.value = false
    },
    {
      ignore: [referenceEl],
    },
  )

  if (typeof document !== 'undefined') {
    useEventListener(document, 'keydown', (event: KeyboardEvent) => {
      if (!isOpen.value) {
        return
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        isOpen.value = false
        referenceEl.value?.focus()
      }
    })
  }

  watch(isOpen, async (newVal) => {
    if (newVal) {
      await nextTick()
      updatePosition()
      startAutoUpdate()
    } else {
      stopAutoUpdate()
    }
  })

  watch([referenceEl, floatingEl], () => {
    if (!isOpen.value) {
      stopAutoUpdate()
    }
  })

  onScopeDispose(() => {
    stopAutoUpdate()
  })

  return { isOpen, updatePosition }
}
