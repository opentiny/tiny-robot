import { ref, computed } from 'vue'
import type { UploadFile, AttachmentsProps, Attachment, OnChangeInfo, AttachmentsEmits } from '../index.type'
import { useFileType } from './useFileType'

const { detectFileType, createPreviewUrl } = useFileType()

export function useUploadIntegration(props: AttachmentsProps, emit: AttachmentsEmits) {
  const uploadRef = ref<{ $el: HTMLElement } | null>(null)
  const internalFileList = ref<Attachment[]>([])

  // Upload 配置
  const uploadConfig = computed(() => {
    if (!props.action && !props.customRequest) {
      return null // 不启用 Upload 功能
    }

    return {
      action: props.action,
      accept: props.accept || '*',
      multiple: true,
      disabled: props.disabled,
      beforeUpload: props.beforeUpload,
      customRequest: props.customRequest,
      headers: props.headers,
      data: props.data,
      withCredentials: props.withCredentials,
      autoUpload: props.autoUpload !== false,
      // 禁用 TinyFileUpload 的内置拖拽，使用我们自己的拖拽逻辑
      drag: false,
    }
  })

  // 统一的文件上传处理函数
  const processFiles = async (files: File[]) => {
    if (!uploadConfig.value) {
      // 如果没有配置上传，只是添加到文件列表
      const attachments = files.map((file) => ({
        uid: `${Date.now()}-${Math.random()}`,
        name: file.name,
        status: 'done',
        size: file.size,
        fileType: detectFileType(file.name),
        rawFile: file,
        previewUrl: createPreviewUrl(file),
        progress: 100,
        isUploading: false,
        messageType: 'success' as const,
      }))

      const newFileList = [...internalFileList.value, ...attachments]
      internalFileList.value = newFileList
      emit('update:items', newFileList)
      emit('files-dropped', attachments)
      return
    }

    // 使用 TinyFileUpload 的上传逻辑
    for (const file of files) {
      // 执行 beforeUpload 检查
      if (props.beforeUpload) {
        const result = await Promise.resolve(props.beforeUpload(file))
        if (result === false) {
          continue // 跳过这个文件
        }
      }

      // 创建临时文件对象
      const tempFile = {
        uid: `${Date.now()}-${Math.random()}`,
        name: file.name,
        status: 'uploading',
        size: file.size,
        fileType: detectFileType(file.name),
        rawFile: file,
        previewUrl: createPreviewUrl(file),
        progress: 0,
        isUploading: true,
        messageType: 'uploading' as const,
      }

      // 添加到文件列表
      internalFileList.value = [...internalFileList.value, tempFile]
      emit('update:items', internalFileList.value)

      // 执行上传
      if (props.customRequest) {
        // 使用自定义上传
        props.customRequest({
          file,
          onProgress: (event: { percent: number }) => {
            updateFileProgress(tempFile.uid, event.percent)
          },
          onSuccess: (response: unknown) => {
            updateFileStatus(tempFile.uid, 'done', response)
          },
          onError: (error: Error) => {
            updateFileStatus(tempFile.uid, 'error', null, error)
          },
        })
      } else if (props.action) {
        // 使用默认上传
        await uploadFile(file, tempFile.uid)
      }
    }
  }

  // 更新文件进度
  const updateFileProgress = (uid: string, percent: number) => {
    const fileIndex = internalFileList.value.findIndex((f) => f.uid === uid)
    if (fileIndex !== -1) {
      internalFileList.value[fileIndex].progress = percent
      emit('update:items', [...internalFileList.value])
    }
  }

  // 更新文件状态
  const updateFileStatus = (uid: string, status: string, response?: unknown, error?: unknown) => {
    const fileIndex = internalFileList.value.findIndex((f) => f.uid === uid)
    if (fileIndex !== -1) {
      internalFileList.value[fileIndex].status = status
      internalFileList.value[fileIndex].isUploading = status === 'uploading'
      internalFileList.value[fileIndex].messageType =
        status === 'error' ? 'error' : status === 'done' ? 'success' : 'info'

      if (status === 'done') {
        internalFileList.value[fileIndex].progress = 100
        // 如果响应中有 URL，更新预览 URL
        if (
          response &&
          typeof response === 'object' &&
          response !== null &&
          'url' in response &&
          typeof response.url === 'string'
        ) {
          internalFileList.value[fileIndex].previewUrl = response.url
        }
      }

      emit('update:items', [...internalFileList.value])

      // 触发相应的事件
      if (props.onChange) {
        props.onChange({
          file: internalFileList.value[fileIndex],
          fileList: internalFileList.value,
          event: error || response,
        })
      }
    }
  }

  // 默认上传实现
  const uploadFile = async (file: File, uid: string) => {
    const formData = new FormData()
    formData.append('file', file)

    // 添加额外数据
    if (props.data) {
      Object.keys(props.data).forEach((key) => {
        const value = props.data?.[key]
        if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })
    }

    try {
      const xhr = new XMLHttpRequest()

      // 设置进度监听
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100)
          updateFileProgress(uid, percent)
        }
      })

      // 设置请求头
      if (props.headers) {
        Object.keys(props.headers).forEach((key) => {
          const value = props.headers?.[key]
          if (value !== undefined && value !== null) {
            xhr.setRequestHeader(key, String(value))
          }
        })
      }

      // 设置凭证
      if (props.withCredentials) {
        xhr.withCredentials = true
      }

      return new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText)
              updateFileStatus(uid, 'done', response)
              resolve(response)
            } catch (_e) {
              updateFileStatus(uid, 'done', { url: xhr.responseText })
              resolve({ url: xhr.responseText })
            }
          } else {
            updateFileStatus(uid, 'error', null, new Error(`Upload failed: ${xhr.status}`))
            reject(new Error(`Upload failed: ${xhr.status}`))
          }
        }

        xhr.onerror = () => {
          updateFileStatus(uid, 'error', null, new Error('Upload failed'))
          reject(new Error('Upload failed'))
        }

        xhr.open('POST', props.action!)
        xhr.send(formData)
      })
    } catch (error) {
      updateFileStatus(uid, 'error', null, error)
      throw error
    }
  }

  // 处理 Upload 组件的 change 事件（点击上传）
  const handleUploadChange = (info: OnChangeInfo) => {
    const { fileList } = info

    // 转换为内部 Attachment 格式
    const attachments: Attachment[] = fileList.map(
      (f: UploadFile & { originFileObj?: File; percent?: number; url?: string }) => ({
        uid: f.uid,
        name: f.name,
        status: f.status,
        size: f.rawFile?.size,
        fileType: detectFileType(f.name),
        rawFile: f.originFileObj || f.rawFile,
        previewUrl: f.url || (f.originFileObj ? createPreviewUrl(f.originFileObj) : ''),
        progress: f.percent || 0,
        isUploading: f.status === 'uploading',
        messageType: f.status === 'error' ? 'error' : f.status === 'done' ? 'success' : 'info',
      }),
    )

    internalFileList.value = attachments
    emit('update:items', attachments)

    // 触发原有事件
    if (props.onChange) {
      props.onChange(info)
    }
  }

  // 触发上传
  const triggerUpload = () => {
    if (uploadRef.value && uploadRef.value.$el) {
      const input = uploadRef.value.$el.querySelector('input[type="file"]') as HTMLInputElement | null
      if (input) {
        input.click()
      }
    }
  }

  return {
    uploadRef,
    uploadConfig,
    handleUploadChange,
    triggerUpload,
    processFiles, // 统一的文件处理函数
    isUploadMode: computed(() => !!uploadConfig.value),
  }
}
