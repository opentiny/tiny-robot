import { reactive, watch, onBeforeUnmount, computed, ref } from 'vue'
import type { DragConfig, AttachmentsProps } from '../index.type'

/**
 * 拖拽处理
 * @param options 配置
 * @param props 属性
 * @returns 拖拽状态
 */
export function useDragDrop(options: { onDrop: (files: File[]) => void }, props: AttachmentsProps) {
  const dropZoneRef = ref<HTMLElement | null>(null)

  const dragState = reactive({
    active: false,
    isFullscreen: false,
    position: { x: 0, y: 0 },
  })

  const isDragEnabled = computed(() => !!props.drag && !props.disabled)
  const dragConfig = computed(() => props.drag as DragConfig)

  let cleanup: (() => void) | undefined

  /**
   * 解析拖拽目标
   * @returns 拖拽目标
   */
  const resolveDropTarget = (): HTMLElement | null => {
    const config = dragConfig.value
    dragState.isFullscreen = typeof config === 'object' && config.mode === 'fullscreen'

    if (dragState.isFullscreen) {
      return document.body
    }

    if (typeof config === 'object' && config.target) {
      if (typeof config.target === 'string') {
        return (document.querySelector(config.target) as HTMLElement) || null
      }
      return config.target
    }

    return dropZoneRef.value
  }

  const resetState = () => {
    dragState.active = false
  }

  const updateDragListeners = () => {
    // 先清理旧的监听器
    if (cleanup) {
      cleanup()
      cleanup = undefined
    }

    // 如果拖拽未启用，则不进行任何操作
    if (!isDragEnabled.value) {
      return
    }

    const dropElement = resolveDropTarget()

    if (!dropElement) {
      if (typeof dragConfig.value === 'object' && dragConfig.value.mode !== 'fullscreen') {
        console.warn('[tiny-robot]: Drag and drop target element not found.')
      }
      return
    }

    const isEventInDropZone = (e: DragEvent): boolean => {
      if (dragState.isFullscreen) return true
      // dropElement 已经被检查过，所以这里是安全的
      const rect = dropElement.getBoundingClientRect()
      return e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom
    }

    const handleDocumentDragOver = (e: DragEvent) => {
      e.preventDefault()
      dragState.position = { x: e.clientX, y: e.clientY }
      dragState.active = isEventInDropZone(e)
    }

    const handleDocumentDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (isEventInDropZone(e)) {
        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
          options.onDrop(Array.from(e.dataTransfer.files))
        }
      }

      resetState()
    }

    const handleDocumentDragLeave = (e: DragEvent) => {
      if (e.relatedTarget === null || e.target === document.body) {
        resetState()
      }
    }

    const eventHandlers = {
      dragover: handleDocumentDragOver,
      drop: handleDocumentDrop,
      dragleave: handleDocumentDragLeave,
    }

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      document.addEventListener(event, handler as EventListener)
    })

    cleanup = () => {
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        document.removeEventListener(event, handler as EventListener)
      })
    }
  }

  watch(isDragEnabled, updateDragListeners, { immediate: true })

  watch(
    () => dragConfig.value,
    () => {
      // 当配置变化时，重新设置监听器
      updateDragListeners()
    },
    { deep: true },
  )

  onBeforeUnmount(() => {
    if (cleanup) {
      cleanup()
      cleanup = undefined
    }
  })

  return {
    dragState,
    dropZoneRef,
    isDragFullscreen: computed(() => dragState.isFullscreen),
  }
}
