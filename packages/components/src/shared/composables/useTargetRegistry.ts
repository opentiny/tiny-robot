import { type MaybeElement, unrefElement } from '@vueuse/core'
import { ref, type ComponentPublicInstance, type Ref } from 'vue'

export interface TargetRegistryEntry {
  id: string
  el: HTMLElement
}

export type TargetBinder = (target: Element | ComponentPublicInstance | null) => void

export interface TargetRegistry {
  version: Readonly<Ref<number>>
  register: (id: string, el: HTMLElement | null) => void
  unregister: (id: string) => void
  get: (id: string) => HTMLElement | null
  getAll: () => TargetRegistryEntry[]
  bindTarget: (id: string) => TargetBinder
  prune: (activeIds: Iterable<string>) => void
}

export function useTargetRegistry(): TargetRegistry {
  const registry = new Map<string, HTMLElement>()
  const targetBinders = new Map<string, TargetBinder>()
  const version = ref(0)
  const noopTargetBinder: TargetBinder = () => {}

  const touch = () => {
    version.value += 1
  }

  function register(id: string, el: HTMLElement | null) {
    if (!id) {
      return
    }

    if (!el) {
      if (registry.delete(id)) {
        touch()
      }
      return
    }

    const current = registry.get(id)
    if (current !== el) {
      registry.set(id, el)
      touch()
    }
  }

  function unregister(id: string) {
    if (registry.delete(id)) {
      touch()
    }
  }

  function get(id: string) {
    return registry.get(id) ?? null
  }

  function getAll() {
    return Array.from(registry.entries()).map(([id, el]) => ({ id, el }))
  }

  function bindTarget(id: string) {
    if (!id) {
      return noopTargetBinder
    }

    const cachedBinder = targetBinders.get(id)
    if (cachedBinder) {
      return cachedBinder
    }

    const binder: TargetBinder = (target) => {
      const el = unrefElement(target as MaybeElement)
      if (!(el instanceof HTMLElement)) {
        unregister(id)
        return
      }

      register(id, el)
    }

    targetBinders.set(id, binder)
    return binder
  }

  function prune(activeIds: Iterable<string>) {
    const activeIdSet = new Set(activeIds)

    getAll().forEach(({ id }) => {
      if (!activeIdSet.has(id)) {
        unregister(id)
      }
    })

    for (const id of targetBinders.keys()) {
      if (!activeIdSet.has(id)) {
        targetBinders.delete(id)
      }
    }
  }

  return {
    version,
    register,
    unregister,
    get,
    getAll,
    bindTarget,
    prune,
  }
}
