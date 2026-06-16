import { inject, provide, type InjectionKey } from 'vue'
import type { LayoutContext, LayoutFloatingContext, LayoutPanelContext } from '../internal.type'
import { createLayoutDrawerActions } from './useLayoutDrawerActions'

const layoutContextKey: InjectionKey<LayoutContext> = Symbol('LayoutContext')

interface CreateLayoutContextOptions {
  rootEl: LayoutContext['rootEl']
  dragHandleEl: LayoutContext['dragHandleEl']
  left: LayoutPanelContext
  right: LayoutPanelContext
  floating: LayoutFloatingContext
}

export function createLayoutContext(options: CreateLayoutContextOptions): LayoutContext {
  const drawer = createLayoutDrawerActions({
    left: options.left,
    right: options.right,
  })

  return {
    rootEl: options.rootEl,
    dragHandleEl: options.dragHandleEl,
    left: drawer.left,
    right: drawer.right,
    floating: options.floating,
    ui: {
      isDrawerVisible: drawer.isDrawerVisible,
    },
    actions: {
      closeDrawers: drawer.closeDrawers,
    },
  }
}

export function provideLayoutContext(context: LayoutContext): void {
  provide(layoutContextKey, context)
}

export function useLayoutContext(): LayoutContext {
  const context = inject(layoutContextKey, null)

  if (!context) {
    throw new Error('[Layout] useLayoutContext must be used within Layout.')
  }

  return context
}
