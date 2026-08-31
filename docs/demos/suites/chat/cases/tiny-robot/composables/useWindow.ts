import type { LayoutFloatingOptions, LayoutFloatingState } from '@opentiny/tiny-robot'
import { useEventListener, useWindowSize } from '@vueuse/core'
import { computed, shallowRef, watch } from 'vue'

export type DisplayMode = 'floating' | 'fullscreen'

export function useWindow() {
  const show = shallowRef(false)
  const displayMode = shallowRef<DisplayMode>('floating')
  const floatingState = shallowRef<LayoutFloatingState>({
    placement: 'center',
    offsetX: 24,
    offsetY: 24,
    width: 640,
    height: 760,
  })
  const restoreFloatingState = shallowRef<LayoutFloatingState | null>(null)
  const { width, height } = useWindowSize()

  const floatingOptions = computed<LayoutFloatingOptions>(() => ({
    draggable: displayMode.value === 'floating',
    resizable: displayMode.value === 'floating',
    minWidth: displayMode.value === 'floating' ? 360 : undefined,
    minHeight: displayMode.value === 'floating' ? 480 : undefined,
  }))

  const layoutStyle = computed(() => ({
    '--tr-layout-main-min-width': '0',
    '--tr-layout-floating-radius': displayMode.value === 'floating' && width.value > 640 ? '12px' : '0px',
    '--tr-layout-floating-shadow':
      displayMode.value === 'floating' && width.value > 640 ? '0 18px 48px rgb(0 0 0 / 18%)' : 'none',
  }))

  function getFullscreenState(): LayoutFloatingState {
    return { placement: 'top-left', offsetX: 0, offsetY: 0, width: width.value, height: height.value }
  }

  function setDisplayMode(mode: DisplayMode): void {
    if (mode === displayMode.value) return
    if (displayMode.value === 'floating') restoreFloatingState.value = { ...floatingState.value }
    displayMode.value = mode
    if (mode === 'floating') {
      if (restoreFloatingState.value) floatingState.value = { ...restoreFloatingState.value }
      restoreFloatingState.value = null
    } else {
      floatingState.value = getFullscreenState()
    }
  }

  function handleEscape(event: KeyboardEvent): void {
    if (event.key === 'Escape' && displayMode.value === 'fullscreen') setDisplayMode('floating')
  }

  useEventListener('keydown', handleEscape)
  watch(
    [displayMode, width, height],
    () => {
      if (displayMode.value === 'fullscreen') floatingState.value = getFullscreenState()
    },
    { immediate: true },
  )

  function open(): void {
    show.value = true
  }

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
    restoreFloatingState,
    handleEscape,
    open,
    close,
  }
}
