interface InlineStyleSnapshot {
  value: string
  priority: string
}

function captureStyle(style: CSSStyleDeclaration, property: string): InlineStyleSnapshot {
  return {
    value: style.getPropertyValue(property),
    priority: style.getPropertyPriority(property),
  }
}

function restoreStyle(style: CSSStyleDeclaration, property: string, snapshot: InlineStyleSnapshot): void {
  if (!snapshot.value) {
    style.removeProperty(property)
    return
  }

  style.setProperty(property, snapshot.value, snapshot.priority)
}

export function lockBodyDragInteraction(body: HTMLElement, cursor: string): () => void {
  const style = body.style
  const previousCursor = captureStyle(style, 'cursor')
  const previousUserSelect = captureStyle(style, 'user-select')

  style.setProperty('cursor', cursor, 'important')
  style.setProperty('user-select', 'none', 'important')

  let released = false

  return () => {
    if (released) {
      return
    }

    released = true
    restoreStyle(style, 'cursor', previousCursor)
    restoreStyle(style, 'user-select', previousUserSelect)
  }
}
