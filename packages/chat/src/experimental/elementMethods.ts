import { onBeforeUnmount, useHost } from 'vue'

const targets = new WeakMap<HTMLElement, { getTarget: () => object | null; getOverrides?: () => object }>()
const bindings = new WeakMap<HTMLElement, Map<string, (...args: unknown[]) => unknown>>()

/** Keep element methods stable while resolving the currently mounted inner component on every call. */
export function useElementMethods<T extends object>(
  getTarget: () => T | null,
  names: readonly (keyof T & string)[],
  getOverrides?: () => Partial<T>,
) {
  const host = useHost()
  if (!host) return
  const binding = { getTarget, getOverrides }
  targets.set(host, binding)
  const methods = bindings.get(host) ?? new Map<string, (...args: unknown[]) => unknown>()
  bindings.set(host, methods)
  for (const name of names) {
    if (methods.has(name)) continue
    const invoke = (...args: unknown[]) => {
      const current = targets.get(host)
      const target = current?.getTarget()
      const override = current?.getOverrides?.()
      const method = target && ((override && Reflect.get(override, name)) ?? Reflect.get(target, name))
      if (typeof method !== 'function') {
        throw new Error(`${host.localName} is not ready. Wait for whenTrChatReady(element) before calling ${name}().`)
      }
      return Reflect.apply(method, target, args)
    }
    Object.defineProperty(host, name, { configurable: true, value: invoke })
    methods.set(name, invoke)
  }
  onBeforeUnmount(() => {
    if (targets.get(host) === binding) targets.delete(host)
  })
}
