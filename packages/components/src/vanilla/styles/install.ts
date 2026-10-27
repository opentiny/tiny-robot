import cssText from '../style.css?inline'

const styles = new WeakMap<Document, { element: HTMLStyleElement; count: number }>()

/** Shared by every UMD component; CSS remains opt-in for the ESM entry. */
export function installVanillaStyle(root: Document): () => void {
  let record = styles.get(root)
  if (!record) {
    const element = root.createElement('style')
    element.setAttribute('data-tr-vanilla-style', '')
    // Retain the original marker for existing integrations.
    element.setAttribute('data-tr-quick-assist-style', '')
    element.textContent = cssText
    ;(root.head || root.documentElement).appendChild(element)
    record = { element, count: 0 }
    styles.set(root, record)
  }
  const current = record
  current.count += 1
  let released = false
  return () => {
    if (released) return
    released = true
    current.count -= 1
    if (!current.count) {
      current.element.remove()
      styles.delete(root)
    }
  }
}
