const defaultStorageOwners = new Set<symbol>()

export function acquireDefaultStorageOwner(): () => void {
  if (defaultStorageOwners.size > 0) {
    console.warn(
      '[tiny-robot-chat/experimental] The default storage key is shared by multiple owned runtimes; use a distinct storageKey to avoid competing in-memory views.',
    )
  }

  const owner = Symbol('tr-chat-owned-runtime')
  defaultStorageOwners.add(owner)
  let released = false

  return () => {
    if (released) return
    released = true
    defaultStorageOwners.delete(owner)
  }
}
