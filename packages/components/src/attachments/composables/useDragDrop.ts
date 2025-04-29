import { reactive, watch, onBeforeUnmount } from 'vue'
import type { DragConfig } from '../index.type'

export function useDragDrop(options: { enabled: boolean; config?: DragConfig; onDrop: (files: File[]) => void }) {
  const dragState = reactive({
    active: false,
    isFullscreen: false,
    position: { x: 0, y: 0 },
  })

  let dragCounter = 0
  let dropElement: HTMLElement | null = null
  let cleanup: (() => void) | undefined

  const resolveDropTarget = (target?: string | HTMLElement): HTMLElement | null => {
    if (!target) return document.body
    if (typeof target === 'string') {
      const el = document.querySelector(target)
      return el as HTMLElement
    }
    return target as HTMLElement
  }

  const resetState = () => {
    dragState.active = false
    dragCounter = 0
  }

  const initDrag = () => {
    const mode = options.config?.mode || 'container'
    dragState.isFullscreen = mode === 'fullscreen'

    dropElement = resolveDropTarget(options.config?.target)
    if (!dropElement && !dragState.isFullscreen) {
      console.warn('无法找到拖拽目标元素，将使用document.body作为默认值')
      dropElement = document.body
    }

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault()
      if (!dragState.active) {
        dragState.active = true
        dragCounter = 1
      } else {
        dragCounter++
      }
    }

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragState.position = { x: e.clientX, y: e.clientY }
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      dragCounter--
      if (dragCounter <= 0) {
        resetState()
      }
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files)
        options.onDrop(files)
      }
      resetState()
    }

    const handlers = {
      dragenter: handleDragEnter,
      dragover: handleDragOver,
      dragleave: handleDragLeave,
      drop: handleDrop,
    }

    const eventTarget = dragState.isFullscreen ? window : dropElement

    if (!eventTarget) {
      console.error('无效的拖拽目标元素')
      return () => {}
    }

    Object.entries(handlers).forEach(([event, handler]) => {
      eventTarget.addEventListener(event, handler as EventListener)
    })

    return () => {
      if (!eventTarget) return

      Object.entries(handlers).forEach(([event, handler]) => {
        eventTarget.removeEventListener(event, handler as EventListener)
      })
    }
  }

  const updateDragState = (enabled: boolean) => {
    if (cleanup) {
      cleanup()
      cleanup = undefined
    }

    if (enabled) {
      cleanup = initDrag()
    }
  }

  watch(() => options.enabled, updateDragState, { immediate: true })

  onBeforeUnmount(() => {
    if (cleanup) {
      cleanup()
      cleanup = undefined
    }
  })

  return {
    dragState,
    dropZone: () => dropElement,
    initDrag: () => updateDragState(true),
    cleanupDrag: () => updateDragState(false),
  }
}
