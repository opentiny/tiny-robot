import type { QuickAssistActivation, QuickAssistSelectionModule } from '../core/types'
import type { QuickAssistSelectionOptions, SelectionSnapshot } from '../types'

/**
 * Options used by the selection collector.  This is deliberately kept
 * independent from the runtime so selection can also be tested in isolation.
 */
export interface SelectionModuleOptions {
  root: Document
  include?: string[]
  exclude?: string[]
  selection?: QuickAssistSelectionOptions
  onError?: (error: Error) => void
}

export interface SelectionController extends QuickAssistSelectionModule {
  /** Forget the last range after a runtime session closes, allowing a deliberate re-selection. */
  reset: () => void
  /** Fires when a previously valid trigger selection becomes empty or invalid. */
  onInvalid: (listener: () => void) => () => void
  /** Alias used by the runtime to clear an uncommitted trigger. */
  onClear: (listener: () => void) => () => void
}

export interface SelectionValidationOptions {
  root: Document
  include: string[]
  exclude: string[]
  maxTextLength: number
  validate?: (snapshot: SelectionSnapshot) => boolean
  selection?: QuickAssistSelectionOptions
  onError?: (error: Error) => void
}

const DEFAULT_EXCLUDE = [
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
]

const URL_RE = /^(?:(?:https?|ftp):\/\/|www\.)\S+$|^(?:[a-z0-9-]+\.)+[a-z]{2,}(?::\d+)?(?:[/?#]\S*)?$/i
const UUID_RE = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i
const NUMERIC_RE = /^[\d\s.,+\-/:]+$/u
const PUNCTUATION_RE = /^[\p{P}\p{S}]+$/u

function asError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value))
}

function elementForNode(node: Node | null): Element | null {
  if (!node) return null
  if (node.nodeType === 1) return node as Element
  return node.parentElement
}

function matchesAny(element: Element, selectors: string[]): boolean {
  return selectors.some((selector) => element.matches(selector))
}

function isContentEditable(element: Element | null): boolean {
  let current = element
  while (current) {
    if (current.hasAttribute('contenteditable')) {
      const value = current.getAttribute('contenteditable')?.trim().toLowerCase()
      if (value === 'false') return false
      return true
    }
    current = current.parentElement
  }
  return false
}

function isExcludedElement(element: Element, selectors: string[]): boolean {
  if (matchesAny(element, selectors)) return true
  if (isContentEditable(element)) return true
  if (element.closest('.monaco-editor, .CodeMirror, .cm-editor')) return true
  if (element.closest('[data-ai-selection="false"], [data-sensitive], [data-secret], [data-password]')) {
    return true
  }
  const type = element.getAttribute('type')?.toLowerCase()
  return element.matches('input, textarea, select, option') || type === 'password'
}

function ancestorElements(node: Node): Element[] {
  const result: Element[] = []
  let current = elementForNode(node)
  while (current) {
    result.push(current)
    current = current.parentElement
  }
  return result
}

function isHidden(element: Element): boolean {
  if (element.hasAttribute('hidden') || element.getAttribute('aria-hidden') === 'true') return true
  const view = element.ownerDocument?.defaultView
  const display = view?.getComputedStyle(element).display
  const visibility = view?.getComputedStyle(element).visibility
  return display === 'none' || visibility === 'hidden'
}

function intersectsTextNodes(range: Range): Text[] {
  const common = range.commonAncestorContainer
  const root = common.nodeType === 3 ? common.parentNode : common
  if (!root) return []
  const result: Text[] = []
  const visit = (node: Node) => {
    let intersects = false
    try {
      intersects = range.intersectsNode(node)
    } catch {
      return
    }
    if (!intersects) return
    if (node.nodeType === 3) {
      result.push(node as Text)
      return
    }
    for (let child = node.firstChild; child; child = child.nextSibling) visit(child)
  }
  visit(root)
  return result
}

