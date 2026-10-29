import type { MaybeRefOrGetter } from '@vueuse/core'
import { computed, toValue } from 'vue'
import type { LayoutAsideOpenDetail, LayoutAsideOptions, LayoutAsideResizeDetail, LayoutSide } from '../index.type'
import type { LayoutAsideState } from '../internal.type'
import { clamp } from '../utils/number'
import {
  getDefaultAsideExpandedWidth,
  getDefaultAsideMaxWidth,
  getDefaultAsideMinWidth,
  getDefaultAsideOpen,
} from '../utils/asidePresets'
import { useControllableState } from '../../shared/composables/useControllableState'

interface UseLayoutAsideStateOptions {
  side: LayoutSide
  config: MaybeRefOrGetter<LayoutAsideOptions | undefined>
  onOpenChange?: (detail: LayoutAsideOpenDetail) => void
  onExpandedWidthChange?: (detail: LayoutAsideResizeDetail) => void
}

interface UseLayoutAsideStatesOptions {
  leftConfig: MaybeRefOrGetter<LayoutAsideOptions | undefined>
  rightConfig: MaybeRefOrGetter<LayoutAsideOptions | undefined>
  onOpenChange?: (detail: LayoutAsideOpenDetail) => void
  onExpandedWidthChange?: (detail: LayoutAsideResizeDetail) => void
}

function resolveNonNegativeFiniteNumber(value: number | undefined, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback
  }

  return Math.max(0, value)
}

export function useLayoutAsideState(options: UseLayoutAsideStateOptions): LayoutAsideState {
  const { side } = options
  const configValue = computed(() => toValue(options.config))
  const mode = computed(() => configValue.value?.mode ?? 'dock')
  const collapsedWidth = computed(() => resolveNonNegativeFiniteNumber(configValue.value?.collapsedWidth, 0))
  const collapseEffect = computed(() => configValue.value?.collapseEffect ?? 'overlay')
  const resizable = computed(() => configValue.value?.resizable ?? false)
  const minExpandedWidth = computed(() =>
    resolveNonNegativeFiniteNumber(configValue.value?.minExpandedWidth, getDefaultAsideMinWidth(side)),
  )
  const maxExpandedWidth = computed(() => {
    const nextMaxWidth = resolveNonNegativeFiniteNumber(
      configValue.value?.maxExpandedWidth,
      getDefaultAsideMaxWidth(side),
    )
    return Math.max(minExpandedWidth.value, nextMaxWidth)
  })

  function normalizeExpandedWidth(value: number | undefined): number {
    return clamp(
      resolveNonNegativeFiniteNumber(value, getDefaultAsideExpandedWidth(side)),
      minExpandedWidth.value,
      maxExpandedWidth.value,
    )
  }

  const openState = useControllableState<boolean>({
    value: () => configValue.value?.open,
    defaultValue: () => configValue.value?.defaultOpen ?? getDefaultAsideOpen(side),
    onChange: (nextOpen) => options.onOpenChange?.({ side, open: nextOpen }),
  })

  const expandedWidthState = useControllableState<number>({
    value: () => configValue.value?.expandedWidth,
    defaultValue: () => normalizeExpandedWidth(configValue.value?.defaultExpandedWidth),
    onChange: (expandedWidth) => options.onExpandedWidthChange?.({ side, expandedWidth }),
  })

  const expandedWidth = computed(() => normalizeExpandedWidth(expandedWidthState.value))
  const isDock = computed(() => mode.value === 'dock')
  const isDrawer = computed(() => mode.value === 'drawer')
  const isRail = computed(() => isDock.value && !openState.value && collapsedWidth.value > 0)
  const isHidden = computed(() => !openState.value && !isRail.value)
  const canResize = computed(
    () => isDock.value && openState.value && resizable.value && maxExpandedWidth.value > minExpandedWidth.value,
  )

  function setOpen(nextOpen: boolean): void {
    if (openState.value !== nextOpen) {
      openState.value = nextOpen
    }
  }

  function setExpandedWidth(nextWidth: number): void {
    const normalizedWidth = normalizeExpandedWidth(nextWidth)
    if (expandedWidth.value !== normalizedWidth) {
      expandedWidthState.value = normalizedWidth
    }
  }

  return {
    side,
    isOpen: computed(() => openState.value),
    expandedWidth,
    collapsedWidth,
    collapseEffect,
    minExpandedWidth,
    maxExpandedWidth,
    isDock,
    isDrawer,
    isRail,
    isHidden,
    canResize,
    setOpen,
    setExpandedWidth,
  }
}

export function useLayoutAsideStates(options: UseLayoutAsideStatesOptions) {
  const leftAsideState = useLayoutAsideState({
    side: 'left',
    config: options.leftConfig,
    onOpenChange: options.onOpenChange,
    onExpandedWidthChange: options.onExpandedWidthChange,
  })
  const rightAsideState = useLayoutAsideState({
    side: 'right',
    config: options.rightConfig,
    onOpenChange: options.onOpenChange,
    onExpandedWidthChange: options.onExpandedWidthChange,
  })

  return {
    leftAsideState,
    rightAsideState,
  }
}
