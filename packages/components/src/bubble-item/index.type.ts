import { TypedOptions } from 'typed.js'
import { Options as MarkdownItOptions } from 'markdown-it'

export type BubbleRole = 'ai' | 'user'

export type TypedConfig = Omit<TypedOptions, 'strings' | 'stringsElement' | 'contentType'> & {
  enable?: boolean
}

export interface BubbleItem {
  role: BubbleRole
  content?: string
  loading?: boolean
  type?: 'text' | 'markdown'
  /**
   * @deprecated
   */
  typedConfig?: TypedConfig
  mdConfig?: MarkdownItOptions
}
