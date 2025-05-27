export function toCssUnit(value: number | string): string {
  if (typeof value === 'number') return `${value}px`

  const trimmed = value.trim()

  if (!trimmed) return '0px'

  // Check if it's a numeric string
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return `${trimmed}px`
  }

  return trimmed
}
