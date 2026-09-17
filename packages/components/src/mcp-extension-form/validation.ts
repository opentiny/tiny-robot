import type { McpExtensionFormData } from './index.type'

export type McpExtensionFormErrors = Partial<Record<keyof McpExtensionFormData, string>>

export const isJsonObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export const parseJsonObject = (value: string) => {
  const parsed: unknown = JSON.parse(value)
  return isJsonObject(parsed) ? parsed : undefined
}

export const validateMcpExtensionField = (
  field: keyof McpExtensionFormData,
  form: McpExtensionFormData,
): string | undefined => {
  if (field === 'name') return form.name.trim() ? undefined : '请输入名称'
  if (field === 'description') {
    return form.description.length <= 1000 ? undefined : '描述不能超过 1000 个字符'
  }

  if (field === 'url') {
    return isHttpUrl(form.url.trim()) ? undefined : '请输入有效的 HTTP 或 HTTPS URL'
  }

  if (field === 'thumbnail') {
    const thumbnail = form.thumbnail?.trim()
    return !thumbnail || isHttpUrl(thumbnail) ? undefined : '请输入有效的 HTTP 或 HTTPS 图片 URL'
  }

  if (field === 'headers') {
    if (!form.headers.trim()) return undefined

    try {
      return isJsonObject(JSON.parse(form.headers)) ? undefined : '请求头必须是 JSON 对象'
    } catch {
      return '请求头必须是有效的 JSON 对象'
    }
  }

  return undefined
}

const validatedFormFields = ['name', 'description', 'url', 'thumbnail', 'headers'] as const

export const validateMcpExtensionForm = (form: McpExtensionFormData) => {
  const errors: McpExtensionFormErrors = {}

  validatedFormFields.forEach((field) => {
    const error = validateMcpExtensionField(field, form)
    if (error) errors[field] = error
  })

  return errors
}

export const validateMcpExtensionCode = (code: string): string | undefined => {
  if (!code.trim()) return '配置必须是 JSON 对象'

  try {
    return parseJsonObject(code) ? undefined : '配置必须是 JSON 对象'
  } catch {
    return '请输入有效的 JSON 对象'
  }
}

export const parseMcpExtensionHeaders = (headers: string) => (headers.trim() ? (parseJsonObject(headers) ?? {}) : {})
