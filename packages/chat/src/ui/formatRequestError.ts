export function formatRequestError(error: unknown): string {
  if (error instanceof Error) {
    return error.message || safeString(error)
  }

  if (typeof error === 'string') {
    return error
  }

  if (error !== null && typeof error === 'object') {
    try {
      const text = JSON.stringify(error)
      if (text) {
        return text
      }
    } catch {
      return safeString(error)
    }
  }

  return safeString(error)
}

function safeString(error: unknown): string {
  try {
    return String(error)
  } catch {
    return '未知请求错误'
  }
}
