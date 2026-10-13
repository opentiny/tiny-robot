import { getCurrentInstance, onMounted, onUpdated, type ComponentInternalInstance } from 'vue'
import { forwardElementEvent } from './elementEvents'
import { signalTrChatReady } from './readiness'

type CustomElementInstance = ComponentInternalInstance & { ce?: HTMLElement }

export function useExperimentalElementHost(props: Record<string, unknown>, booleanProps: readonly string[]) {
  const instance = getCurrentInstance() as CustomElementInstance | null
  const getHost = () => instance?.ce

  function syncBooleanProperties() {
    const host = getHost() as (HTMLElement & Record<string, unknown>) | undefined
    if (!host) return

    for (const key of booleanProps) {
      if (host[key] !== props[key]) host[key] = props[key]
    }
  }

  function forward(name: string, detail?: unknown) {
    const host = getHost()
    return host ? forwardElementEvent(host, name, detail) : true
  }

  onMounted(() => {
    syncBooleanProperties()
    const host = getHost()
    if (host) signalTrChatReady(host)
  })
  onUpdated(syncBooleanProperties)

  return { forward, getHost }
}
