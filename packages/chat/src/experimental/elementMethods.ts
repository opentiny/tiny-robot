import { onBeforeUnmount, useHost } from 'vue'

const targets = new WeakMap<HTMLElement, () => object | null>()
const bindings = new WeakMap<HTMLElement, Map<string, (...args: unknown[]) => unknown>>()

/** Keep element methods stable while resolving the currently mounted inner component on every call. */
export function useElementMethods<T extends object>(getTarget: () => T | null, names: readonly (keyof T & string)[]) {
  const host = useHost()
  if (!host) return
  targets.set(host, getTarget)
  const methods = bindings.get(host) ?? new Map<string, (...args: unknown[]) => unknown>()
  bindings.set(host, methods)
  for (const name of names) {
    if (methods.has(name)) continue
    const invoke = (...args: unknown[]) => {
      const target = targets.get(host)?.()
      const method = target && Reflect.get(target, name)
      if (typeof method !== 'function') {
        throw new Error(`${host.localName} is not ready. Wait for whenTrChatReady(element) before calling ${name}().`)
      }
      return Reflect.apply(method, target, args)
    }
    Object.defineProperty(host, name, { configurable: true, value: invoke })
    methods.set(name, invoke)
  }
  onBeforeUnmount(() => {
    if (targets.get(host) === getTarget) targets.delete(host)
  })
}
