/**
 * 错误处理模块
 * 用于统一处理各种错误情况并提供标准化的错误格式
 */
import { AIAdapterError, ErrorType } from './types'

/**
 * 创建标准化的AI适配器错误
 * @param error 错误信息
 * @returns 标准化的AI适配器错误
 */
export function createError(error: Partial<AIAdapterError>): AIAdapterError {
  return {
    type: error.type || ErrorType.UNKNOWN_ERROR,
    message: error.message || '未知错误',
    statusCode: error.statusCode,
    originalError: error.originalError,
  }
}

interface Error {
  response?: object
  code?: string
  message?: string
}

/**
 * 处理API请求错误
 * @param error 原始错误
 * @returns 标准化的AI适配器错误
 */
export function handleRequestError(error: Error): AIAdapterError {
  // 网络错误
  if (!error.response) {
    return createError({
      type: ErrorType.NETWORK_ERROR,
      message: '网络连接错误，请检查您的网络连接',
      originalError: error,
    })
  }

  // 服务器返回的错误
  if (error.response) {
    const { status, data } = error.response

    // 身份验证错误
    if (status === 401 || status === 403) {
      return createError({
        type: ErrorType.AUTHENTICATION_ERROR,
        message: '身份验证失败，请检查您的API密钥',
        statusCode: status,
        originalError: error,
      })
    }

    // 速率限制错误
    if (status === 429) {
      return createError({
        type: ErrorType.RATE_LIMIT_ERROR,
        message: '超出API调用限制，请稍后再试',
        statusCode: status,
        originalError: error,
      })
    }

    // 服务器错误
    if (status >= 500) {
      return createError({
        type: ErrorType.SERVER_ERROR,
        message: '服务器错误，请稍后再试',
        statusCode: status,
        originalError: error,
      })
    }

    // 其他HTTP错误
    return createError({
      type: ErrorType.UNKNOWN_ERROR,
      message: data?.error?.message || `请求失败，状态码: ${status}`,
      statusCode: status,
      originalError: error,
    })
  }

  // 超时错误
  if (error.code === 'ECONNABORTED') {
    return createError({
      type: ErrorType.TIMEOUT_ERROR,
      message: '请求超时，请稍后再试',
      originalError: error,
    })
  }

  // 默认错误
  return createError({
    type: ErrorType.UNKNOWN_ERROR,
    message: error.message || '发生未知错误',
    originalError: error,
  })
}
