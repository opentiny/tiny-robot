import { createQuickAssist as create } from './index'
import type { QuickAssistInstance, QuickAssistOptions } from './types'
import { installVanillaStyle } from '../styles/install'

/** Browser bundle entry with reference-counted, document-local automatic styles. */
export function createQuickAssist(options: QuickAssistOptions): QuickAssistInstance {
  const root = options.root ?? (typeof document === 'undefined' ? undefined : document)
  if (!root) throw new Error('QuickAssist requires a Document root')
  const release = installVanillaStyle(root)
  let released = false
  let instance: QuickAssistInstance
  try {
    instance = create({ ...options, root })
  } catch (error) {
    release()
    throw error
  }
  const destroy = instance.destroy
  return {
    ...instance,
    destroy: () => {
      if (released) return
      released = true
      try {
        destroy()
      } finally {
        release()
      }
    },
  }
}
