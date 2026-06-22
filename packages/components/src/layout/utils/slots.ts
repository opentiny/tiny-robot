import { Comment, Fragment, Text, isVNode } from 'vue'

type NonEmptyContentSlot = () => unknown

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

// Layout uses this to avoid keeping empty header / aside shells when conditional slot content renders nothing.
export function hasNonEmptySlotContent(slot?: NonEmptyContentSlot): boolean {
  return hasRenderableChildren(slot?.())
}
