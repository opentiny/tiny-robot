import { reactive, watch, onBeforeUnmount } from 'vue'
import type { DragConfig } from '../index.type'

export function useDragDrop(options: { enabled: boolean; config?: DragConfig; onDrop: (files: File[]) => void }) {
  const dragState = reactive({
    active: false,
    isFullscreen: false,
    position: { x: 0, y: 0 },
  })

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
  }

  const initDrag = () => {
    const mode = options.config?.mode || 'container'
    dragState.isFullscreen = mode === 'fullscreen'

    dropElement = resolveDropTarget(options.config?.target)
    if (!dropElement && !dragState.isFullscreen) {
      console.warn('无法找到拖拽目标元素，将使用document.body作为默认值')
      dropElement = document.body
    }

    const isEventInDropZone = (e: DragEvent): boolean => {
      if (dragState.isFullscreen) return true

      if (!dropElement) return false

      const rect = dropElement.getBoundingClientRect()

      return e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom
    }

    // 处理document上的拖拽事件
    const handleDocumentDragOver = (e: DragEvent) => {
      e.preventDefault()

      // 更新鼠标位置
      dragState.position = { x: e.clientX, y: e.clientY }

      // 检查是否在拖拽区域内
      const inDropZone = isEventInDropZone(e)

      // 如果在区域内但未激活，则激活
      if (inDropZone && !dragState.active) {
        dragState.active = true
      }

      // 如果不在区域内但已激活，则取消激活
      if (!inDropZone && dragState.active) {
        resetState()
      }
    }

    const handleDocumentDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      // 只有在拖拽区域内放置文件时才处理
      if (isEventInDropZone(e)) {
        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
          const files = Array.from(e.dataTransfer.files)
          options.onDrop(files)
        }
      }

      // 总是重置状态
      resetState()
    }

    // 全局事件处理器
    const documentHandlers = {
      dragover: handleDocumentDragOver,
      drop: handleDocumentDrop,
    }

    // 添加document事件监听器
    Object.entries(documentHandlers).forEach(([event, handler]) => {
      document.addEventListener(event, handler as EventListener)
    })

    // 返回清理函数
    return () => {
      Object.entries(documentHandlers).forEach(([event, handler]) => {
        document.removeEventListener(event, handler as EventListener)
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
