import { positionElement } from '../positioning'

/** Keep validation copy outside the popover's scroll/clipping layer. */
export function bindInputLimitTooltip(anchor: HTMLElement, tooltip: HTMLElement, popover: HTMLElement) {
  const root = anchor.ownerDocument
  const view = root.defaultView
  let invalid = false
  let anchorHovered = false
  let tooltipHovered = false
  let focused = false
  let hideTimer: ReturnType<typeof setTimeout> | undefined

  const refresh = () => {
    if (hideTimer !== undefined) clearTimeout(hideTimer)
    hideTimer = undefined
    const rect = anchor.getBoundingClientRect()
    const panel = popover.getBoundingClientRect()
    const anchorVisible =
      anchor.isConnected &&
      popover.isConnected &&
      rect.bottom > panel.top &&
      rect.top < panel.bottom &&
      rect.right > panel.left &&
      rect.left < panel.right
    tooltip.hidden = !invalid || !(anchorHovered || tooltipHovered || focused) || !anchorVisible
    if (!tooltip.hidden) positionElement({ element: tooltip, anchor: rect, placement: 'top', offset: 8 })
  }
  const leave = () => {
    // Allow crossing the small gap to read the tooltip without hiding it.
    if (hideTimer !== undefined) clearTimeout(hideTimer)
    hideTimer = setTimeout(refresh, 100)
  }
  const enterAnchor = () => {
    anchorHovered = true
    refresh()
  }
  const leaveAnchor = () => {
    anchorHovered = false
    leave()
  }
  const enterTooltip = () => {
    tooltipHovered = true
    refresh()
  }
  const leaveTooltip = () => {
    tooltipHovered = false
    leave()
  }
  const focus = () => {
    focused = true
    refresh()
  }
  const blur = (event: FocusEvent) => {
    focused = anchor.contains(event.relatedTarget as Node | null)
    refresh()
  }
  anchor.addEventListener('pointerenter', enterAnchor)
  anchor.addEventListener('pointerleave', leaveAnchor)
  anchor.addEventListener('focusin', focus)
  anchor.addEventListener('focusout', blur)
  tooltip.addEventListener('pointerenter', enterTooltip)
  tooltip.addEventListener('pointerleave', leaveTooltip)
  view?.addEventListener('scroll', refresh, true)
  view?.addEventListener('resize', refresh)
  const positionObserver = view?.MutationObserver ? new view.MutationObserver(refresh) : undefined
  positionObserver?.observe(popover, { attributes: true, attributeFilter: ['style'] })
  const resize = view?.ResizeObserver ? new view.ResizeObserver(refresh) : undefined
  resize?.observe(anchor)
  resize?.observe(popover)
  resize?.observe(tooltip)
  tooltip.hidden = true

  return {
    update(value: boolean) {
      invalid = value
      refresh()
    },
    destroy() {
      if (hideTimer !== undefined) clearTimeout(hideTimer)
      anchor.removeEventListener('pointerenter', enterAnchor)
      anchor.removeEventListener('pointerleave', leaveAnchor)
      anchor.removeEventListener('focusin', focus)
      anchor.removeEventListener('focusout', blur)
      tooltip.removeEventListener('pointerenter', enterTooltip)
      tooltip.removeEventListener('pointerleave', leaveTooltip)
      view?.removeEventListener('scroll', refresh, true)
      view?.removeEventListener('resize', refresh)
      positionObserver?.disconnect()
      resize?.disconnect()
      tooltip.remove()
    },
  }
}
