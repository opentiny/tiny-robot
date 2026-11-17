import { SLOT_UI } from './ordinary-slots.js'
import { LOCAL_REPLY } from './data.js'

export const SCOPED_UI = /** @type {const} */ ({ ...SLOT_UI, prompts: false })
export const SCOPED_MESSAGES = /** @type {const} */ ([
  { id: 'question', role: 'user', content: '如何接入聊天组件？' },
  { id: 'answer', role: 'assistant', content: LOCAL_REPLY },
])
