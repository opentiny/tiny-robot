// 基础项接口
interface BaseItem {
  id: string
  readonly?: boolean
}

// 文本项
export interface TextItem extends BaseItem {
  type: 'text'
  content: string
}

// 模板项
export interface TemplateItem extends BaseItem {
  type: 'template'
  content: string
  prefix: string
  suffix: string
}

// 技能项
export interface SkillItem extends BaseItem {
  type: 'skill'
  label: string // 显示文本，如 "内容总结专家"
  value: string // 实际值/提示词
  prefix: string // 前置零宽字符
  suffix: string // 后置零宽字符
}

// 前缀/后缀项（用于扁平化数据）
export interface PrefixItem extends BaseItem {
  type: 'prefix'
  content: string
}

export interface SuffixItem extends BaseItem {
  type: 'suffix'
  content: string
}

// 扩展文本项联合类型
export type ExtendedTextItem = TextItem | TemplateItem | SkillItem | PrefixItem | SuffixItem

// 结构化数据项 - 使用判别联合类型
export type StructuredDataItem =
  | {
      id: string
      type: 'text'
      content: string
      readonly?: boolean
    }
  | {
      id: string
      type: 'template'
      content: string
      prefix: string
      suffix: string
      readonly?: boolean
    }
  | {
      id: string
      type: 'skill'
      label: string
      value: string
      prefix: string
      suffix: string
      readonly?: boolean
    }
  | {
      id: string
      type: 'prefix' | 'suffix'
      content: string
      readonly?: boolean
    }
  | {
      id: string
      type: 'block'
      content: StructuredDataItem[]
      asChild?: boolean
      readonly?: boolean
    }

export interface EditorRange extends StaticRange {
  readonly endEl?: HTMLElement | null
  readonly endId?: string
  readonly endType?: string
  readonly startEl?: HTMLElement | null
  readonly startId?: string
  readonly startType?: string
}

export interface SelectedItem {
  id: string
  type: ExtendedTextItem['type']
  startOffset: number
  endOffset: number
}

export interface CreateItem {
  tag: 'new'
  afterId?: string
  type: 'text'
  content: string
}

export interface DataItem {
  id: string
  type: 'block' | 'text' | 'template' | 'prefix' | 'suffix'
  content: string | DataItem[]
  readonly?: boolean
  asChild?: boolean
}
