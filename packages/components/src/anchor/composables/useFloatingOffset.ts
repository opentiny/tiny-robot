import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { AnchorFloatingOffsetOptions } from '../internal.type'
import { revealAnchorItem } from '../utils/reveal'

export function useFloatingOffset(options: AnchorFloatingOffsetOptions) {
  const offset = ref(0)
  const availableHeight = ref<number>()
  const maxHeight = ref<number>()
  const searchBelow = ref(false)
  let openingListHeight: number | undefined
  let transitionFrame: number | null = null
  let pinnedItem: HTMLElement | null = null
  let pinnedCenter = 0
  let transitionUntil = 0

  function getFloatingNodes() {
    const hostEl = options.host.value
    const floatingEl = hostEl?.firstElementChild
    return {
      hostEl,
      floatingEl: floatingEl instanceof HTMLElement ? floatingEl : null,
      navEl: hostEl?.querySelector<HTMLElement>('.tr-anchor__panel') ?? null,
    }
  }

  const resizeTargets = computed(() => {
    const { hostEl, floatingEl } = getFloatingNodes()
    return [hostEl, floatingEl, options.searchCap.value].filter((el): el is HTMLElement => Boolean(el))
  })

  // Capture before opening or closing. Use the actual hovered/focused button, not its index:
  // filtering or changing the item set must not transfer the pin to another item.
  function pinItem(event?: MouseEvent | FocusEvent) {
    const { hostEl, navEl } = getFloatingNodes()
    const target = event?.target
    const buttons = navEl?.querySelectorAll<HTMLElement>('.tr-anchor__item')
    const hovered =
      event instanceof MouseEvent
        ? Array.from(buttons ?? []).find((el) => {
            const rect = el.getBoundingClientRect()
            return event.clientY >= rect.top && event.clientY < rect.bottom
          })
        : null
    pinnedItem =
      hovered ??
      (target instanceof HTMLElement ? target.closest<HTMLElement>('.tr-anchor__item') : null) ??
      navEl?.querySelector<HTMLElement>('.tr-anchor__item:focus') ??
      navEl?.querySelector<HTMLElement>('.tr-anchor__item[aria-current]') ??
      null
    if (pinnedItem && hostEl?.contains(pinnedItem)) {
      const rect = pinnedItem.getBoundingClientRect()
      pinnedCenter = rect.top + rect.height / 2
    }
    return pinnedItem
  }

  function sync() {
    const { hostEl, floatingEl, navEl } = getFloatingNodes()
    const frameEl = hostEl?.parentElement
    if (!hostEl || !frameEl || !floatingEl) return

    const frame = frameEl.getBoundingClientRect()
    const container = options.container.value?.getBoundingClientRect() ?? frame
    const top = Math.max(0, frame.top, container.top)
    const bottom = Math.min(window.innerHeight, frame.bottom, container.bottom)
    const height = Math.max(0, bottom - top)
    const gap = Math.min(12, height / 8)
    availableHeight.value = Math.max(0, height - gap * 2)

    const floating = floatingEl.getBoundingClientRect()
    const searchCap = options.searchCap.value
    const surface = navEl?.parentElement
    const wasSearchBelow = searchBelow.value
    if (searchCap && navEl && surface) {
      const searchHeight = searchCap.getBoundingClientRect().height
      const listHeight =
        navEl.scrollHeight + surface.getBoundingClientRect().height - navEl.getBoundingClientRect().height
      if (openingListHeight === undefined) {
        openingListHeight = listHeight
        const roomAbove = (availableHeight.value - listHeight) / 2
        searchBelow.value = roomAbove < searchHeight && Boolean(pinnedItem) && pinnedCenter < top + height / 2
      }

      // Keep the search box at its opening edge while filtering. If it cannot fit
      // outside the centered list, take the extra space from the far end.
      const inset = Math.max(0, (availableHeight.value - openingListHeight) / 2)
      const outerInset = Math.max(0, inset - searchHeight)
      maxHeight.value = availableHeight.value - inset - outerInset
      const expandedHeight = Math.min(listHeight + searchHeight, maxHeight.value)
      const expandedTop = searchBelow.value ? bottom - gap - outerInset - expandedHeight : top + gap + outerInset
      offset.value = expandedTop - frame.top
    } else {
      openingListHeight = undefined
      searchBelow.value = false
      maxHeight.value = availableHeight.value
      offset.value = top - frame.top + (height - Math.min(floating.height, availableHeight.value)) / 2
    }

    if (
      transitionUntil > 0 &&
      pinnedItem &&
      navEl?.contains(pinnedItem) &&
      (!searchCap || wasSearchBelow === searchBelow.value)
    ) {
      const item = pinnedItem.getBoundingClientRect()
      const localCenter = item.top + item.height / 2 - floating.top
      // Keep the hovered item near the pointer using the directory's own scroll range.
      navEl.scrollTop += frame.top + offset.value + localCenter - pinnedCenter
    }
  }

  function finishTransition() {
    if (transitionFrame !== null) cancelAnimationFrame(transitionFrame)
    transitionFrame = null
    pinnedItem = null
    transitionUntil = 0
  }

  watch(options.searchCap, sync, { flush: 'post' })

  watch(
    options.expanded,
    (expanded) => {
      if (!expanded || !pinnedItem?.isConnected) pinItem()
      if (transitionFrame !== null) cancelAnimationFrame(transitionFrame)
      // Slightly longer than the CSS transition, including the final layout frame.
      transitionUntil = performance.now() + 240
      const tick = () => {
        if (!transitionUntil) return
        sync()
        const { navEl } = getFloatingNodes()
        const focused = navEl?.querySelector<HTMLElement>('.tr-anchor__item:focus')
        if (focused && navEl) revealAnchorItem(navEl, focused)
        if (performance.now() < transitionUntil) {
          transitionFrame = requestAnimationFrame(tick)
        } else {
          finishTransition()
        }
      }
      nextTick(() => {
        transitionFrame = requestAnimationFrame(tick)
      })
    },
    { flush: 'sync' },
  )

  onBeforeUnmount(finishTransition)

  return { offset, availableHeight, maxHeight, searchBelow, sync, resizeTargets, pinItem, finishTransition }
}
