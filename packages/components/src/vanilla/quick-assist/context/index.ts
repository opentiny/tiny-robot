import type { QuickAssistContextModule } from '../core/types'
import type {
  GetBusinessContext,
  GetNearbyContext,
  QuickAssistContext,
  QuickAssistNearbyContextOptions,
  SanitizeContext,
  SelectionSnapshot,
} from '../types'

const DEFAULT_BLOCK_TAGS = new Set(['P', 'LI', 'TD', 'TH', 'LABEL', 'SECTION', 'FIELDSET'])
const DEFAULT_MAX_LENGTH = 500
const SKIP_SELECTOR = [
  'script',
  'style',
  'noscript',
  'template',
  'input',
  'textarea',
  'select',
  'option',
  '[contenteditable]',
  '.monaco-editor',
  '.CodeMirror',
  '.cm-editor',
  '[data-ai-selection="false"]',
  '[data-sensitive="true"]',
  '[data-sensitive]',
  '[data-secret]',
  '[data-password]',
  '.tr-quick-assist',
].join(',')

export interface ContextModuleOptions {
  root: Document
  include?: string[]
  exclude?: string[]
  nearbyContext?: QuickAssistNearbyContextOptions
  getNearbyContext?: GetNearbyContext
  getContext?: GetBusinessContext
  sanitizeContext?: SanitizeContext
}

type NearbyExtractionOptions = QuickAssistNearbyContextOptions & {
  include?: string[]
  exclude?: string[]
}

function abortError(): Error {
  try {
    return new DOMException('The QuickAssist operation was aborted.', 'AbortError')
  } catch {
    const error = new Error('The QuickAssist operation was aborted.')
    error.name = 'AbortError'
    return error
  }
}

function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) throw abortError()
}

function normalizeText(value: string): string {
  return value.replace(/\s+/gu, ' ').trim()
}

function appendLimited(current: string, next: string, maxLength: number): string {
  if (!next || current.length >= maxLength) return current
  const separator = current ? ' ' : ''
  const remaining = maxLength - current.length - separator.length
  if (remaining <= 0) return current
  return current + separator + next.slice(0, remaining)
}

function isHidden(element: Element): boolean {
  if (element.hasAttribute('hidden') || element.getAttribute('aria-hidden') === 'true') return true
  const view = element.ownerDocument?.defaultView
  const style = view?.getComputedStyle(element)
  return style?.display === 'none' || style?.visibility === 'hidden'
}

function shouldSkip(element: Element, excludedSelectors: string[] = []): boolean {
  return (
    element.matches(SKIP_SELECTOR) ||
    excludedSelectors.some((selector) => element.matches(selector)) ||
    isHidden(element)
  )
}

function textFromBlock(
  block: Element,
  maxLength: number,
  includeSelectors: string[],
  excludeSelectors: string[],
): string {
  if (shouldSkip(block, excludeSelectors)) return ''
  let result = ''
  const visit = (node: Node) => {
    if (result.length >= maxLength) return
    if (node.nodeType === 3) {
      const ancestors = ancestorsOf(node.parentElement)
      if (
        includeSelectors.length &&
        !ancestors.some((item) => includeSelectors.some((selector) => item.matches(selector)))
      ) {
        return
      }
      if (ancestors.some((item) => excludeSelectors.some((selector) => item.matches(selector)))) return
      result = appendLimited(result, normalizeText(node.nodeValue ?? ''), maxLength)
      return
    }
    if (node.nodeType !== 1 && node.nodeType !== 9) return
    const element = node as Element
    if (node !== block && shouldSkip(element, excludeSelectors)) return
    for (let child = node.firstChild; child; child = child.nextSibling) visit(child)
  }
  visit(block)
  return result
}

function ancestorsOf(element: Element | null): Element[] {
  const result: Element[] = []
  let current = element
  while (current) {
    result.push(current)
    current = current.parentElement
  }
  return result
}

