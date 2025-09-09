// 添加方式类型
export type AddType = 'form' | 'code'

// 表单数据类型
export interface McpAddFormData {
  name: string
  description: string
  type: 'sse' | 'streamableHttp'
  url: string
  headers: string
  thumbnail?: File | null
}

// 组件 Props
export interface McpAddFormProps {
  // 当前添加方式
  addType?: AddType
  // 表单数据
  formData?: McpAddFormData
  // 代码数据
  codeData?: string
}

// 组件 Emits
export interface McpAddFormEmits {
  (e: 'update:addType', value: AddType): void
  (e: 'confirm', type: AddType, data: McpAddFormData | string): void
  (e: 'cancel'): void
}
