import { computed, ref } from 'vue'
import type { AnchorFloatingOffsetOptions } from '../internal.type'

export function useFloatingOffset(options: AnchorFloatingOffsetOptions) {
  const offset = ref(0)

  function getFloatingNodes() {
    const hostEl = options.host.value
    const floatingEl = hostEl?.firstElementChild

    if (!(floatingEl instanceof HTMLElement)) {
      return {
        hostEl: hostEl ?? null,
        floatingEl: null,
        measuredEl: null,
      }
    }

    const measuredEl =
      floatingEl.querySelector<HTMLElement>('.tr-anchor__surface') ??
      floatingEl.querySelector<HTMLElement>('.tr-anchor__panel') ??
      floatingEl

    return {
      hostEl: hostEl ?? null,
      floatingEl,
      measuredEl,
    }
  }

  const resizeTargets = computed(() => {
    const { hostEl, floatingEl, measuredEl } = getFloatingNodes()
    const targets: HTMLElement[] = []

    if (hostEl) {
      targets.push(hostEl)
    }

    if (floatingEl) {
      targets.push(floatingEl)
    }

    if (measuredEl && measuredEl !== floatingEl) {
      targets.push(measuredEl)
    }

    return targets
  })

  function sync() {
    const { hostEl, floatingEl, measuredEl } = getFloatingNodes()
    const container = options.container.value
    const frameEl = hostEl?.parentElement

    if (!hostEl || !container || !frameEl || !floatingEl || !measuredEl) {
      offset.value = 0
      return
    }

    const frameRect = frameEl.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const floatingHeight = measuredEl.getBoundingClientRect().height || 0

    if (!containerRect.height || !floatingHeight) {
      offset.value = 0
      return
    }

    const containerTop = containerRect.top - frameRect.top
    const containerBottom = containerRect.bottom - frameRect.top
    const viewportCenter = containerTop + containerRect.height / 2
    const idealTop = viewportCenter - floatingHeight / 2
    const minTop = containerTop + 24
    const maxTop = Math.max(minTop, containerBottom - floatingHeight - 24)

    offset.value = Math.max(minTop, Math.min(idealTop, maxTop))
  }

  return {
    offset,
    sync,
    resizeTargets,
  }
}
