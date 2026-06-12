export function toPx(value: number | undefined): string | undefined {
  return value === undefined ? undefined : `${value}px`
}

const PX_LENGTH_RE = /^(-?(?:\d+|\d*\.\d+))px$/i
const ZERO_LENGTH_RE = /^0(?:\.0+)?(?:[a-z%]+)?$/i

const measurementMap = new WeakMap<HTMLElement, HTMLDivElement>()

function getMeasurementElement(rootEl: HTMLElement): HTMLDivElement {
  const cached = measurementMap.get(rootEl)
  if (cached) {
    return cached
  }

  const el = rootEl.ownerDocument.createElement('div')
  el.style.position = 'absolute'
  el.style.visibility = 'hidden'
  el.style.pointerEvents = 'none'
  el.style.inset = '0 auto auto 0'
  el.style.width = '0px'
  el.style.height = '0px'
  el.style.padding = '0'
  el.style.border = '0'
  el.style.overflow = 'hidden'
  rootEl.appendChild(el)
  measurementMap.set(rootEl, el)
  return el
}

export function resolveCssLengthToPx(
  value: number | string | undefined,
  rootEl: HTMLElement | null | undefined,
  fallback: number,
  property: 'width' | 'height' = 'width',
): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value !== 'string' || !value.trim() || !rootEl) {
    return fallback
  }

  const normalized = value.trim().toLowerCase()

  if (ZERO_LENGTH_RE.test(normalized)) {
    return 0
  }

  const pxMatch = normalized.match(PX_LENGTH_RE)
  if (pxMatch) {
    const parsed = Number.parseFloat(pxMatch[1])
    return Number.isFinite(parsed) ? parsed : fallback
  }

  const measure = getMeasurementElement(rootEl)
  measure.style.width = property === 'width' ? normalized : '0px'
  measure.style.height = property === 'height' ? normalized : '0px'

  if (property === 'width' && !measure.style.width) {
    return fallback
  }

  if (property === 'height' && !measure.style.height) {
    return fallback
  }

  const size = measure.getBoundingClientRect()[property]
  measure.style.width = '0px'
  measure.style.height = '0px'

  return Number.isFinite(size) ? size : fallback
}