function hasValidGeometry(snapshot: SelectionSnapshot): boolean {
  const { rect, clientRects } = snapshot
  return (
    Number.isFinite(rect.left) &&
    Number.isFinite(rect.top) &&
    Number.isFinite(rect.width) &&
    Number.isFinite(rect.height) &&
    clientRects.every((item) => Number.isFinite(item.left) && Number.isFinite(item.top))
  )
}

function isDefaultTextValid(text: string, maxTextLength: number): boolean {
  const trimmed = text.trim()
  if (!trimmed || trimmed.length > maxTextLength) return false
  if (NUMERIC_RE.test(trimmed) || PUNCTUATION_RE.test(trimmed.replace(/\s+/gu, ''))) return false
  if (URL_RE.test(trimmed) || UUID_RE.test(trimmed)) return false
  return true
}

/** Validate selectors eagerly so an invalid business selector is diagnosable. */
export function validateSelectionSelectors(root: Document, selectors: string[]): void {
  for (const selector of selectors) {
    try {
      root.querySelector(selector)
    } catch (error) {
      throw new Error(`Invalid QuickAssist selection selector "${selector}": ${asError(error).message}`)
    }
  }
}

/**
 * Validate a captured range without reading the page as a whole. Every text
 * node actually intersected by the range must be inside the include boundary
 * and outside the exclusion boundary.
 */
export function validateSelectionSnapshot(snapshot: SelectionSnapshot, options: SelectionValidationOptions): boolean {
  const maxTextLength = options.selection?.maxTextLength ?? options.maxTextLength ?? 300
  const include = options.include ?? []
  const exclude = [...DEFAULT_EXCLUDE, ...(options.exclude ?? [])]
  const text = snapshot.text.trim()
  if (!text || text.length > maxTextLength || !hasValidGeometry(snapshot)) return false

  const nodes = intersectsTextNodes(snapshot.range)
  if (!nodes.length) return false
  for (const node of nodes) {
    const ancestors = ancestorElements(node)
    if (!ancestors.length) return false
    if (include.length && !ancestors.some((element) => matchesAny(element, include))) return false
    if (ancestors.some((element) => isExcludedElement(element, exclude) || isHidden(element))) return false
  }

  const anchor = snapshot.anchorElement
  if (anchor?.closest('.tr-quick-assist')) return false
  const customValidate = options.selection?.validate ?? options.validate
  if (customValidate) {
    try {
      return customValidate(snapshot)
    } catch (error) {
      options.onError?.(asError(error))
      return false
    }
  }
  return isDefaultTextValid(text, maxTextLength)
}

function getRootSelection(root: Document): Selection | null {
  const view = root.defaultView
  if (view?.getSelection) return view.getSelection()
  return root.getSelection?.() ?? null
}

function ownerDocumentOf(node: Node): Document | null {
  return node.nodeType === 9 ? (node as Document) : node.ownerDocument
}

export function captureSelectionSnapshot(root: Document): SelectionSnapshot | null {
  const selection = getRootSelection(root)
  if (!selection) return null
  if (!selection.rangeCount || selection.isCollapsed) return null
  const sourceRange = selection.getRangeAt(0)
  if (ownerDocumentOf(sourceRange.startContainer) !== root || ownerDocumentOf(sourceRange.endContainer) !== root)
    return null
  const range = sourceRange.cloneRange()
  const text = selection.toString().trim()
  if (!text) return null
  const rect = range.getBoundingClientRect()
  const clientRects = Array.from(range.getClientRects())
  const anchorElement = elementForNode(selection.anchorNode)
  return {
    text,
    range,
    rect,
    clientRects,
    anchorElement,
    root,
    createdAt: Date.now(),
  }
}

function sameSelection(last: SelectionSnapshot | null, snapshot: SelectionSnapshot): boolean {
  if (!last) return false
  return (
    last.text === snapshot.text &&
    last.range.startContainer === snapshot.range.startContainer &&
    last.range.startOffset === snapshot.range.startOffset &&
    last.range.endContainer === snapshot.range.endContainer &&
    last.range.endOffset === snapshot.range.endOffset
  )
}

