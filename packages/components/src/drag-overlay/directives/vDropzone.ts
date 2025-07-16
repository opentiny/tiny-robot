import type { Directive } from 'vue'
import { type Handlers, type DropzoneBinding, type FileRejection, FileRejectionCode } from '../index.type'

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
  rejection: FileRejection | null
} {
  const { accept, multiple, maxSize, maxFiles } = options
  const acceptedFiles: File[] = []
  const rejectedFiles: File[] = []

  if (!validateFileCount(files, maxFiles)) {
    return {
      acceptedFiles,
      rejectedFiles: Array.from(files),
      rejection: {
        files: Array.from(files),
        code: FileRejectionCode.FileCountExceeded,
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
      rejection: {
        files: acceptedFiles,
        code: FileRejectionCode.FileCountExceeded,
        message: '只允许上传一个文件',
      },
    }
  }

  if (rejectedFiles.length > 0) {
    const isSizeExceeded = rejectedFiles.some((file) => !validateFileSize(file, maxSize))
    const code = isSizeExceeded ? FileRejectionCode.FileSizeExceeded : FileRejectionCode.FileTypeNotAllowed
    const message = isSizeExceeded
      ? `文件大小不能超过 ${maxSize / 1024 / 1024}MB`
      : `文件类型不匹配 (accept: ${accept})`

    return {
      acceptedFiles,
      rejectedFiles,
      rejection: { files: rejectedFiles, code, message },
    }
  }

  return { acceptedFiles, rejectedFiles, rejection: null }
}

type DragAwareOptions = Omit<DropzoneBinding, 'isDragging' | 'targetElement' | 'disabled'>

interface DragAwareElement extends HTMLElement {
  __vDropzoneHandlers__?: Handlers
  __vDropzoneOptions__?: DragAwareOptions
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

    const { isDragging, targetElement, disabled } = binding.value

    const dragOptions: DragAwareOptions = {
      accept: binding.value.accept || '',
      multiple: binding.value.multiple || true,
      maxSize: binding.value.maxSize || 1024 * 1024 * 10,
      maxFiles: binding.value.maxFiles || 3,
      onDrop: binding.value.onDrop,
      onError: binding.value.onError,
    }

    const handlers: Handlers = {
      /**
       * 拖拽进入
       */
      handleDragEnter: () => {
        if (disabled) return
        dragCounter++
        if (dragCounter === 1) {
          isDragging.value = true
          targetElement.value = el
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
          isDragging.value = false
          targetElement.value = null
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
        isDragging.value = false
        targetElement.value = null

        const files = e.dataTransfer?.files
        const { onDrop, onError, accept, multiple, maxSize, maxFiles } = dragOptions
        if (files && files.length > 0) {
          const fileArray = Array.from(files)
          const { acceptedFiles, rejection } = processFiles(fileArray, {
            accept: accept!,
            multiple: multiple!,
            maxSize: maxSize!,
            maxFiles: maxFiles!,
          })

          if (rejection) {
            onError(rejection)
          }

          if (acceptedFiles.length > 0) {
            onDrop(acceptedFiles)
          }
        }
      },
    }

    el.__vDropzoneHandlers__ = handlers
    el.__vDropzoneOptions__ = dragOptions

    el.addEventListener('dragenter', handlers.handleDragEnter)
    el.addEventListener('dragover', handlers.handleDragOver)
    el.addEventListener('dragleave', handlers.handleDragLeave)
    el.addEventListener('drop', handlers.handleDrop)
  },
  updated(el, binding) {
    // 更新指令的配置和回调函数
    el.__vDropzoneOptions__ = {
      accept: binding.value.accept || '',
      multiple: binding.value.multiple || true,
      maxSize: binding.value.maxSize || 1024 * 1024 * 10,
      maxFiles: binding.value.maxFiles || 3,
      onDrop: binding.value.onDrop,
      onError: binding.value.onError,
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
