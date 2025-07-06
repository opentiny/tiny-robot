import { ref, computed } from 'vue'
import type { DragUploadWrapperProps, DragUploadWrapperEmits, FileRejection } from '../index.type'

export interface UseDragUploadOptions {
  props: DragUploadWrapperProps
  emit: DragUploadWrapperEmits
}

export function useDragUpload(options: UseDragUploadOptions) {
  const { props, emit } = options

  // 内部状态：用于追踪文件是否正被拖拽到区域上
  const isDragging = ref(false)

  // 使用一个计数器来解决进入子元素时触发 dragleave 的问题
  let dragCounter = 0

  // 计算样式类
  const wrapperClass = computed(() => ({
    'tr-drag-upload-wrapper': true,
    'tr-drag-upload-wrapper--dragging': isDragging.value,
    'tr-drag-upload-wrapper--disabled': props.disabled,
  }))

  /**
   * 验证文件类型
   * @param file 文件对象
   * @returns 是否符合accept规则
   */
  function validateFileType(file: File): boolean {
    if (!props.accept) return true

    const acceptTypes = props.accept.split(',').map((type) => type.trim())

    return acceptTypes.some((acceptType) => {
      if (acceptType.startsWith('.')) {
        // 扩展名匹配
        return file.name.toLowerCase().endsWith(acceptType.toLowerCase())
      } else if (acceptType.includes('/*')) {
        // MIME类型通配符匹配
        const baseType = acceptType.split('/')[0]
        return file.type.startsWith(baseType + '/')
      } else {
        // 精确MIME类型匹配
        return file.type === acceptType
      }
    })
  }

  /**
   * 过滤文件列表
   * @param files 文件列表
   * @returns 过滤后的文件列表
   */
  function filterFiles(files: File[]): File[] {
    let filteredFiles = files.filter(validateFileType)

    // 如果不支持多选，只取第一个文件
    if (!props.multiple && filteredFiles.length > 0) {
      filteredFiles = [filteredFiles[0]]
    }

    return filteredFiles
  }

  /**
   * 处理拖拽进入事件
   */
  function handleDragEnter(e: DragEvent) {
    if (props.disabled) return

    e.preventDefault()
    e.stopPropagation()

    dragCounter++
    // 只有当第一次进入时，才将状态设置为 true
    if (dragCounter === 1) {
      isDragging.value = true
      emit('drag-enter', e)
    }
  }

  /**
   * 处理拖拽经过事件
   */
  function handleDragOver(e: DragEvent) {
    if (props.disabled) return

    // 必须阻止默认行为，否则 drop 事件不会触发
    e.preventDefault()
    e.stopPropagation()

    emit('drag-over', e)
  }

  /**
   * 处理拖拽离开事件
   */
  function handleDragLeave(e: DragEvent) {
    if (props.disabled) return

    e.preventDefault()
    e.stopPropagation()

    dragCounter--
    // 只有当完全离开区域时，才将状态设置为 false
    if (dragCounter === 0) {
      isDragging.value = false
      emit('drag-leave', e)
    }
  }

  /**
   * 处理拖拽放下事件
   */
  function handleDrop(e: DragEvent) {
    if (props.disabled) return

    e.preventDefault()
    e.stopPropagation()

    // 重置所有状态
    dragCounter = 0
    isDragging.value = false

    const files = e.dataTransfer?.files
    if (files && files.length > 0) {
      const fileArray = Array.from(files)
      const filteredFiles = filterFiles(fileArray)

      if (filteredFiles.length > 0) {
        // 通过事件将文件列表暴露给父组件
        emit('files-dropped', filteredFiles)
      } else {
        // 如果没有符合条件的文件，触发错误事件
        const rejection: FileRejection = {
          files: fileArray,
          reason: 'invalid-file-type',
        }
        emit('files-rejected', rejection)
      }
    }

    emit('drop', e)
  }

  /**
   * 重置拖拽状态
   */
  function resetDragState() {
    dragCounter = 0
    isDragging.value = false
  }

  return {
    // 状态
    isDragging: computed(() => isDragging.value),
    wrapperClass,

    // 事件处理函数
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,

    // 工具函数
    resetDragState,
    validateFileType,
    filterFiles,
  }
}
