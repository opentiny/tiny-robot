import { nextTick } from 'vue'
import type { ContentNavOverlayInteractionsOptions } from '../internal.type'
import { queryContentNavItemById } from '../utils/target'

export function useOverlayInteractions(options: ContentNavOverlayInteractionsOptions) {
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

      queryContentNavItemById(navEl, id)?.focus()
    })
  }

  function handleKeydown(event: KeyboardEvent) {
    if (isEditableEventTarget(event.target)) {
      return
    }

    const handled = options.handleNavigationKeydown(event)

    if (event.key === 'Enter' || event.key === ' ') {
      const target = options.getHighlightedItem()
      if (target) {
        event.preventDefault()
        options.onSelectItem(target.id)
        return
      }
    }

    if (handled) {
      focusHighlightedItem()
    }
  }

  function handleMouseLeave() {
    if (!options.shouldAutoCollapse.value) {
      return
    }

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

    options.setExpanded(false)
  }

  function handleFocusOut(event: FocusEvent) {
    if (!options.shouldAutoCollapse.value) {
      return
    }

    const next = event.relatedTarget as Node | null
    const overlayEl = options.overlay.value?.overlayEl ?? null
    if (!next || !overlayEl?.contains(next)) {
      options.setExpanded(false)
    }
  }

  return {
    handleKeydown,
    handleMouseLeave,
    handleFocusOut,
  }
}
