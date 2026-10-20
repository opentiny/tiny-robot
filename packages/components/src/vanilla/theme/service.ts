import type { VanillaColorMode, VanillaResolvedColorMode, VanillaThemeConfig } from './types'

type Source = {
  selector: string
  attribute: string
  light: string | undefined
  dark: string
  defaultMode: VanillaResolvedColorMode
  type: 'attribute' | 'class'
}
type Config = { colorMode: VanillaColorMode } | { source: Source }
type State = {
  config: Config
  elements: Set<HTMLElement>
  refresh?: () => void
  stop?: () => void
}
const states = new WeakMap<Document, State>()

function getDocument(root?: Document): Document {
  const result = root ?? (typeof document === 'undefined' ? undefined : document)
  if (!result) throw new Error('Vanilla theme requires a Document root')
  return result
}

function string(value: unknown, fallback?: string): string {
  const result = value === undefined ? fallback : value
  if (typeof result !== 'string' || !result.trim()) throw new Error('Vanilla theme expects non-empty strings')
  return result
}

function normalize(input: VanillaThemeConfig, root: Document): Config {
  if (!input || typeof input !== 'object') throw new Error('Invalid Vanilla theme configuration')
  if (input.colorMode !== undefined) {
    if (input.source !== undefined || !['light', 'dark', 'auto'].includes(input.colorMode)) {
      throw new Error('Specify either a valid colorMode or a theme source')
    }
    return { colorMode: input.colorMode }
  }
  const source = input.source === undefined ? { type: 'attribute' as const } : input.source
  if (!source || !['attribute', 'class'].includes(source.type)) throw new Error('Invalid Vanilla theme source')
  const selector = string(source.selector, 'html')
  if (!root.querySelector(selector)) throw new Error(`Vanilla theme source not found: ${selector}`)
  const defaultMode = source.defaultMode === undefined ? 'light' : source.defaultMode
  if (defaultMode !== 'light' && defaultMode !== 'dark') throw new Error('Invalid theme defaultMode')
  if (source.type === 'attribute') {
    if (source.values !== undefined && (!source.values || typeof source.values !== 'object')) {
      throw new Error('Invalid theme values')
    }
    let attribute = string(source.attribute, 'data-tr-color-mode')
    // Validate with the DOM itself, including XML name constraints.
    const probe = root.createElement('div')
    probe.setAttribute(attribute, '')
    attribute = probe.attributes[0].name
    const light = string(source.values?.light, 'light')
    const dark = string(source.values?.dark, 'dark')
    if (light === dark) throw new Error('Theme light and dark values must differ')
    return { source: { type: source.type, selector, attribute, light, dark, defaultMode } }
  }
  const dark = string(source.darkClass, 'dark')
  const light = source.lightClass === undefined ? undefined : string(source.lightClass)
  if (/\s/.test(dark) || (light !== undefined && (/\s/.test(light) || light === dark))) {
    throw new Error('Theme classes must be distinct single class tokens')
  }
  return { source: { type: source.type, selector, attribute: 'class', light, dark, defaultMode } }
}

function getState(root: Document): State {
  let state = states.get(root)
  if (!state) {
    state = { config: normalize({}, root), elements: new Set() }
    states.set(root, state)
  }
  return state
}

function apply(element: HTMLElement, mode: VanillaResolvedColorMode): void {
  if (!element.hasAttribute('data-tr-vanilla') || element.getAttribute('data-tr-vanilla') !== '') {
    element.setAttribute('data-tr-vanilla', '')
  }
  if (element.getAttribute('data-tr-vanilla-color-mode') !== mode) {
    element.setAttribute('data-tr-vanilla-color-mode', mode)
  }
  if (element.style.colorScheme !== mode) element.style.colorScheme = mode
}

function start(root: Document, state: State): void {
  state.stop?.()
  state.stop = undefined
  state.refresh = undefined
  if (!state.elements.size) return
  const { config } = state
  const view = root.defaultView
  const media =
    'colorMode' in config && config.colorMode === 'auto'
      ? view?.matchMedia?.('(prefers-color-scheme: dark)')
      : undefined
  const publish = (mode: VanillaResolvedColorMode) => {
    for (const element of state.elements) apply(element, mode)
  }
  const refresh = () => {
    if ('colorMode' in config) {
      publish(config.colorMode === 'auto' ? (media?.matches ? 'dark' : 'light') : config.colorMode)
      return
    }
    const { source } = config
    const target = root.querySelector(source.selector)
    let mode = source.defaultMode
    if (source.type === 'attribute') {
      const value = target?.getAttribute(source.attribute)
      if (value === source.dark) mode = 'dark'
      else if (value === source.light) mode = 'light'
    } else if (target) {
      if (target.classList.contains(source.dark)) mode = 'dark'
      else if (source.light && target.classList.contains(source.light)) mode = 'light'
    }
    publish(mode)
  }
  let observer: MutationObserver | undefined
  let treeObserver: MutationObserver | undefined
  if ('source' in config && view) {
    let target: Element | null = null
    observer = new view.MutationObserver(refresh)
    const bind = () => {
      if (target?.isConnected && target.matches(config.source.selector)) return
      target = root.querySelector(config.source.selector)
      observer!.disconnect()
      if (target) observer!.observe(target, { attributes: true, attributeFilter: [config.source.attribute] })
      refresh()
    }
    treeObserver = new view.MutationObserver(bind)
    treeObserver.observe(root.documentElement, { childList: true, subtree: true })
    bind()
  }
  media?.addEventListener('change', refresh)
  refresh()
  state.refresh = refresh
  state.stop = () => {
    observer?.disconnect()
    treeObserver?.disconnect()
    media?.removeEventListener('change', refresh)
  }
}

/** Configure all Vanilla components in a document. Each call merges with built-in defaults. */
export function configureVanillaTheme(config: VanillaThemeConfig, root?: Document): void {
  const document = getDocument(root)
  const normalized = normalize(config, document)
  const state = getState(document)
  state.config = normalized
  start(document, state)
}

/** Internal component contract. Theme changes only update the root, never the component session. */
export function bindVanillaTheme(element: HTMLElement, root: Document): () => void {
  const state = getState(root)
  state.elements.add(element)
  if (state.refresh) state.refresh()
  else start(root, state)
  let released = false
  return () => {
    if (released) return
    released = true
    state.elements.delete(element)
    if (!state.elements.size) {
      state.stop?.()
      state.stop = undefined
      state.refresh = undefined
    }
  }
}
