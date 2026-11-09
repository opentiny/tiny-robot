import type { ComputedRef, InjectionKey } from 'vue'

export const queryContextKey: InjectionKey<{
  busy: ComputedRef<boolean>
  submit: (fields: { keyword: string; status: string }) => Promise<boolean>
}> = Symbol('order-query')
