const LAYOUT_MODE_ATTRIBUTE = 'data-tr-layout-mode'
const FLOATING_OVERLAY_HOST_ATTRIBUTE = 'data-tr-floating-overlay-host'

export function getFloatingOverlayHost(reference: Element): HTMLElement | null {
  const surface = reference.closest<HTMLElement>(`[${LAYOUT_MODE_ATTRIBUTE}="floating"]`)
  const host = Array.from(surface?.children ?? []).find(
    (child): child is HTMLElement =>
      child instanceof HTMLElement && child.hasAttribute(FLOATING_OVERLAY_HOST_ATTRIBUTE),
  )

  return host ?? null
}

export function mountSenderPopup(popup: HTMLElement, reference: Element): void {
  const host = getFloatingOverlayHost(reference)
  const container = host ?? document.body

  if (popup.parentElement !== container) {
    container.appendChild(popup)
  }

  popup.style.pointerEvents = host ? 'auto' : ''
}

export function observeLayoutMode(reference: Element, onChange: () => void): () => void {
  const surface = reference.closest<HTMLElement>(`[${LAYOUT_MODE_ATTRIBUTE}]`)

  if (!surface || typeof MutationObserver === 'undefined') {
    return () => undefined
  }

  const observer = new MutationObserver(onChange)
  observer.observe(surface, {
    attributes: true,
    attributeFilter: [LAYOUT_MODE_ATTRIBUTE],
  })

  return () => observer.disconnect()
}
