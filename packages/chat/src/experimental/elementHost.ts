import { onMounted, onUpdated, useHost } from 'vue'
import { signalTrChatReady } from './readiness'

export function useExperimentalElementHost(
  props: Record<string, unknown>,
  booleanProps: readonly string[],
  emitReady: () => void,
  isReady: () => boolean = () => true,
) {
  const host = useHost()

  function syncBooleanProperties() {
    if (!host) return
    for (const key of booleanProps) {
      if (Reflect.get(host, key) !== props[key]) Reflect.set(host, key, props[key])
    }
  }

  function signalReady() {
    if (host && isReady()) signalTrChatReady(host, emitReady)
  }

  onMounted(() => {
    syncBooleanProperties()
    signalReady()
  })
  onUpdated(() => {
    syncBooleanProperties()
    signalReady()
  })
}
