export function toCssUnit(value: number | string): string {
  if (typeof value === 'number') return `${value}px`

  const trimmed = value.trim()
  // 判断是否为合法数字字符串
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return `${trimmed}px`
  }

  return trimmed
}
