import { TypedOptions } from 'typed.js'

export type BubbleRole = 'ai' | 'user'

export type TypedConfig = Pick<TypedOptions, 'typeSpeed' | 'showCursor'> & {
  enable?: boolean
}

export interface Bubble {
  role: BubbleRole
  content: string
  loading?: boolean
  type?: 'text' | 'markdown'
  typedConfig?: TypedConfig
}
