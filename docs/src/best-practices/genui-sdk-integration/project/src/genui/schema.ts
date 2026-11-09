import { repairJson } from '@opentiny/genui-sdk-core'

export interface MessagePart {
  type: string
  text: string
  closed?: boolean
}

export interface SchemaNode {
  componentName: string
  props?: Record<string, string | number | boolean>
  children?: (SchemaNode | string)[] | string
}

export const components = [
  'Page',
  'div',
  'h3',
  'p',
  'form',
  'label',
  'input',
  'select',
  'option',
  'button',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'span',
]
const allowedProps = new Set([
  'type',
  'name',
  'value',
  'placeholder',
  'required',
  'disabled',
  'maxLength',
  'title',
  'data-action',
])

// 保留普通 Markdown 围栏，只拆分独立的 schemaJson 块，便于同一消息重放与多卡片渲染。
export function splitContent(source: string): MessagePart[] {
  const parts: MessagePart[] = []
  let buffer = ''
  let fence: { char: string; size: number; schema: boolean } | undefined
  for (const line of source.match(/[^\n]*\n|[^\n]+$/g) ?? []) {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})([^\r\n]*)\r?\n?$/)
    if (!fence && marker) {
      const schema = marker[2]!.trim().toLowerCase() === 'schemajson'
      if (schema) {
        if (buffer) parts.push({ type: 'text', text: buffer })
        buffer = ''
      }
      fence = { char: marker[1]![0]!, size: marker[1]!.length, schema }
      if (!schema) buffer += line
    } else if (
      fence &&
      marker &&
      marker[1]![0] === fence.char &&
      marker[1]!.length >= fence.size &&
      !marker[2]!.trim()
    ) {
      if (fence.schema) {
        parts.push({ type: 'schema-json', text: buffer, closed: true })
        buffer = ''
      } else buffer += line
      fence = undefined
    } else buffer += line
  }
  if (fence?.schema) parts.push({ type: 'schema-json', text: buffer, closed: false })
  else if (buffer) parts.push({ type: 'text', text: buffer })
  return parts
}

// 当前独立渲染器支持执行表达式；示例只接受静态白名单节点，事件由宿主处理。
export function parseSchema(source: string, complete: boolean): SchemaNode {
  if (source.length > 80_000) throw new Error('Schema 超出示例大小限制')
  const value: unknown = complete ? JSON.parse(source) : repairJson(source).value
  let count = 0
  function node(value: unknown, depth = 0): SchemaNode | string {
    if (++count > 200 || depth > 16) throw new Error('Schema 层级或节点过多')
    if (typeof value === 'string') return value
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('节点格式无效')
    const item = value as Record<string, unknown>
    if (Object.keys(item).some((key) => !['componentName', 'props', 'children'].includes(key))) {
      throw new Error('仅支持静态 Schema，不能包含方法、表达式或样式')
    }
    if (typeof item.componentName !== 'string' || !components.includes(item.componentName)) {
      throw new Error('包含未支持的组件')
    }
    const result: SchemaNode = { componentName: item.componentName }
    if (item.props !== undefined) {
      if (!item.props || typeof item.props !== 'object' || Array.isArray(item.props)) throw new Error('属性格式无效')
      result.props = {}
      for (const [key, val] of Object.entries(item.props)) {
        if (!allowedProps.has(key) || !['string', 'number', 'boolean'].includes(typeof val))
          throw new Error(`不支持属性：${key}`)
        if (key === 'type' && !['text', 'number', 'date', 'submit', 'button'].includes(String(val)))
          throw new Error('不支持此输入类型')
        result.props[key] = val as string | number | boolean
      }
    }
    if (Array.isArray(item.children)) result.children = item.children.map((child) => node(child, depth + 1))
    else if (item.children !== undefined) {
      if (typeof item.children !== 'string') throw new Error('children 必须为文本或数组')
      result.children = item.children
    }
    return result
  }
  const schema = node(value)
  if (typeof schema === 'string' || schema.componentName !== 'Page') throw new Error('根节点必须为 Page')
  return schema
}