/** Create the desktop Document selection listener used by QuickAssist. */
export function createSelectionModule(options: SelectionModuleOptions): SelectionController {
  const root = options.root
  const selectors = [...DEFAULT_EXCLUDE, ...(options.exclude ?? [])]
  validateSelectionSelectors(root, [...(options.include ?? []), ...selectors])
  const listeners = new Set<(activation: QuickAssistActivation) => void>()
  const invalidListeners = new Set<() => void>()
  let enabled = false
  let lastSnapshot: SelectionSnapshot | null = null
  let ignoreTouchUntil = 0

  const clearSnapshot = () => {
    if (!lastSnapshot) return
    lastSnapshot = null
    for (const listener of invalidListeners) {
      try {
        listener()
      } catch (error) {
        options.onError?.(asError(error))
      }
    }
  }

  const inspect = () => {
    if (!enabled) return
    if (Date.now() < ignoreTouchUntil) return
    const snapshot = captureSelectionSnapshot(root)
    if (!snapshot) {
      clearSnapshot()
      return
    }
    if (sameSelection(lastSnapshot, snapshot)) return
    if (
      !validateSelectionSnapshot(snapshot, {
        root,
        include: options.include ?? [],
        exclude: options.exclude ?? [],
        maxTextLength: options.selection?.maxTextLength ?? 300,
        selection: options.selection,
        onError: options.onError,
      })
    ) {
      clearSnapshot()
      return
    }
    lastSnapshot = snapshot
    const activation: QuickAssistActivation = {
      source: 'selection',
      text: snapshot.text,
      rect: snapshot.rect,
      anchorElement: snapshot.anchorElement,
      selection: snapshot,
    }
    for (const listener of listeners) {
      try {
        listener(activation)
      } catch (error) {
        options.onError?.(asError(error))
      }
    }
  }

  const onSelectionChange = () => inspect()
  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === 'touch') ignoreTouchUntil = Number.POSITIVE_INFINITY
  }
  const onPointerUp = (event: PointerEvent) => {
    if (event.pointerType === 'touch') {
      ignoreTouchUntil = Date.now() + 300
      return
    }
    inspect()
  }
  const onKeyUp = (event: KeyboardEvent) => {
    if (event.isComposing) return
    inspect()
  }

  const enable = () => {
    if (enabled) return
    enabled = true
    root.addEventListener('selectionchange', onSelectionChange)
    root.addEventListener('pointerdown', onPointerDown)
    root.addEventListener('pointerup', onPointerUp)
    root.addEventListener('keyup', onKeyUp)
  }
  const disable = () => {
    if (!enabled) return
    enabled = false
    lastSnapshot = null
    root.removeEventListener('selectionchange', onSelectionChange)
    root.removeEventListener('pointerdown', onPointerDown)
    root.removeEventListener('pointerup', onPointerUp)
    root.removeEventListener('keyup', onKeyUp)
  }

  return {
    enable,
    disable,
    destroy: disable,
    reset() {
      lastSnapshot = null
    },
    onActivation(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    onInvalid(listener) {
      invalidListeners.add(listener)
      return () => invalidListeners.delete(listener)
    },
    onClear(listener) {
      invalidListeners.add(listener)
      return () => invalidListeners.delete(listener)
    },
  }
}

/** Contract name used by the runtime; kept separate from the lower-level module name. */
export function createSelectionController(options: {
  root: Document
  include: string[]
  exclude: string[]
  maxTextLength: number
  validate?: (snapshot: SelectionSnapshot) => boolean
  onInvalidSelector?: (error: Error) => void
}): SelectionController {
  try {
    return createSelectionModule({
      root: options.root,
      include: options.include,
      exclude: options.exclude,
      selection: { maxTextLength: options.maxTextLength, validate: options.validate },
      onError: options.onInvalidSelector,
    })
  } catch (error) {
    const normalized = asError(error)
    options.onInvalidSelector?.(normalized)
    throw normalized
  }
}

export { DEFAULT_EXCLUDE }
