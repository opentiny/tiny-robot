import { computed } from 'vue'
import type { LayoutAsideProps, LayoutFloatingState, LayoutSide, LayoutProps } from '../index.type'
import type { LayoutFloatingContext, LayoutPanel, LayoutResolvedFloating, LayoutState } from '../internal.type'
import { clamp } from '../utils/number'
import {
  getDefaultAsideExpandedWidth,
  getDefaultAsideMaxWidth,
  getDefaultAsideMinWidth,
  getDefaultAsideOpen,
} from '../utils/asidePresets'
import { emitAsideOpenChange, type LayoutEmitFn } from '../utils/asideEventEmitters'
import { useControllableState } from '../../shared/composables/useControllableState'

function isFloatingStateEqual(left: LayoutFloatingState | undefined, right: LayoutFloatingState | undefined): boolean {
  return (
    left?.placement === right?.placement &&
    left?.offsetX === right?.offsetX &&
    left?.offsetY === right?.offsetY &&
    left?.width === right?.width &&
    left?.height === right?.height
  )
}

function resolveFiniteNumber(value: number | undefined, fallback: number): number {
  return value === undefined || !Number.isFinite(value) ? fallback : value
}

function createAsidePanel(
  side: LayoutSide,
  aside: () => LayoutAsideProps | undefined,
  emit: LayoutEmitFn,
): LayoutPanel {
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
    isControlled: () => asideValue.value?.open !== undefined,
    onChange: (nextOpen) => emitAsideOpenChange(emit, { side, open: nextOpen }),
  })

  const widthState = useControllableState<number | undefined>({
    value: () => asideValue.value?.expandedWidth,
    defaultValue: () => resolveFiniteNumber(asideValue.value?.defaultExpandedWidth, getDefaultAsideExpandedWidth(side)),
    isControlled: () => asideValue.value?.expandedWidth !== undefined,
  })

  const resolvedOpen = computed(() => openState.resolvedState.value ?? getDefaultAsideOpen(side))
  const resolvedWidth = computed(() => {
    const nextWidth = resolveFiniteNumber(widthState.resolvedState.value, getDefaultAsideExpandedWidth(side))
    return clamp(nextWidth, minWidth.value, maxWidth.value)
  })

  const isDock = computed(() => layoutMode.value === 'dock')
  const isDrawer = computed(() => layoutMode.value === 'drawer')
  const isRail = computed(() => isDock.value && !resolvedOpen.value && collapsedWidth.value > 0)
  const isHidden = computed(() => !resolvedOpen.value && (isDrawer.value || !isRail.value))
  const canResize = computed(() => isDock.value && resolvedOpen.value && resizable.value)

  function setOpen(nextOpen: boolean): void {
    if (resolvedOpen.value === nextOpen) {
      return
    }

    openState.commit(nextOpen)
  }

  function setWidth(nextWidth: number): void {
    const clampedWidth = clamp(nextWidth, minWidth.value, maxWidth.value)
    if (resolvedWidth.value === clampedWidth) {
      return
    }

    widthState.commit(clampedWidth)
  }

  return {
    isOpen: resolvedOpen,
    width: resolvedWidth,
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

export function createLayoutState(props: LayoutProps, emit: LayoutEmitFn): LayoutState {
  const floatingState = useControllableState<LayoutFloatingState | undefined>({
    value: () => (props.mode === 'floating' ? props.floatingState : undefined),
    defaultValue: () => (props.mode === 'floating' ? props.defaultFloatingState : undefined),
    isControlled: () => props.mode === 'floating' && props.floatingState !== undefined,
    onChange: (nextFloatingState) => nextFloatingState && emit('update:floatingState', nextFloatingState),
  })

  const resolvedMode = computed(() => (props.mode === 'floating' ? 'floating' : 'normal'))
  const resolvedFloatingState = computed(() => floatingState.resolvedState.value)
  const resolvedFloating = computed<LayoutResolvedFloating | undefined>(() => {
    const nextFloatingState = resolvedFloatingState.value
    const nextFloatingOptions = props.mode === 'floating' ? props.floatingOptions : undefined

    if (!nextFloatingState && !nextFloatingOptions) {
      return undefined
    }

    return {
      ...nextFloatingOptions,
      ...nextFloatingState,
    }
  })

  const floating: LayoutFloatingContext = {
    state: {
      mode: resolvedMode,
      value: resolvedFloatingState,
      resolved: resolvedFloating,
    },
    actions: {
      initialize: (nextFloatingState) => {
        if (isFloatingStateEqual(resolvedFloatingState.value, nextFloatingState)) {
          return
        }

        floatingState.commit(nextFloatingState, { notify: false })
      },
      commit: (nextFloatingState) => {
        if (isFloatingStateEqual(resolvedFloatingState.value, nextFloatingState)) {
          return
        }

        floatingState.commit(nextFloatingState)
      },
    },
  }

  return {
    leftPanel: createAsidePanel('left', () => props.leftAside, emit),
    rightPanel: createAsidePanel('right', () => props.rightAside, emit),
    floating,
  }
}
