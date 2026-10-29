export function toPx(value: number | undefined): string | undefined {
  return value === undefined ? undefined : `${value}px`
}

const PX_LENGTH_RE = /^(-?(?:\d+|\d*\.\d+))px$/i
const ZERO_LENGTH_RE = /^0(?:\.0+)?$/i

export function resolveCssLengthToPx(value: number | string | undefined, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value !== 'string' || !value.trim()) {
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

  return fallback
}
