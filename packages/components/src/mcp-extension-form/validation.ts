import { parseMcpExtensionConfig } from '../mcp-extension-storage/config'
import type { McpExtensionFormValue } from './index.type'
import type { McpExtensionFormDraft } from './internal.type'

export type McpExtensionFormErrors = Partial<Record<keyof McpExtensionFormDraft, string>>

const isJsonObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export const parseMcpExtensionHeaders = (source: string): Record<string, string> | undefined => {
  if (!source.trim()) return undefined

  const parsed: unknown = JSON.parse(source)
  if (!isJsonObject(parsed)) throw new Error('请求头必须是 JSON 对象')

  const headers = Object.create(null) as Record<string, string>
  Object.entries(parsed).forEach(([rawName, value]) => {
    const name = rawName.trim()
    if (!name) throw new Error('请求头名称不能为空')
    if (Object.prototype.hasOwnProperty.call(headers, name)) throw new Error(`请求头名称重复：${name}`)
    if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
      throw new Error(`请求头 ${name} 的值必须是字符串、数字或布尔值`)
    }
    Object.defineProperty(headers, name, {
      configurable: true,
      enumerable: true,
      value: String(value),
      writable: true,
    })
  })

  return Object.keys(headers).length ? headers : undefined
}

export const toMcpExtensionFormDraft = (value: McpExtensionFormValue): McpExtensionFormDraft => ({
  name: value.name,
  description: value.description ?? '',
  type: value.type,
  url: value.url,
  headers: value.headers ? JSON.stringify(value.headers, null, 2) : '',
  thumbnail: value.thumbnail ?? null,
})

export const toMcpExtensionFormValue = (draft: McpExtensionFormDraft): McpExtensionFormValue => {
  const value: McpExtensionFormValue = {
    name: draft.name.trim(),
    type: draft.type,
    url: draft.url.trim(),
  }
  const description = draft.description.trim()
  const headers = parseMcpExtensionHeaders(draft.headers)
  const thumbnail = draft.thumbnail?.trim()

  if (description) value.description = description
  if (headers) value.headers = headers
  if (thumbnail) value.thumbnail = thumbnail

  return value
}

const omitEmptyOptionalFields = (value: {
  name: string
  description: string
  type: McpExtensionFormValue['type']
  url: string
  headers: Record<string, string>
  thumbnail: string | null
}): McpExtensionFormValue => {
  const normalized: McpExtensionFormValue = {
    name: value.name,
    type: value.type,
    url: value.url,
  }

  if (value.description) normalized.description = value.description
  if (Object.keys(value.headers).length) normalized.headers = value.headers
  if (value.thumbnail) normalized.thumbnail = value.thumbnail

  return normalized
}

export const parseMcpExtensionCode = (code: string): McpExtensionFormValue =>
  omitEmptyOptionalFields(parseMcpExtensionConfig(code))

export const serializeMcpExtensionCode = (value: McpExtensionFormValue) => {
  const server: Record<string, unknown> = {
    type: value.type,
    url: value.url,
  }

  if (value.description) server.description = value.description
  if (value.headers && Object.keys(value.headers).length) server.headers = value.headers
  if (value.thumbnail) server.thumbnail = value.thumbnail

  return JSON.stringify(
    {
      mcpServers: {
        [value.name.trim() || 'mcp-server']: server,
      },
    },
    null,
    2,
  )
}

export const validateMcpExtensionField = (
  field: keyof McpExtensionFormDraft,
  form: McpExtensionFormDraft,
): string | undefined => {
  if (field === 'name') return form.name.trim() ? undefined : '请输入名称'
  if (field === 'description') {
    return form.description.length <= 1000 ? undefined : '描述不能超过 1000 个字符'
  }
  if (field === 'url') return isHttpUrl(form.url.trim()) ? undefined : '请输入有效的 HTTP 或 HTTPS URL'
  if (field === 'thumbnail') {
    const thumbnail = form.thumbnail?.trim()
    return !thumbnail || isHttpUrl(thumbnail) ? undefined : '请输入有效的 HTTP 或 HTTPS 图片 URL'
  }
  if (field === 'headers') {
    try {
      parseMcpExtensionHeaders(form.headers)
      return undefined
    } catch (error) {
      return error instanceof Error ? error.message : '请求头必须是有效的 JSON 对象'
    }
  }
  return undefined
}

const validatedFormFields = ['name', 'description', 'url', 'thumbnail', 'headers'] as const

export const validateMcpExtensionForm = (form: McpExtensionFormDraft) => {
  const errors: McpExtensionFormErrors = {}
  validatedFormFields.forEach((field) => {
    const error = validateMcpExtensionField(field, form)
    if (error) errors[field] = error
  })
  return errors
}

export const validateMcpExtensionCode = (code: string): string | undefined => {
  try {
    parseMcpExtensionCode(code)
    return undefined
  } catch (error) {
    return error instanceof Error ? error.message : '请输入有效的 MCP JSON 配置'
  }
}
