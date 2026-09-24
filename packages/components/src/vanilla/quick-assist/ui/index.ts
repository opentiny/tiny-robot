import type {
  QuickAssistAttributeMap,
  QuickAssistActivation,
  QuickAssistAttrs,
  QuickAssistMessages,
  QuickAssistTriggerOptions,
  Suggestion,
} from '../types'
import type { QuickAssistSession } from '../core/types'

export interface QuickAssistUIOptions {
  root: Document
  attrs?: QuickAssistAttrs
  messages?: QuickAssistMessages
  triggerLabel?: string
}

export interface QuickAssistUIController {
  showTrigger(input: { activation: QuickAssistActivation; onClick(): void }): HTMLElement
  showPopover(input: {
    session: QuickAssistSession
    onSubmit(query: string): void
    onSuggestionClick(suggestion: Suggestion): void
    onClose(): void
  }): HTMLElement
  update(input: { suggestions?: Suggestion[]; loading?: boolean; error?: boolean; submittingDisabled?: boolean }): void
  contains(node: Node | null): boolean
  close(): void
  destroy(): void
}

interface UIState {
  suggestions: Suggestion[]
  loading: boolean
  error: boolean
  submittingDisabled: boolean
}

const DEFAULT_MESSAGES: Required<QuickAssistMessages> = {
  inputLabel: '请输入问题',
  submitLabel: '发送问题',
  loading: '正在加载推荐…',
  empty: '暂无推荐',
  error: '推荐加载失败',
  defaultExplain: '解释 {text}',
  defaultUseCase: '{text}适用场景',
}

function setSafeAttributes(element: HTMLElement, attributes: QuickAssistAttributeMap | undefined): void {
  if (!attributes) return
  for (const [name, rawValue] of Object.entries(attributes)) {
    const normalized = name.toLowerCase()
    if (
      !/^[a-zA-Z_:][a-zA-Z0-9:._-]*$/.test(name) ||
      normalized.startsWith('on') ||
      normalized === 'innerhtml' ||
      normalized === 'outerhtml' ||
      normalized === 'textcontent' ||
      normalized === 'style' ||
      normalized === 'value' ||
      normalized === 'disabled' ||
      normalized === 'readonly' ||
      normalized === 'required' ||
      normalized === 'type' ||
      normalized === 'id'
    ) {
      continue
    }
    if (normalized === 'class' || normalized === 'classname') {
      if (typeof rawValue === 'string') {
        for (const token of rawValue.split(/\s+/)) {
          if (/^[a-zA-Z0-9_-]+$/.test(token)) element.classList.add(token)
        }
      }
      continue
    }
    if (rawValue === null || rawValue === undefined || (rawValue === false && !normalized.startsWith('aria-'))) {
      element.removeAttribute(name)
    } else if (rawValue === true) {
      // Boolean attributes are only meaningful as presence attributes. ARIA
      // values are strings, so preserve their semantic value instead.
      element.setAttribute(name, normalized.startsWith('aria-') ? 'true' : '')
    } else if (rawValue === false && normalized.startsWith('aria-')) {
      element.setAttribute(name, 'false')
    } else {
      element.setAttribute(name, String(rawValue))
    }
  }
}

function makeSparkle(document: Document): HTMLSpanElement {
  const icon = document.createElement('span')
  icon.className = 'tr-quick-assist__sparkle'
  icon.setAttribute('aria-hidden', 'true')
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 16 16')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('focusable', 'false')
  const main = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  main.setAttribute('d', 'M8 1.5l1.2 4.3L13.5 7 9.2 8.2 8 12.5 6.8 8.2 2.5 7l4.3-1.2L8 1.5z')
  const small = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  small.setAttribute('d', 'M13 10l.5 1.5L15 12l-1.5.5L13 14l-.5-1.5L11 12l1.5-.5L13 10z')
  svg.append(main, small)
  icon.append(svg)
  return icon
}

function makeArrow(document: Document): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 16 16')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('focusable', 'false')
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', 'M8 13V3m0 0L4.5 6.5M8 3l3.5 3.5')
  path.setAttribute('fill', 'none')
  path.setAttribute('stroke', 'currentColor')
  path.setAttribute('stroke-linecap', 'round')
  path.setAttribute('stroke-linejoin', 'round')
  path.setAttribute('stroke-width', '1.5')
  svg.append(path)
  return svg
}

function getDocumentBody(root: Document): HTMLElement {
  return root.body ?? root.documentElement
}

