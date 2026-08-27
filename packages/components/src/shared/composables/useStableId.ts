import * as Vue from 'vue'

type VueWithUseId = typeof Vue & {
  useId?: () => string
}

const appIdCounters = new WeakMap<object, number>()

export function useStableId() {
  const nativeUseId = (Vue as VueWithUseId).useId
  if (nativeUseId) {
    return nativeUseId()
  }

  const instance = Vue.getCurrentInstance()
  if (!instance) {
    return ''
  }

  const appContext = instance.appContext
  const id = appIdCounters.get(appContext) ?? 0
  appIdCounters.set(appContext, id + 1)

  return `tr-${id}`
}
