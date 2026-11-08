/** Reveal within the nav only. scrollIntoView also scrolls overflow:hidden ancestors. */
export function revealAnchorItem(nav: HTMLElement, item: HTMLElement) {
  const panelRect = nav.getBoundingClientRect()
  const itemRect = item.getBoundingClientRect()
  if (itemRect.top < panelRect.top) {
    nav.scrollTop -= panelRect.top - itemRect.top
  } else if (itemRect.bottom > panelRect.bottom) {
    nav.scrollTop += itemRect.bottom - panelRect.bottom
  }
}
