import type { QuickAssistContext } from '../types'

function isRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

/** Structured cloning preserves shared storage, so it cannot form an isolated snapshot. */
function rejectSharedMemory(root: object): void {
  const seen = new WeakSet<object>()
  const pending: unknown[] = [root]
  while (pending.length) {
    const value = pending.pop()
    if (!value || typeof value !== 'object' || seen.has(value)) continue
    seen.add(value)
    if (typeof SharedArrayBuffer !== 'undefined' && value instanceof SharedArrayBuffer) {
      throw new Error('QuickAssistContext must not contain SharedArrayBuffer or views of shared memory')
    }
    if (ArrayBuffer.isView(value)) {
      pending.push(value.buffer)
      continue
    }
    if (typeof WebAssembly !== 'undefined' && value instanceof WebAssembly.Memory) {
      pending.push(value.buffer)
    }
    if (value instanceof Map) {
      for (const [key, item] of value) pending.push(key, item)
    } else if (value instanceof Set) {
      for (const item of value) pending.push(item)
    }
    // Includes non-enumerable data such as Error.cause. Cloned objects have no
    // host accessors, and the visited set also handles circular collections.
    for (const key of Object.getOwnPropertyNames(value)) {
      pending.push((value as Record<string, unknown>)[key])
    }
  }
}

/** Validate and detach context data before exposing it to another owner. */
export function copyContext(value: unknown): QuickAssistContext {
  if (!isRecord(value) || typeof value.source !== 'string' || typeof value.text !== 'string') {
    throw new Error('QuickAssistContext must be a record with string source and text fields')
  }
  if (value.selection !== undefined && (!isRecord(value.selection) || typeof value.selection.text !== 'string')) {
    throw new Error('QuickAssistContext.selection must contain string text')
  }
  if (value.page !== undefined) {
    if (
      !isRecord(value.page) ||
      (value.page.title !== undefined && typeof value.page.title !== 'string') ||
      (value.page.url !== undefined && typeof value.page.url !== 'string')
    ) {
      throw new Error('QuickAssistContext.page must contain optional string title and url fields')
    }
  }
  if (value.nearbyText !== undefined && typeof value.nearbyText !== 'string') {
    throw new Error('QuickAssistContext.nearbyText must be a string')
  }
  for (const field of ['businessContext', 'meta'] as const) {
    if (value[field] !== undefined && !isRecord(value[field])) {
      throw new Error(`QuickAssistContext.${field} must be a record`)
    }
  }
  const context = structuredClone(value) as unknown as QuickAssistContext
  // Inspect the clone so cross-realm buffers and collections use local prototypes.
  rejectSharedMemory(context)
  return context
}
