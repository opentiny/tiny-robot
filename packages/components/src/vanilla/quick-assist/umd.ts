import { createQuickAssist as create } from './index'
import type { QuickAssistInstance, QuickAssistOptions } from './types'
import cssText from './style.css?inline'

type StyleRecord = { element: HTMLStyleElement; count: number }

const styles = new WeakMap<Document, StyleRecord>()

function installStyle(root: Document): () => void {
  const current = styles.get(root)
  if (current) {
    current.count += 1
    return () => releaseStyle(root)
  }

  const element = root.createElement('style')
  element.setAttribute('data-tr-quick-assist-style', '')
  element.textContent = cssText
  ;(root.head || root.documentElement).appendChild(element)
  styles.set(root, { element, count: 1 })
  return () => releaseStyle(root)
}

function releaseStyle(root: Document): void {
  const current = styles.get(root)
  if (!current) return
  current.count -= 1
  if (current.count > 0) return
  current.element.remove()
  styles.delete(root)
}

/** UMD entry with reference-counted, document-local automatic styles. */
export function createQuickAssist(options: QuickAssistOptions): QuickAssistInstance {
  const root = options.root ?? (typeof document === 'undefined' ? undefined : document)
  if (!root) throw new Error('QuickAssist requires a Document root')
  const release = installStyle(root)
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
