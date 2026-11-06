import { nextTick, ref } from 'vue'
import { revealAnchorItem } from '../utils/reveal'
import type { AnchorOverlayInteractionsOptions } from '../internal.type'
import { queryAnchorItemById } from '../utils/target'

export function useOverlayInteractions(options: AnchorOverlayInteractionsOptions) {
  const isBrowsing = ref(false)
  function isEditableEventTarget(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) {
      return false
    }

    return (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target.isContentEditable
    )
  }

  function focusHighlightedItem() {
    nextTick(() => {
      const id = options.highlightedId.value
      const navEl = options.overlay.value?.navEl

      if (!id || !navEl) {
        return
      }

      const item = queryAnchorItemById(navEl, id)
      if (item) {
        item.focus({ preventScroll: true })
        revealAnchorItem(navEl, item)
      }
    })
  }

  function handleKeydown(event: KeyboardEvent) {
    if (isEditableEventTarget(event.target)) {
      return
    }

    isBrowsing.value = true
    const focusedId =
      event.target instanceof HTMLElement
        ? event.target.closest<HTMLElement>('.tr-anchor__item')?.dataset.itemId
        : undefined
    const handled = options.handleNavigationKeydown(event, focusedId)

    if (event.key === 'Enter' || event.key === ' ') {
      const target = options.getHighlightedItem()
      if (target) {
        event.preventDefault()
        options.onSelectItem(focusedId ?? target.id)
        return
      }
    }

    if (handled && event.key !== 'Escape') {
      focusHighlightedItem()
    }
  }

  function handleMouseLeave() {
    const overlayEl = options.overlay.value?.overlayEl ?? null
    const activeElement = document.activeElement

    if (
      overlayEl &&
      activeElement instanceof HTMLElement &&
      overlayEl.contains(activeElement) &&
      isEditableEventTarget(activeElement)
    ) {
      return
    }

    isBrowsing.value = false
    if (options.shouldAutoCollapse.value) options.setExpanded(false)
  }

  function handleFocusOut(event: FocusEvent) {
    const next = event.relatedTarget as Node | null
    const overlayEl = options.overlay.value?.overlayEl ?? null
    if ((!next || !overlayEl?.contains(next)) && !overlayEl?.matches(':hover')) {
      isBrowsing.value = false
      if (options.shouldAutoCollapse.value) options.setExpanded(false)
    }
  }

  return {
    isBrowsing,
    handleKeydown,
    handleMouseLeave,
    handleFocusOut,
  }
}
