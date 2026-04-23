import { useTimeoutFn } from '@vueuse/core'
import { onBeforeUnmount, watch } from 'vue'
import type { ContentNavTargetFeedbackOptions } from '../internal.type'

function normalizeClassNames(value: string | undefined) {
  return (value ?? '')
    .split(/\s+/)
    .map((entry) => entry.trim())
    .filter(Boolean)
}

export function useTargetFeedback(options: ContentNavTargetFeedbackOptions) {
  let activeTarget: HTMLElement | null = null
  let activeClassNames: string[] = []

  function resetActiveTarget() {
    if (activeTarget && activeClassNames.length) {
      activeTarget.classList.remove(...activeClassNames)
    }

    activeTarget = null
    activeClassNames = []
  }

  const { start: startCleanupTimer, stop: stopCleanupTimer } = useTimeoutFn(
    () => {
      resetActiveTarget()
    },
    () => Math.max(0, options.feedbackDuration.value ?? 0),
    { immediate: false },
  )

  function clear() {
    stopCleanupTimer()
    resetActiveTarget()
  }

  function activate(id: string) {
    const classNames = normalizeClassNames(options.feedbackClass.value)
    clear()

    if (!classNames.length) {
      return
    }

    const target = options.resolveTarget(id)
    if (!target) {
      return
    }

    target.classList.remove(...classNames)
    void target.offsetWidth
    target.classList.add(...classNames)

    activeTarget = target
    activeClassNames = classNames

    startCleanupTimer()
  }

  watch(
    () => options.feedbackClass.value,
    () => {
      clear()
    },
  )

  onBeforeUnmount(() => {
    clear()
  })

  return {
    activate,
    clear,
  }
}