function findBlock(snapshot: SelectionSnapshot, selectors: string[], excludedSelectors: string[]): Element | null {
  const ancestors = ancestorsOf(snapshot.anchorElement)
  for (const element of ancestors) {
    if (
      element.tagName !== 'BODY' &&
      element.tagName !== 'HTML' &&
      (DEFAULT_BLOCK_TAGS.has(element.tagName) || selectors.some((selector) => element.matches(selector)))
    ) {
      if (!shouldSkip(element, excludedSelectors)) return element
    }
  }
  // A limited immediate parent is a useful fallback for plain text wrappers.
  const parent = snapshot.anchorElement?.parentElement
  if (parent && parent.tagName !== 'BODY' && parent.tagName !== 'HTML' && !shouldSkip(parent, excludedSelectors)) {
    return parent
  }
  return null
}

/** Extract bounded nearby text with a local tree walk, never document.body.innerText. */
export function extractNearbyText(
  snapshot: SelectionSnapshot,
  options: NearbyExtractionOptions = {},
): string | undefined {
  const maxLength = options.maxLength ?? DEFAULT_MAX_LENGTH
  if (!Number.isInteger(maxLength) || maxLength <= 0) return undefined
  const block = findBlock(snapshot, options.blockSelectors ?? [], options.exclude ?? [])
  const text = block ? textFromBlock(block, maxLength, options.include ?? [], options.exclude ?? []) : ''
  if (text) return text
  return snapshot.text.trim().slice(0, maxLength) || undefined
}

function pageUrl(root: Document): string | undefined {
  const href = root.defaultView?.location?.href
  if (!href) return undefined
  try {
    const url = new URL(href)
    const path = url.pathname || '/'
    // Explicitly omit query and hash. A host may opt in to extra page data via
    // businessContext, but the default context must not collect them.
    if (url.origin === 'null') return path
    return `${url.origin}${path}`
  } catch {
    return undefined
  }
}

function createBaseContext(root: Document, snapshot: SelectionSnapshot, nearbyText?: string): QuickAssistContext {
  const page: QuickAssistContext['page'] = {}
  if (root.title) page.title = root.title
  const url = pageUrl(root)
  if (url) page.url = url
  const context: QuickAssistContext = {
    source: 'selection',
    text: snapshot.text,
    selection: { text: snapshot.text },
  }
  if (page.title || page.url) context.page = page
  if (nearbyText) context.nearbyText = nearbyText
  return context
}

function validateSelectors(root: Document, selectors: string[]): void {
  for (const selector of selectors) {
    try {
      root.querySelector(selector)
    } catch (error) {
      throw new Error(`Invalid QuickAssist context selector "${selector}": ${String(error)}`)
    }
  }
}

/** Build the context pipeline: base → nearby → business → sanitize. */
export function createContextModule(options: ContextModuleOptions): QuickAssistContextModule {
  const nearby = options.nearbyContext ?? {}
  validateSelectors(options.root, [
    ...(nearby.blockSelectors ?? []),
    ...(options.include ?? []),
    ...(options.exclude ?? []),
  ])
  return {
    async build(snapshot, signal) {
      throwIfAborted(signal)
      const nearbyText = options.getNearbyContext
        ? (() => {
            const value = options.getNearbyContext?.(snapshot)
            const limit = nearby.maxLength ?? DEFAULT_MAX_LENGTH
            return value?.trim().slice(0, limit)
          })()
        : extractNearbyText(snapshot, {
            ...nearby,
            include: options.include,
            exclude: options.exclude,
          })
      let context = createBaseContext(options.root, snapshot, nearbyText?.trim() || undefined)
      throwIfAborted(signal)
      if (options.getContext) {
        const businessContext = await options.getContext(context, signal)
        throwIfAborted(signal)
        if (businessContext && typeof businessContext === 'object') {
          context = { ...context, businessContext: { ...businessContext } }
        }
      }
      if (options.sanitizeContext) {
        const sanitized = await options.sanitizeContext(context, signal)
        throwIfAborted(signal)
        if (!sanitized || typeof sanitized !== 'object') {
          throw new Error('sanitizeContext must return a QuickAssistContext object')
        }
        context = sanitized
      }
      return context
    },
  }
}

/** Contract name used by the runtime. */
export function createContextBuilder(options: {
  root: Document
  include: string[]
  exclude: string[]
  nearbyContext?: { maxLength: number; blockSelectors: string[] }
  getNearbyContext?: GetNearbyContext
  getContext?: GetBusinessContext
  sanitizeContext?: SanitizeContext
}): QuickAssistContextModule {
  return createContextModule(options)
}

export { DEFAULT_BLOCK_TAGS, DEFAULT_MAX_LENGTH }
