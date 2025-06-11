export function toCssUnit(value?: number | string): string {
  if (typeof value === 'number') return `${value}px`

  const trimmed = value?.trim()

  if (!trimmed) return '0px'

  // Check if it's a numeric string
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return `${trimmed}px`
  }

  return trimmed
}

// TODO safari not support getSelection from shadowdom
export function getSelectionFromTarget(target?: HTMLElement) {
  if (!target) return window.getSelection()

  const rootNode = target.getRootNode()
  if (rootNode instanceof ShadowRoot) {
    return (rootNode as Partial<Pick<Window, 'getSelection'>>).getSelection?.() || window.getSelection()
  }
  return window.getSelection()
}

export function isShadowDOM(target: HTMLElement) {
  const rootNode = target.getRootNode()
  return rootNode instanceof ShadowRoot
}
