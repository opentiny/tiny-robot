import { inject, provide, type InjectionKey } from 'vue'
import type { LayoutContext } from '../internal.type'

const layoutContextKey: InjectionKey<LayoutContext> = Symbol('LayoutContext')

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

export function useLayoutAsideContext(side: 'left' | 'right') {
  const context = useLayoutContext()

  return context[side]
}
