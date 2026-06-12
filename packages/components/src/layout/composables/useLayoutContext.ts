import { inject, provide, type InjectionKey } from 'vue'
import type { LayoutContext } from '../internal.type'
import { createLayoutContext } from './createLayoutContext'

const layoutContextKey: InjectionKey<LayoutContext> = Symbol('LayoutContext')
const fallbackLayoutContext = createLayoutContext()

export function provideLayoutContext(context: LayoutContext): void {
  provide(layoutContextKey, context)
}

export function useLayoutContext(): LayoutContext {
  return inject(layoutContextKey, fallbackLayoutContext)
}
