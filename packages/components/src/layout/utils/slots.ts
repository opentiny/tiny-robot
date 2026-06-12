import { Comment, Fragment, Text, isVNode, type Slot } from 'vue'

function hasRenderableValue(value: unknown): boolean {
  if (value == null) {
    return false
  }

  if (typeof value === 'string') {
    return value.trim().length > 0
  }

  return true
}

function hasRenderableChildren(children: unknown): boolean {
  if (!Array.isArray(children)) {
    return hasRenderableValue(children)
  }

  return children.some((child) => {
    if (!isVNode(child)) {
      return hasRenderableValue(child)
    }

    if (child.type === Comment) {
      return false
    }

    if (child.type === Text) {
      return hasRenderableValue(child.children)
    }

    if (child.type === Fragment) {
      return hasRenderableChildren(child.children)
    }

    return true
  })
}

export function hasRenderableSlot(slot?: Slot, slotProps?: object): boolean {
  return hasRenderableChildren(slot?.(slotProps))
}
