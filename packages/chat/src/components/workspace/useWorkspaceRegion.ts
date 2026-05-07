import { computed, ref, watch, type ComputedRef } from 'vue'
import type { ChatWorkspaceRegionConfig } from '@/types'
import { resolveWorkspaceCollapsedState, resolveWorkspaceRegionWidth } from './workspaceUtils'

interface UseWorkspaceRegionOptions {
  side: 'left' | 'right'
  region: ComputedRef<ChatWorkspaceRegionConfig | undefined>
  controlledCollapsed: ComputedRef<boolean | undefined>
  onUpdateCollapsed: (value: boolean) => void
}

export function useWorkspaceRegion(options: UseWorkspaceRegionOptions) {
  const uncontrolledCollapsed = ref(options.region.value?.defaultOpen === false)

  const collapseMode = computed(
    () => options.region.value?.collapseMode ?? (options.side === 'left' ? 'rail' : 'hidden'),
  )
  const isCollapsible = computed(() => options.region.value?.collapsible !== false)
  const regionWidth = computed(() => resolveWorkspaceRegionWidth(options.region.value?.width, options.side))

  watch(
    () => options.region.value?.defaultOpen,
    (defaultOpen) => {
      if (options.controlledCollapsed.value === undefined) {
        uncontrolledCollapsed.value = defaultOpen === false
      }
    },
  )

  const collapsedState = computed(() =>
    resolveWorkspaceCollapsedState(
      options.region.value,
      options.controlledCollapsed.value,
      uncontrolledCollapsed.value,
    ),
  )

  function updateCollapsed(nextValue: boolean) {
    const resolved = isCollapsible.value ? nextValue : false

    if (options.controlledCollapsed.value === undefined) {
      uncontrolledCollapsed.value = resolved
    }

    options.onUpdateCollapsed(resolved)
  }

  function toggleRegion() {
    updateCollapsed(!collapsedState.value)
  }

  return {
    collapseMode,
    isCollapsible,
    collapsedState,
    regionWidth,
    updateCollapsed,
    toggleRegion,
  }
}
