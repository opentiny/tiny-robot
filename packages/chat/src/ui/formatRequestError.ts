export function formatRequestError(error: unknown): string {
  if (error instanceof Error) {
    return error.message || String(error)
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
      return String(error)
    }
  }

  return String(error)
}