/** Create the DOM-only QuickAssist view. No DOM is touched until this runs. */
export function createQuickAssistUI(options: QuickAssistUIOptions): QuickAssistUIController {
  const { root } = options
  const attrs = options.attrs ?? {}
  const messages = { ...DEFAULT_MESSAGES, ...(options.messages ?? {}) }
  const triggerLabel = options.triggerLabel ?? '智能帮助'
  let host: HTMLDivElement | null = null
  let visible: HTMLElement | null = null
  let input: HTMLTextAreaElement | null = null
  let submit: HTMLButtonElement | null = null
  let suggestionList: HTMLDivElement | null = null
  let status: HTMLDivElement | null = null
  let activeSession: QuickAssistSession | null = null
  let restoreElement: HTMLElement | null = null
  let state: UIState = { suggestions: [], loading: false, error: false, submittingDisabled: false }
  let destroyed = false

  const ensureHost = (): HTMLDivElement => {
    if (host) return host
    host = root.createElement('div')
    host.className = 'tr-quick-assist'
    host.setAttribute('data-tr-quick-assist', '')
    setSafeAttributes(host, attrs.root)
    getDocumentBody(root).append(host)
    return host
  }

  const removeVisible = (restoreFocus: boolean): void => {
    if (!host) return
    const hadFocus = !!root.activeElement && host.contains(root.activeElement)
    if (visible) visible.remove()
    visible = null
    input = null
    submit = null
    suggestionList = null
    status = null
    activeSession = null
    if (restoreFocus && hadFocus && restoreElement?.isConnected) restoreElement.focus()
    restoreElement = null
    host.remove()
    host = null
  }

  const renderSuggestions = (): void => {
    if (!suggestionList || !status) return
    suggestionList.replaceChildren()
    status.replaceChildren()
    status.hidden = true
    status.dataset.state = ''

    if (state.loading) {
      status.hidden = false
      status.dataset.state = 'loading'
      status.textContent = messages.loading
    } else if (state.error && !state.suggestions.length) {
      status.hidden = false
      status.dataset.state = 'error'
      status.textContent = messages.error
    } else if (!state.suggestions.length) {
      status.hidden = false
      status.dataset.state = 'empty'
      status.textContent = messages.empty
    }

    for (const suggestion of state.suggestions) {
      const button = root.createElement('button')
      button.type = 'button'
      button.className = 'tr-quick-assist__suggestion'
      button.disabled = state.submittingDisabled
      button.textContent = suggestion.label
      const customAttrs = attrs.suggestion
      setSafeAttributes(button, typeof customAttrs === 'function' ? customAttrs(suggestion) : customAttrs)
      button.addEventListener('click', () => {
        if (activeSession) activeSession.inputValue = input?.value ?? activeSession.inputValue
        onSuggestionClick?.(suggestion)
      })
      suggestionList.append(button)
    }
  }

  let onSuggestionClick: ((suggestion: Suggestion) => void) | undefined

  const controller: QuickAssistUIController = {
    showTrigger({ activation, onClick }: { activation: QuickAssistActivation; onClick(): void }): HTMLElement {
      if (destroyed) return root.createElement('div')
      removeVisible(false)
      const container = ensureHost()
      const button = root.createElement('button')
      button.type = 'button'
      button.className = 'tr-quick-assist__trigger'
      button.setAttribute('aria-label', triggerLabel)
      button.dataset.source = activation.source
      button.append(makeSparkle(root), root.createTextNode(triggerLabel))
      setSafeAttributes(button, attrs.trigger)
      // Keep the browser selection intact until click opens the composer.
      // Focusing this button on pointerdown can collapse Selection first.
      button.addEventListener('pointerdown', (event) => event.preventDefault())
      button.addEventListener('click', (event) => {
        event.preventDefault()
        onClick()
      })
      container.append(button)
      visible = button
      return button
    },

    showPopover({
      session,
      onSubmit,
      onSuggestionClick: suggestionClick,
      onClose,
    }: {
      session: QuickAssistSession
      onSubmit(query: string): void
      onSuggestionClick(suggestion: Suggestion): void
      onClose(): void
    }): HTMLElement {
      if (destroyed) return root.createElement('div')
      removeVisible(false)
      const container = ensureHost()
      activeSession = session
      onSuggestionClick = suggestionClick
      restoreElement =
        session.originalActiveElement?.nodeType === 1 ? (session.originalActiveElement as HTMLElement) : null
      state = {
        suggestions: session.suggestions.slice(),
        loading: false,
        error: false,
        submittingDisabled: false,
      }

      const popover = root.createElement('div')
      popover.className = 'tr-quick-assist__popover'
      popover.setAttribute('role', 'dialog')
      popover.setAttribute('aria-modal', 'false')
      popover.setAttribute('aria-label', messages.inputLabel)
      setSafeAttributes(popover, attrs.popover)

      const form = root.createElement('form')
      form.className = 'tr-quick-assist__composer'
      form.noValidate = true
      const icon = makeSparkle(root)
      const inputId = `tr-quick-assist-input-${session.id}`
      const label = root.createElement('label')
      label.className = 'tr-quick-assist__label'
      label.htmlFor = inputId
      label.textContent = messages.inputLabel
      input = root.createElement('textarea')
      input.className = 'tr-quick-assist__input'
      input.id = inputId
      input.rows = 1
      input.value = session.inputValue || session.activation.text || session.activation.selection?.text || ''
      input.setAttribute('aria-label', messages.inputLabel)
      input.setAttribute('autocomplete', 'off')
      input.setAttribute('spellcheck', 'true')
      setSafeAttributes(input, attrs.input)

      submit = root.createElement('button')
      submit.type = 'submit'
      submit.className = 'tr-quick-assist__submit'
      submit.setAttribute('aria-label', messages.submitLabel)
      submit.title = messages.submitLabel
      submit.append(makeArrow(root))
      setSafeAttributes(submit, attrs.submit)

      let composing = false
      const syncSubmit = () => {
        if (submit) submit.disabled = state.submittingDisabled || input?.value.trim().length === 0
      }
      input.addEventListener('input', () => {
        session.inputValue = input?.value ?? ''
        syncSubmit()
      })
      input.addEventListener('compositionstart', () => {
        composing = true
      })
      input.addEventListener('compositionend', () => {
        composing = false
        session.inputValue = input?.value ?? ''
        syncSubmit()
      })
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          onClose()
        } else if (event.key === 'Enter' && !event.shiftKey && !composing) {
          event.preventDefault()
          if (!state.submittingDisabled && input?.value.trim()) onSubmit(input.value)
        }
      })
      form.addEventListener('submit', (event) => {
        event.preventDefault()
        if (state.submittingDisabled || !input?.value.trim()) return
        onSubmit(input.value)
      })
      form.append(icon, label, input, submit)
      popover.append(form)

      suggestionList = root.createElement('div')
      suggestionList.className = 'tr-quick-assist__suggestions'
      suggestionList.setAttribute('role', 'group')
      suggestionList.setAttribute('aria-label', '推荐问题')
      status = root.createElement('div')
      status.className = 'tr-quick-assist__status'
      status.setAttribute('role', 'status')
      status.setAttribute('aria-live', 'polite')
      popover.append(suggestionList, status)
      container.append(popover)
      visible = popover
      renderSuggestions()
      syncSubmit()
      input.focus()
      return popover
    },

    update(update: {
      suggestions?: Suggestion[]
      loading?: boolean
      error?: boolean
      submittingDisabled?: boolean
    }): void {
      if (destroyed || !visible || visible.classList.contains('tr-quick-assist__trigger')) return
      if (update.suggestions) state.suggestions = update.suggestions.slice()
      if (update.loading !== undefined) state.loading = update.loading
      if (update.error !== undefined) state.error = update.error
      if (update.submittingDisabled !== undefined) state.submittingDisabled = update.submittingDisabled
      renderSuggestions()
      if (submit) submit.disabled = state.submittingDisabled || input?.value.trim().length === 0
    },

    contains(node: Node | null): boolean {
      return !!node && !!host?.contains(node)
    },

    close(): void {
      removeVisible(true)
      onSuggestionClick = undefined
    },

    destroy(): void {
      if (destroyed) return
      destroyed = true
      removeVisible(false)
      host = null
      onSuggestionClick = undefined
    },
  }

  return controller
}

/** Contract-named factory used by the runtime; the longer name remains a
 * readable alias for consumers that instantiate the view directly. */
export function createUIController(options: {
  root: Document
  trigger: QuickAssistTriggerOptions
  attrs?: QuickAssistAttrs
  messages?: QuickAssistMessages
}): QuickAssistUIController {
  return createQuickAssistUI({
    root: options.root,
    attrs: options.attrs,
    messages: options.messages,
    triggerLabel: options.trigger.label,
  })
}
