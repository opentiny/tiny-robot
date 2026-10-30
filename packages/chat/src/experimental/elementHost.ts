import { getCurrentInstance, onMounted, onUpdated, type ComponentInternalInstance } from 'vue'
import { forwardElementEvent } from './elementEvents'
import { signalTrChatReady } from './readiness'

type CustomElementInstance = ComponentInternalInstance & { ce?: HTMLElement }

export function useExperimentalElementHost(
  props: Record<string, unknown>,
  booleanProps: readonly string[],
  isReady: () => boolean = () => true,
) {
  const instance = getCurrentInstance() as CustomElementInstance | null
  const getHost = () => instance?.ce
  let mounted = false

  function syncBooleanProperties() {
    const host = getHost() as (HTMLElement & Record<string, unknown>) | undefined
    if (!host) return

    for (const key of booleanProps) {
      if (host[key] !== props[key]) host[key] = props[key]
    }
  }

  function forward(name: string, detail?: unknown) {
    if (!mounted) {
      queueMicrotask(() => {
        const host = getHost()
        if (host?.isConnected) forwardElementEvent(host, name, detail)
      })
      return true
    }

    const host = getHost()
    return host ? forwardElementEvent(host, name, detail) : true
  }

  function signalReady() {
    if (!isReady()) return
    const host = getHost()
    if (host) signalTrChatReady(host)
  }

  onMounted(() => {
    mounted = true
    syncBooleanProperties()
    signalReady()
  })
  onUpdated(() => {
    syncBooleanProperties()
    signalReady()
  })

  return { forward, getHost }
}
