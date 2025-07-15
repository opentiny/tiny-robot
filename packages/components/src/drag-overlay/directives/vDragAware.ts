import type { Directive } from 'vue'
import type { Handlers, DragAwareBinding, FileRejection } from '../index.type'

/**
 * 验证文件类型
 * @param file 文件
 * @param accept 接受的文件类型
 * @returns 是否接受
 */
function validateFileType(file: File, accept: string): boolean {
  if (!accept) return true
  const acceptTypes = accept.split(',').map((type) => type.trim())
  return acceptTypes.some((acceptType) => {
    if (acceptType.startsWith('.')) {
      return file.name.toLowerCase().endsWith(acceptType.toLowerCase())
    } else if (acceptType.includes('/*')) {
      const baseType = acceptType.split('/')[0]
      return file.type.startsWith(baseType + '/')
    } else {
      return file.type === acceptType
    }
  })
}

/**
 * 验证文件大小
 * @param file 文件
 * @param maxSize 最大文件大小
 * @returns 是否接受
 */
function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize
}

/**
 * 验证文件数量
 * @param files 文件数组
 * @param maxFiles 最大文件数量
 * @returns 是否接受
 */
function validateFileCount(files: File[], maxFiles: number): boolean {
  return files.length <= maxFiles
}

/**
 * 拖拽感知指令
 * @param el 元素
 * @param binding 绑定
 */
export const vDragAware: Directive<HTMLElement & { _dragHandlers?: Handlers }, DragAwareBinding> = {
  /**
   * 挂载指令
   * @param el 元素
   * @param binding 绑定
   */
  mounted(el, binding) {
    let dragCounter = 0
    let isDragging = false
    const {
      onStateChange,
      onFilesDropped,
      onFilesRejected,
      accept = '',
      multiple = true,
      disabled = false,
      maxSize = 1024 * 1024 * 10,
      maxFiles = 3,
    } = binding.value

    const updateRect = () => {
      if (isDragging) {
        onStateChange(true, el.getBoundingClientRect())
      }
    }

    const resizeObserver = new ResizeObserver(updateRect)

    const startMonitoring = () => {
      resizeObserver.observe(el)
      window.addEventListener('scroll', updateRect, true)
    }

    const stopMonitoring = () => {
      resizeObserver.unobserve(el)
      window.removeEventListener('scroll', updateRect, true)
    }

    const handlers: Handlers = {
      /**
       * 拖拽进入
       */
      handleDragEnter: () => {
        if (disabled) return
        dragCounter++
        if (dragCounter === 1) {
          isDragging = true
          onStateChange(true, el.getBoundingClientRect())
          startMonitoring()
        }
      },
      /**
       * 拖拽覆盖
       * @param e 事件
       */
      handleDragOver: (e: DragEvent) => {
        if (disabled) return
        e.preventDefault()
      },
      /**
       * 拖拽离开
       */
      handleDragLeave: () => {
        if (disabled) return
        dragCounter--
        if (dragCounter === 0) {
          isDragging = false
          onStateChange(false, null)
          stopMonitoring()
        }
      },
      /**
       * 拖拽放下
       * @param e 事件
       */
      handleDrop: (e: DragEvent) => {
        if (disabled) return
        e.preventDefault()
        dragCounter = 0
        isDragging = false
        onStateChange(false, null)
        stopMonitoring()

        const files = e.dataTransfer?.files
        if (files && files.length > 0) {
          const fileArray = Array.from(files)
          const acceptedFiles: File[] = []
          const rejectedFiles: File[] = []

          // 校验文件数量
          if (!validateFileCount(fileArray, maxFiles)) {
            const rejection: FileRejection = { files: fileArray, reason: 'file-count-exceeded' }
            onFilesRejected(rejection)
            return
          }

          fileArray.forEach((file) => {
            if (validateFileType(file, accept || '') && validateFileSize(file, maxSize)) {
              acceptedFiles.push(file)
            } else {
              rejectedFiles.push(file)
            }
          })

          if (!multiple && acceptedFiles.length > 1) {
            // 如果不允许上传多个文件，但拖入了多个文件
            const rejection: FileRejection = { files: acceptedFiles, reason: 'file-count-exceeded' }
            onFilesRejected(rejection)
            return
          }

          if (acceptedFiles.length > 0) {
            onFilesDropped(acceptedFiles)
          }

          if (rejectedFiles.length > 0) {
            let reason: FileRejection['reason'] = 'file-type-not-allowed'
            if (rejectedFiles.some((file) => !validateFileSize(file, maxSize))) {
              reason = 'file-size-exceeded'
            }
            const rejection: FileRejection = { files: rejectedFiles, reason }
            onFilesRejected(rejection)
          }
        }
      },
    }

    el._dragHandlers = handlers
    el.addEventListener('dragenter', handlers.handleDragEnter)
    el.addEventListener('dragover', handlers.handleDragOver)
    el.addEventListener('dragleave', handlers.handleDragLeave)
    el.addEventListener('drop', handlers.handleDrop)
  },
  /**
   * 卸载指令
   * @param el 元素
   */
  unmounted(el) {
    if (el._dragHandlers) {
      el.removeEventListener('dragenter', el._dragHandlers.handleDragEnter)
      el.removeEventListener('dragover', el._dragHandlers.handleDragOver)
      el.removeEventListener('dragleave', el._dragHandlers.handleDragLeave)
      el.removeEventListener('drop', el._dragHandlers.handleDrop)
      delete el._dragHandlers
    }
  },
}
