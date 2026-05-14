import { computed } from 'vue'
import { useSenderContext } from '../../sender/context'

export const useClearButtonState = () => {
  const { hasContent, clearable, loading, defaultActions } = useSenderContext()

  const isDisabled = computed<boolean>(() => {
    if (defaultActions.value?.clear?.disabled !== undefined) {
      return defaultActions.value.clear.disabled
    }

    return false
  })

  const tooltip = computed(() => defaultActions.value?.clear?.tooltip)

  const tooltipPlacement = computed(() => defaultActions.value?.clear?.tooltipPlacement ?? 'top')

  const show = computed<boolean>(() => {
    return clearable.value && hasContent.value && !loading.value && !isDisabled.value
  })

  return {
    isDisabled,
    tooltip,
    tooltipPlacement,
    show,
  }
}
