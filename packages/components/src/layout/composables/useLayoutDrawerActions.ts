import { computed, type ComputedRef } from 'vue'
import type { LayoutPanelActions, LayoutPanelContext } from '../internal.type'

interface CreateLayoutDrawerActionsOptions {
  left: LayoutPanelContext
  right: LayoutPanelContext
}

interface CreateLayoutDrawerActionsResult {
  left: LayoutPanelContext
  right: LayoutPanelContext
  isDrawerVisible: ComputedRef<boolean>
  closeDrawers: () => void
}

function createPanelActions(panel: LayoutPanelContext, getSibling: () => LayoutPanelContext): LayoutPanelActions {
  function open(): void {
    if (panel.state.isDrawer.value) {
      const sibling = getSibling()
      if (sibling.state.isDrawer.value && sibling.state.isOpen.value) {
        sibling.actions.close()
      }
    }

    panel.actions.setOpen(true)
  }

  function close(): void {
    panel.actions.setOpen(false)
  }

  function toggle(): void {
    if (panel.state.isOpen.value) {
      close()
      return
    }

    open()
  }

  return {
    open,
    close,
    toggle,
    setOpen: (nextOpen) => {
      if (nextOpen) {
        open()
        return
      }

      close()
    },
    setWidth: panel.actions.setWidth,
  }
}

export function createLayoutDrawerActions(options: CreateLayoutDrawerActionsOptions): CreateLayoutDrawerActionsResult {
  let left = options.left
  let right = options.right

  left = {
    ...options.left,
    actions: createPanelActions(options.left, () => right),
  }

  right = {
    ...options.right,
    actions: createPanelActions(options.right, () => left),
  }

  const isDrawerVisible = computed(
    () =>
      (left.state.isDrawer.value && left.state.isOpen.value) ||
      (right.state.isDrawer.value && right.state.isOpen.value),
  )

  function closeDrawers(): void {
    if (left.state.isDrawer.value && left.state.isOpen.value) {
      left.actions.close()
    }

    if (right.state.isDrawer.value && right.state.isOpen.value) {
      right.actions.close()
    }
  }

  return {
    left,
    right,
    isDrawerVisible,
    closeDrawers,
  }
}
