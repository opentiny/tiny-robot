import { computed } from 'vue'
import type { LayoutAsideProps, LayoutSide, LayoutProps } from '../index.type'
import type { LayoutAsidePanel } from '../internal.type'
import { clamp } from '../utils/number'
import {
  getDefaultAsideExpandedWidth,
  getDefaultAsideMaxWidth,
  getDefaultAsideMinWidth,
  getDefaultAsideOpen,
} from '../utils/asidePresets'
import { emitAsideOpenChange, type LayoutEmitFn } from '../utils/asideEventEmitters'
import { useControllableState } from '../../shared/composables/useControllableState'

function resolveFiniteNumber(value: number | undefined, fallback: number): number {
  return value === undefined || !Number.isFinite(value) ? fallback : value
}

function createAsideState(
  side: LayoutSide,
  aside: () => LayoutAsideProps | undefined,
  emit: LayoutEmitFn,
): LayoutAsidePanel {
  const asideValue = computed(() => aside())
  const layoutMode = computed(() => asideValue.value?.mode ?? 'dock')
  const collapsedWidth = computed(() => resolveFiniteNumber(asideValue.value?.collapsedWidth, 0))
  const collapseEffect = computed(() => asideValue.value?.collapseEffect ?? 'overlay')
  const resizable = computed(() => asideValue.value?.resizable ?? false)
  const minWidth = computed(() =>
    resolveFiniteNumber(asideValue.value?.minExpandedWidth, getDefaultAsideMinWidth(side)),
  )
  const maxWidth = computed(() => {
    const nextMaxWidth = resolveFiniteNumber(asideValue.value?.maxExpandedWidth, getDefaultAsideMaxWidth(side))
    return Math.max(minWidth.value, nextMaxWidth)
  })

  const openState = useControllableState<boolean>({
    value: () => asideValue.value?.open,
    defaultValue: () => asideValue.value?.defaultOpen ?? getDefaultAsideOpen(side),
    onChange: (nextOpen) => emitAsideOpenChange(emit, { side, open: nextOpen }),
  })

  const widthState = useControllableState<number>({
    value: () => asideValue.value?.expandedWidth,
    defaultValue: () => resolveFiniteNumber(asideValue.value?.defaultExpandedWidth, getDefaultAsideExpandedWidth(side)),
  })

  const isDock = computed(() => layoutMode.value === 'dock')
  const isDrawer = computed(() => layoutMode.value === 'drawer')
  const isRail = computed(() => isDock.value && !openState.value && collapsedWidth.value > 0)
  const isHidden = computed(() => !openState.value && (isDrawer.value || !isRail.value))
  const canResize = computed(() => isDock.value && openState.value && resizable.value)

  function setOpen(nextOpen: boolean): void {
    if (openState.value !== nextOpen) {
      openState.value = nextOpen
    }
  }

  function setWidth(nextWidth: number): void {
    const clampedWidth = clamp(nextWidth, minWidth.value, maxWidth.value)
    if (widthState.value !== clampedWidth) {
      widthState.value = clampedWidth
    }
  }

  return {
    side,
    isOpen: computed(() => openState.value),
    width: computed(() => widthState.value),
    collapsedWidth,
    collapseEffect,
    minWidth,
    maxWidth,
    isDock,
    isDrawer,
    isRail,
    isHidden,
    canResize,
    setOpen,
    setWidth,
  }
}

export function useLayoutAsideStates(props: LayoutProps, emit: LayoutEmitFn) {
  const leftPanel = createAsideState('left', () => props.leftAside, emit)
  const rightPanel = createAsideState('right', () => props.rightAside, emit)

  return {
    leftPanel,
    rightPanel,
  }
}
