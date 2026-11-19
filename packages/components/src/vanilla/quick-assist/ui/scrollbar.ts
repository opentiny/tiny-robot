/** Fixed-size scrollbar; textarea retains native selection, wheel and keyboard scrolling. */
export function createInputScrollbar(input: HTMLTextAreaElement) {
  const rail = input.ownerDocument.createElement('div')
  rail.className = 'tr-quick-assist__scrollbar'
  rail.hidden = true
  rail.tabIndex = 0
  rail.setAttribute('role', 'scrollbar')
  rail.setAttribute('aria-label', input.getAttribute('aria-label') ?? '输入内容')
  rail.setAttribute('aria-controls', input.id)
  rail.setAttribute('aria-orientation', 'vertical')
  rail.setAttribute('aria-valuemin', '0')
  const thumb = input.ownerDocument.createElement('span')
  thumb.className = 'tr-quick-assist__scrollbar-thumb'
  thumb.setAttribute('aria-hidden', 'true')
  rail.append(thumb)
  const thumbHeight = 16
  let drag: { pointerId: number; offset: number } | undefined

  const sync = () => {
    const max = Math.max(0, input.scrollHeight - input.clientHeight)
    rail.hidden = max === 0
    rail.style.top = `${input.offsetTop}px`
    rail.style.height = `${input.clientHeight}px`
    rail.setAttribute('aria-valuemax', String(max))
    rail.setAttribute('aria-valuenow', String(Math.round(input.scrollTop)))
    const travel = Math.max(0, input.clientHeight - thumbHeight)
    thumb.style.transform = `translateY(${max ? (input.scrollTop / max) * travel : 0}px)`
  }
  const move = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.pointerId) return
    const travel = rail.clientHeight - thumbHeight
    const position = event.clientY - rail.getBoundingClientRect().top - drag.offset
    const ratio = travel > 0 ? Math.max(0, Math.min(1, position / travel)) : 0
    input.scrollTop = ratio * (input.scrollHeight - input.clientHeight)
    sync()
  }
  rail.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return
    event.preventDefault()
    const rect = thumb.getBoundingClientRect()
    drag = {
      pointerId: event.pointerId,
      offset: event.clientY >= rect.top && event.clientY <= rect.bottom ? event.clientY - rect.top : thumbHeight / 2,
    }
    rail.setPointerCapture(event.pointerId)
    move(event)
  })
  rail.addEventListener('pointermove', move)
  const end = (event: PointerEvent) => {
    if (drag?.pointerId !== event.pointerId) return
    drag = undefined
    if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId)
  }
  rail.addEventListener('pointerup', end)
  rail.addEventListener('pointercancel', end)
  rail.addEventListener('lostpointercapture', () => {
    drag = undefined
  })
  rail.addEventListener('keydown', (event) => {
    const max = input.scrollHeight - input.clientHeight
    const positions: Record<string, number> = {
      ArrowUp: input.scrollTop - 18,
      ArrowDown: input.scrollTop + 18,
      PageUp: input.scrollTop - input.clientHeight,
      PageDown: input.scrollTop + input.clientHeight,
      Home: 0,
      End: max,
    }
    const position = positions[event.key]
    if (typeof position !== 'number') return
    event.preventDefault()
    input.scrollTop = position
    sync()
  })
  rail.addEventListener(
    'wheel',
    (event) => {
      if (!event.deltaY) return
      event.preventDefault()
      const unit = event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? input.clientHeight : 1
      input.scrollTop += event.deltaY * unit
      sync()
    },
    { passive: false },
  )
  input.addEventListener('scroll', sync, { passive: true })
  return { element: rail, sync }
}
