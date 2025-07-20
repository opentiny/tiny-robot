import type { Directive } from 'vue'
import { type Handlers, type DropzoneBinding, type RejectionReason } from '../index.type'
import { DragZoneErrorCode } from '../constants'

/**
 * 验证文件类型
 * @param file 文件
 * @param accept 接受的文件类型
 * @returns 是否接受
 */
function validateFileType(file: File, accept: string): boolean {
  if (!accept) return true
  const acceptTypes = accept.split(',').map((type) => type.trim())

  if (acceptTypes.includes('*')) return true

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
 * 处理文件
 * @param files 文件数组
 * @param options 选项
 * @returns 处理结果
 */
function processFiles(
  files: File[],
  options: {
    accept: string
    multiple: boolean
    maxSize: number
    maxFiles: number
  },
): {
  acceptedFiles: File[]
  rejectedFiles: File[]
  rejectionReason: RejectionReason | null
} {
  const { accept, multiple, maxSize, maxFiles } = options
  const acceptedFiles: File[] = []
  const rejectedFiles: File[] = []

  if (!validateFileCount(files, maxFiles)) {
    return {
      acceptedFiles,
      rejectedFiles: Array.from(files),
      rejectionReason: {
        code: DragZoneErrorCode.FileCountExceeded,
        message: `文件数量不能超过 ${maxFiles} 个`,
      },
    }
  }

  files.forEach((file) => {
    if (validateFileType(file, accept) && validateFileSize(file, maxSize)) {
      acceptedFiles.push(file)
    } else {
      rejectedFiles.push(file)
    }
  })

  if (!multiple && acceptedFiles.length > 1) {
    return {
      acceptedFiles: [],
      rejectedFiles: acceptedFiles,
      rejectionReason: {
        code: DragZoneErrorCode.FileCountExceeded,
        message: '只允许上传一个文件',
      },
    }
  }

  if (rejectedFiles.length > 0) {
    const isSizeExceeded = rejectedFiles.some((file) => !validateFileSize(file, maxSize))
    const code = isSizeExceeded ? DragZoneErrorCode.FileSizeExceeded : DragZoneErrorCode.FileTypeNotAllowed
    const message = isSizeExceeded
      ? `文件大小不能超过 ${maxSize / 1024 / 1024}MB`
      : `文件类型不匹配 (accept: ${accept})`

    return {
      acceptedFiles,
      rejectedFiles,
      rejectionReason: { code, message },
    }
  }

  return { acceptedFiles, rejectedFiles, rejectionReason: null }
}

type DragAwareOptions = Omit<DropzoneBinding, 'onDraggingChange'>

interface DragAwareElement extends HTMLElement {
  __vDropzoneHandlers__?: Handlers
  __vDropzoneOptions__?: DragAwareOptions
}

/**
 * 创建拖拽区域指令的配置
 * @param binding 绑定
 * @returns 配置
 */
function createDragOptions(binding: DropzoneBinding): DragAwareOptions {
  return {
    accept: binding.accept || '*',
    multiple: binding.multiple ?? true,
    maxSize: binding.maxSize || 1024 * 1024 * 10,
    maxFiles: binding.maxFiles || 3,
    onDrop: binding.onDrop,
    onError: binding.onError,
    disabled: binding.disabled || false,
  }
}

/**
 * 拖拽区域指令
 * @param el 元素
 * @param binding 绑定
 */
export const vDropzone: Directive<DragAwareElement, DropzoneBinding> = {
  /**
   * 挂载指令
   * @param el 元素
   * @param binding 绑定
   */
  mounted(el, binding) {
    let dragCounter = 0

    const { disabled, onDraggingChange } = binding.value

    el.__vDropzoneOptions__ = createDragOptions(binding.value)

    const handlers: Handlers = {
      /**
       * 拖拽进入
       */
      handleDragEnter: () => {
        if (disabled) return
        dragCounter++
        if (dragCounter === 1) {
          onDraggingChange(true, el)
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
          onDraggingChange(false, null)
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
        onDraggingChange(false, null)
        const files = e.dataTransfer?.files
        const { onDrop, onError, accept, multiple, maxSize, maxFiles } =
          el.__vDropzoneOptions__ as Required<DropzoneBinding>
        if (files && files.length > 0) {
          const fileArray = Array.from(files)
          const { acceptedFiles, rejectedFiles, rejectionReason } = processFiles(fileArray, {
            accept,
            multiple,
            maxSize,
            maxFiles,
          })

          if (rejectionReason) {
            onError({ files: rejectedFiles, ...rejectionReason })
          }

          if (acceptedFiles.length > 0) {
            onDrop(acceptedFiles)
          }
        }
      },
    }

    el.__vDropzoneHandlers__ = handlers

    el.addEventListener('dragenter', handlers.handleDragEnter)
    el.addEventListener('dragover', handlers.handleDragOver)
    el.addEventListener('dragleave', handlers.handleDragLeave)
    el.addEventListener('drop', handlers.handleDrop)
  },
  updated(el, binding) {
    // 更新指令的配置
    if (el.__vDropzoneOptions__) {
      el.__vDropzoneOptions__ = createDragOptions(binding.value)
    }
  },
  /**
   * 卸载指令
   * @param el 元素
   */
  unmounted(el) {
    if (el.__vDropzoneHandlers__) {
      el.removeEventListener('dragenter', el.__vDropzoneHandlers__.handleDragEnter)
      el.removeEventListener('dragover', el.__vDropzoneHandlers__.handleDragOver)
      el.removeEventListener('dragleave', el.__vDropzoneHandlers__.handleDragLeave)
      el.removeEventListener('drop', el.__vDropzoneHandlers__.handleDrop)
      delete el.__vDropzoneHandlers__
    }

    delete el.__vDropzoneOptions__
  },
}
