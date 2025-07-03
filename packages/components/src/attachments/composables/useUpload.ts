import { ref, Ref } from 'vue'
import type { Attachment, CustomRequestOptions } from '../index.type'

export interface UploadOptions {
  action?: string
  headers?: Record<string, unknown>
  data?: Record<string, unknown>
  withCredentials?: boolean
  beforeUpload?: (file: File) => boolean | Promise<boolean>
  customRequest?: (options: CustomRequestOptions) => void
}

export function useUpload(fileList: Ref<Attachment[]>, options: UploadOptions = {}) {
  const uploadingFiles = ref<Set<string>>(new Set())

  // 上传单个文件
  const uploadFile = async (file: Attachment) => {
    if (!file.rawFile || uploadingFiles.value.has(file.uid)) return

    // 标记为上传中
    uploadingFiles.value.add(file.uid)
    updateFileStatus(file, 'uploading', 'uploading')

    try {
      // 执行上传前检查
      if (options.beforeUpload) {
        console.log('beforeUpload')
        const shouldUpload = await options.beforeUpload(file.rawFile)
        if (!shouldUpload) {
          uploadingFiles.value.delete(file.uid)
          updateFileStatus(file, 'error', 'error')
          return
        }
      }

      // 使用自定义上传方法或默认上传方法
      if (options.customRequest) {
        options.customRequest({
          file: file.rawFile,
          onProgress: (e) => updateFileProgress(file, e.percent),
          onSuccess: (response) => handleUploadSuccess(file, response),
          onError: (err) => handleUploadError(file, err),
        })
      } else if (options.action) {
        // 默认的上传实现
        await defaultUpload(file)
      } else {
        // 如果没有提供上传方法和地址，直接标记为成功
        handleUploadSuccess(file, null)
      }
    } catch (err) {
      handleUploadError(file, err as Error)
    }
  }

  // 默认的上传实现
  const defaultUpload = async (file: Attachment) => {
    if (!file.rawFile || !options.action) return

    const formData = new FormData()
    formData.append('file', file.rawFile)

    // 添加额外参数
    if (options.data) {
      Object.entries(options.data).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }

    try {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', options.action, true)

      // 设置请求头
      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, String(value))
        })
      }

      // 设置凭证
      if (options.withCredentials) {
        xhr.withCredentials = true
      }

      // 监听上传进度
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded * 100) / e.total)
          updateFileProgress(file, percent)
        }
      })

      // 处理请求完成
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          handleUploadSuccess(file, xhr.response)
        } else {
          handleUploadError(file, new Error(`Upload failed with status ${xhr.status}`))
        }
      })

      // 处理请求错误
      xhr.addEventListener('error', () => {
        handleUploadError(file, new Error('Network error'))
      })

      // 发送请求
      xhr.send(formData)
    } catch (err) {
      handleUploadError(file, err as Error)
    }
  }

  // 更新文件状态
  const updateFileStatus = (file: Attachment, status: string, messageType?: Attachment['messageType']) => {
    const index = fileList.value.findIndex((f) => f.uid === file.uid)
    if (index !== -1) {
      fileList.value[index] = {
        ...fileList.value[index],
        status,
        messageType,
        isUploading: status === 'uploading',
      }
    }
  }

  // 更新文件上传进度
  const updateFileProgress = (file: Attachment, percent: number) => {
    const index = fileList.value.findIndex((f) => f.uid === file.uid)
    if (index !== -1) {
      fileList.value[index] = {
        ...fileList.value[index],
        progress: percent,
        status: 'uploading',
        messageType: 'uploading',
        isUploading: true,
      }
    }
  }

  // 处理上传成功
  const handleUploadSuccess = (file: Attachment, response: unknown) => {
    uploadingFiles.value.delete(file.uid)
    updateFileStatus(file, 'success', 'success')
    console.log('Upload success:', response)
  }

  // 处理上传失败
  const handleUploadError = (file: Attachment, err: Error) => {
    uploadingFiles.value.delete(file.uid)
    updateFileStatus(file, 'error', 'error')
    console.error('Upload error:', err)
  }

  // 上传所有文件
  const uploadAll = async () => {
    const pendingFiles = fileList.value.filter((file) => !['success', 'uploading'].includes(file.status || ''))

    for (const file of pendingFiles) {
      await uploadFile(file)
    }
  }

  // 重试上传
  const retryUpload = (file: Attachment) => {
    uploadFile(file)
  }

  return {
    uploadFile,
    uploadAll,
    retryUpload,
    uploadingFiles,
  }
}
