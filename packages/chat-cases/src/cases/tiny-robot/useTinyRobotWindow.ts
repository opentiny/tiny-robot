import type { LayoutFloatingOptions, LayoutFloatingState } from '@opentiny/tiny-robot'
import { useEventListener, useWindowSize } from '@vueuse/core'
import { computed, shallowRef, watch } from 'vue'

export type TinyRobotDisplayMode = 'floating' | 'fullscreen' | 'side'

export function useTinyRobotWindow() {
  const show = shallowRef(true)
  const displayMode = shallowRef<TinyRobotDisplayMode>('floating')
  const restoreFloatingState = shallowRef<LayoutFloatingState | null>(null)
  const restoreDisplayMode = shallowRef<'floating' | 'side'>('floating')
  const floatingState = shallowRef<LayoutFloatingState>({
    placement: 'center',
    offsetX: 24,
    offsetY: 24,
    width: 640,
    height: 760,
  })
  const { width: viewportWidth, height: viewportHeight } = useWindowSize()

  const floatingOptions = computed<LayoutFloatingOptions>(() => ({
    draggable: displayMode.value === 'floating',
    resizable: displayMode.value === 'floating',
    minWidth: displayMode.value === 'floating' ? 360 : undefined,
    minHeight: displayMode.value === 'floating' ? 480 : undefined,
  }))

  const layoutStyle = computed(() => ({
    '--tr-layout-main-min-width': '0',
    '--tr-layout-floating-radius': displayMode.value === 'floating' && viewportWidth.value > 640 ? '12px' : '0px',
    '--tr-layout-floating-shadow':
      displayMode.value === 'floating' && viewportWidth.value > 640 ? '0 18px 48px rgb(0 0 0 / 18%)' : 'none',
  }))

  function getModeFloatingState(mode: Exclude<TinyRobotDisplayMode, 'floating'>): LayoutFloatingState {
    if (mode === 'side') {
      return {
        placement: 'top-right',
        offsetX: 0,
        offsetY: 0,
        width: 440,
        height: viewportHeight.value,
      }
    }

    return {
      placement: 'top-left',
      offsetX: 0,
      offsetY: 0,
      width: viewportWidth.value,
      height: viewportHeight.value,
    }
  }

  function setDisplayMode(mode: TinyRobotDisplayMode): void {
    if (mode === displayMode.value) {
      return
    }

    if (displayMode.value === 'floating') {
      restoreFloatingState.value = { ...floatingState.value }
    }

    if (mode === 'floating') {
      displayMode.value = mode
      if (restoreFloatingState.value) {
        floatingState.value = { ...restoreFloatingState.value }
        restoreFloatingState.value = null
      }
      return
    }

    if (mode === 'fullscreen') {
      restoreDisplayMode.value = displayMode.value === 'side' ? 'side' : 'floating'
    }

    displayMode.value = mode
    floatingState.value = getModeFloatingState(mode)
  }

  function handleEscape(event: KeyboardEvent): void {
    if (event.key === 'Escape' && displayMode.value === 'fullscreen') {
      setDisplayMode(restoreDisplayMode.value)
    }
  }

  useEventListener('keydown', handleEscape)

  watch([displayMode, viewportWidth, viewportHeight], () => {
    if (displayMode.value === 'fullscreen' || displayMode.value === 'side') {
      floatingState.value = getModeFloatingState(displayMode.value)
    }
  })

  function close(): void {
    show.value = false
  }

  return {
    show,
    displayMode,
    floatingState,
    floatingOptions,
    layoutStyle,
    setDisplayMode,
    close,
  }
}
