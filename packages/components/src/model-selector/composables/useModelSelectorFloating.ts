import { autoUpdate, computePosition, flip, offset, shift, size, type Placement } from '@floating-ui/dom'
import { nextTick, onScopeDispose, shallowRef, watch, type Ref } from 'vue'

interface UseModelSelectorFloatingOptions {
  referenceEl: Ref<HTMLElement | null>
  floatingEl: Ref<HTMLElement | null>
  open: () => boolean
  placement: () => Placement
  offset: () => number
  teleportTarget: () => Node | null
  onOutsidePointerDown: (event: PointerEvent) => void
}

function eventTargetsElement(event: Event, element: HTMLElement) {
  const eventPath = event.composedPath?.() ?? []

  if (eventPath.includes(element)) {
    return true
  }

  const NodeConstructor = element.ownerDocument.defaultView?.Node
  return Boolean(NodeConstructor && event.target instanceof NodeConstructor && element.contains(event.target))
}

export function useModelSelectorFloating(options: UseModelSelectorFloatingOptions) {
  const isPositioned = shallowRef(false)

  const stopWatching = watch(
    () =>
      [
        options.open(),
        options.referenceEl.value,
        options.floatingEl.value,
        options.placement(),
        options.offset(),
        options.teleportTarget(),
      ] as const,
    async ([open, referenceEl, floatingEl, placement, offsetValue, _teleportTarget], _previous, onCleanup) => {
      isPositioned.value = false

      if (!open || !referenceEl || !floatingEl) {
        return
      }

      const reference = referenceEl
      const floating = floatingEl
      let active = true
      let positionRequest = 0
      const cleanupAutoUpdate: { current?: () => void } = {}
      const ownerDocument = reference.ownerDocument

      const handlePointerDown = (event: PointerEvent) => {
        if (eventTargetsElement(event, reference) || eventTargetsElement(event, floating)) {
          return
        }

        options.onOutsidePointerDown(event)
      }

      ownerDocument.addEventListener('pointerdown', handlePointerDown, true)

      onCleanup(() => {
        active = false
        positionRequest += 1
        cleanupAutoUpdate.current?.()
        ownerDocument.removeEventListener('pointerdown', handlePointerDown, true)
        isPositioned.value = false
      })

      async function updatePosition() {
        const request = ++positionRequest

        try {
          const result = await computePosition(reference, floating, {
            placement,
            strategy: 'fixed',
            middleware: [
              offset(offsetValue),
              flip({ padding: 8 }),
              shift({ padding: 8 }),
              size({
                padding: 8,
                apply({ availableHeight, availableWidth, rects, elements }) {
                  const matchedWidth = Math.min(rects.reference.width, Math.max(0, availableWidth))

                  elements.floating.style.minWidth = `${Math.round(matchedWidth)}px`
                  elements.floating.style.maxWidth = `${Math.max(0, Math.floor(availableWidth))}px`
                  elements.floating.style.setProperty(
                    '--tr-model-selector-available-height',
                    `${Math.max(0, Math.floor(availableHeight))}px`,
                  )
                },
              }),
            ],
          })

          if (
            !active ||
            request !== positionRequest ||
            !options.open() ||
            options.referenceEl.value !== reference ||
            options.floatingEl.value !== floating
          ) {
            return
          }

          const devicePixelRatio = ownerDocument.defaultView?.devicePixelRatio || 1
          const x = Math.round(result.x * devicePixelRatio) / devicePixelRatio
          const y = Math.round(result.y * devicePixelRatio) / devicePixelRatio

          Object.assign(floating.style, {
            left: `${x}px`,
            top: `${y}px`,
          })

          isPositioned.value = true
        } catch {
          if (active && request === positionRequest) {
            isPositioned.value = false
          }
        }
      }

      await nextTick()

      if (!active || !options.open()) {
        return
      }

      cleanupAutoUpdate.current = autoUpdate(reference, floating, () => {
        void updatePosition()
      })
    },
    { flush: 'post', immediate: true },
  )

  onScopeDispose(() => {
    stopWatching()
  })

  return {
    isPositioned,
  }
}
