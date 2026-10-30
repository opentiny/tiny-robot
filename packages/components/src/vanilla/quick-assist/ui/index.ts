import { DEFAULT_INPUT, DEFAULT_MESSAGES } from '../defaults'
import type {
  QuickAssistAttributeMap,
  QuickAssistActivation,
  QuickAssistAttrs,
  QuickAssistMessages,
  QuickAssistInputOptions,
  QuickAssistTriggerOptions,
  Suggestion,
} from '../types'
import type { QuickAssistSession } from '../core/types'
import { bindVanillaTheme } from '../../theme/service'

export interface QuickAssistUIOptions {
  root: Document
  input?: QuickAssistInputOptions
  attrs?: QuickAssistAttrs
  messages?: QuickAssistMessages
  triggerLabel?: string
  onCallbackError?: (sessionId: number, error: unknown) => void
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

let sparkleId = 0

function makeSparkle(document: Document): HTMLSpanElement {
  const icon = document.createElement('span')
  icon.className = 'tr-quick-assist__sparkle'
  icon.setAttribute('aria-hidden', 'true')
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 16 16')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('focusable', 'false')
  const gradientId = `tr-quick-assist-sparkle-${++sparkleId}`
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
  const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
  gradient.id = gradientId
  gradient.setAttribute('gradientUnits', 'userSpaceOnUse')
  gradient.setAttribute('x1', '2')
  gradient.setAttribute('y1', '2')
  gradient.setAttribute('x2', '14')
  gradient.setAttribute('y2', '14')
  for (const [offset, color] of [
    ['0%', 'var(--tr-quick-assist-icon-gradient-start)'],
    ['50%', 'var(--tr-quick-assist-icon-gradient-middle)'],
    ['100%', 'var(--tr-quick-assist-icon-gradient-end)'],
  ]) {
    const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
    stop.setAttribute('offset', offset)
    stop.setAttribute('stop-color', color)
    gradient.append(stop)
  }
  defs.append(gradient)
  // Preserve the double-star geometry from the supplied ai.svg.
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute(
    'd',
    'M5.21,4.4c.63-.8,1.1-1.72,1.37-2.72l.04-.17c.03-.12.1-.22.19-.28.03-.02.07-.04.1-.06.26-.1.59,0,.68.33l.07.25h0c.76,2.65,2.88,4.7,5.55,5.37.06.02.12.04.17.07.15.1.22.28.21.44,0,.07-.02.14-.05.2-.06.12-.17.22-.32.26-2.75.69-4.92,2.86-5.61,5.62-.11.44-.67.5-.9.17-.03-.05-.06-.1-.07-.17-.61-2.41-2.34-4.37-4.61-5.29-.32-.13-.66-.24-1-.33-.13-.03-.22-.1-.28-.19-.06-.09-.09-.19-.09-.3,0-.07.02-.15.05-.22.02-.05.06-.1.1-.14.04-.04.09-.07.14-.1.03-.01.06-.02.09-.03,1.69-.42,3.15-1.4,4.2-2.73ZM12.49,12.01c.22-.22.39-.5.48-.81v-.05c.04-.1.1-.18.17-.23.21-.14.54-.07.62.23l.02.07c.18.61.67,1.09,1.29,1.25.2.05.3.22.3.39h0c0,.16-.09.32-.27.38-.01,0-.02,0-.04.01-.64.16-1.15.67-1.31,1.31-.09.35-.54.4-.72.13-.03-.04-.05-.08-.06-.13-.14-.56-.55-1.02-1.08-1.23-.08-.03-.15-.06-.23-.08-.2-.05-.3-.22-.3-.39h0c0-.17.1-.34.3-.39.31-.08.6-.24.82-.46Z',
  )
  path.setAttribute('fill-rule', 'evenodd')
  path.setAttribute('fill', `url(#${gradientId})`)
  svg.append(defs, path)
  icon.append(svg)
  return icon
}

function makeArrow(document: Document): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('focusable', 'false')
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  circle.setAttribute('cx', '12')
  circle.setAttribute('cy', '12')
  circle.setAttribute('r', '11.5')
  circle.setAttribute('fill', 'none')
  circle.setAttribute('stroke', 'currentColor')
  circle.setAttribute('stroke-width', '1')
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', 'M8 13V3m0 0L4.5 6.5M8 3l3.5 3.5')
  path.setAttribute('transform', 'translate(4 4)')
  path.setAttribute('fill', 'none')
  path.setAttribute('stroke', 'currentColor')
  path.setAttribute('stroke-linecap', 'round')
  path.setAttribute('stroke-linejoin', 'round')
  path.setAttribute('stroke-width', '1.5')
  svg.append(circle, path)
  return svg
}

function getDocumentBody(root: Document): HTMLElement {
  return root.body ?? root.documentElement
}

/** Create the DOM-only QuickAssist view. No DOM is touched until this runs. */
export function createQuickAssistUI(options: QuickAssistUIOptions): QuickAssistUIController {
  const { root } = options
  const attrs = options.attrs ?? {}
  const inputOptions = { ...DEFAULT_INPUT, ...(options.input ?? {}) }
  const messages = { ...DEFAULT_MESSAGES, ...(options.messages ?? {}) }
  const triggerLabel = options.triggerLabel ?? '智能帮助'
  let host: HTMLDivElement | null = null
  let releaseTheme: (() => void) | undefined
  let visible: HTMLElement | null = null
  let input: HTMLTextAreaElement | null = null
  let submit: HTMLButtonElement | null = null
  let suggestionList: HTMLDivElement | null = null
  let status: HTMLDivElement | null = null
  let activeSession: QuickAssistSession | null = null
  let restoreElement: HTMLElement | null = null
  let state: UIState = { suggestions: [], loading: false, error: false, submittingDisabled: false }
  let destroyed = false
  let releaseLayout: (() => void) | undefined
  let syncInput: (() => void) | undefined
  let releaseSelectionHighlight: (() => void) | undefined

  const ensureHost = (): HTMLDivElement => {
    if (host) return host
    host = root.createElement('div')
    host.className = 'tr-quick-assist'
    host.setAttribute('data-tr-quick-assist', '')
    setSafeAttributes(host, attrs.root)
    releaseTheme = bindVanillaTheme(host, root)
    getDocumentBody(root).append(host)
    return host
  }

  const removeVisible = (restoreFocus: boolean): void => {
    releaseLayout?.()
    releaseLayout = undefined
    syncInput = undefined
    releaseSelectionHighlight?.()
    releaseSelectionHighlight = undefined
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
    releaseTheme?.()
    releaseTheme = undefined
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
      button.title = suggestion.label
      const customAttrs = attrs.suggestion
      const renderingSession = activeSession
      try {
        setSafeAttributes(button, typeof customAttrs === 'function' ? customAttrs(suggestion) : customAttrs)
      } catch (error) {
        // Reporting must not re-enter rendering or leave submission disabled.
        if (activeSession) options.onCallbackError?.(activeSession.id, error)
      }
      // A host error listener may synchronously close or replace this session.
      if (!suggestionList || activeSession !== renderingSession) return
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
      button.title = triggerLabel
      button.dataset.source = activation.source
      const label = root.createElement('span')
      label.className = 'tr-quick-assist__trigger-label'
      label.textContent = triggerLabel
      button.append(makeSparkle(root), label)
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
      popover.setAttribute('aria-label', triggerLabel)
      setSafeAttributes(popover, attrs.popover)

      const form = root.createElement('form')
      form.className = 'tr-quick-assist__composer'
      form.noValidate = true
      const icon = makeSparkle(root)
      const inputId = `tr-quick-assist-input-${session.id}`
      const label = root.createElement('label')
      label.className = 'tr-quick-assist__label'
      label.htmlFor = inputId
      label.textContent = inputOptions.ariaLabel
      input = root.createElement('textarea')
      input.className = 'tr-quick-assist__input'
      input.id = inputId
      input.rows = 1
      input.value = session.inputValue
      input.placeholder = inputOptions.placeholder
      input.setAttribute('aria-label', inputOptions.ariaLabel)
      input.setAttribute('autocomplete', 'off')
      input.setAttribute('spellcheck', 'true')
      setSafeAttributes(input, attrs.input)

      submit = root.createElement('button')
      submit.type = 'submit'
      submit.className = 'tr-quick-assist__submit'
      submit.setAttribute('aria-label', inputOptions.submitLabel)
      submit.title = inputOptions.submitLabel
      submit.append(makeArrow(root))
      setSafeAttributes(submit, attrs.submit)

      const submitTitle = submit.title
      const counter = root.createElement('span')
      counter.className = 'tr-quick-assist__counter'
      counter.hidden = options.input?.maxLength === undefined
      const count = root.createElement('span')
      counter.append(count, root.createTextNode(` / ${options.input?.maxLength ?? ''}`))
      const submitWrapper = root.createElement('span')
      submitWrapper.className = 'tr-quick-assist__submit-wrapper'
      const tooltip = root.createElement('span')
      tooltip.className = 'tr-quick-assist__limit-tooltip'
      tooltip.id = `tr-quick-assist-limit-${session.id}`
      tooltip.setAttribute('role', 'tooltip')
      tooltip.textContent = inputOptions.maxLengthExceededMessage
      submitWrapper.append(submit, tooltip)
      let composing = false
      const syncSubmit = () => {
        if (!input || !submit) return
        const length = Array.from(input.value).length
        const maxLength = options.input?.maxLength
        const tooLong = maxLength !== undefined && length > maxLength
        count.textContent = String(length)
        count.classList.toggle('tr-quick-assist__count--invalid', tooLong)
        input.setAttribute('aria-invalid', String(tooLong))
        submit.title = tooLong ? '' : submitTitle
        submitWrapper.classList.toggle('tr-quick-assist__submit-wrapper--invalid', tooLong)
        submitWrapper.tabIndex = tooLong ? 0 : -1
        if (tooLong) submitWrapper.setAttribute('aria-describedby', tooltip.id)
        else submitWrapper.removeAttribute('aria-describedby')
        submit.disabled = state.submittingDisabled || !input.value.trim() || tooLong
      }
      input.addEventListener('input', () => {
        session.inputValue = input?.value ?? ''
        syncInput?.()
      })
      input.addEventListener('compositionstart', () => {
        composing = true
      })
      input.addEventListener('compositionend', () => {
        composing = false
        session.inputValue = input?.value ?? ''
        syncInput?.()
      })
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          onClose()
        } else if (event.key === 'Enter' && !event.shiftKey && !composing) {
          event.preventDefault()
          if (submit && !submit.disabled && input) onSubmit(input.value)
        }
      })
      form.addEventListener('submit', (event) => {
        event.preventDefault()
        if (!submit || submit.disabled || !input?.value.trim()) return
        onSubmit(input.value)
      })
      form.append(icon, label, input, counter, submitWrapper)
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
      syncInput = () => {
        if (!input || activeSession !== session) return
        // Measure the compact row first; wrapped text promotes the composer to its two-row layout.
        form.classList.remove('tr-quick-assist__composer--multiline')
        input.style.height = '18px'
        const maxRows = options.input?.maxRows ?? 2
        const multiline = input.scrollHeight > 18
        form.classList.toggle('tr-quick-assist__composer--multiline', multiline)
        const height = multiline ? Math.min(Math.max(input.scrollHeight, Math.min(2, maxRows) * 18), maxRows * 18) : 18
        input.style.height = `${height}px`
        input.style.overflowY = input.scrollHeight > height ? 'auto' : 'hidden'
        syncSubmit()
        session.refreshPosition?.()
      }
      syncInput()
      const viewForLayout = root.defaultView
      let layoutFrame: number | undefined
      const scheduleInputLayout = () => {
        if (!viewForLayout || activeSession !== session || layoutFrame !== undefined) return
        layoutFrame = viewForLayout.requestAnimationFrame(() => {
          layoutFrame = undefined
          if (activeSession === session) syncInput?.()
        })
      }
      const inputTypography = () => {
        if (!input || !viewForLayout) return ''
        const style = viewForLayout.getComputedStyle(input)
        return [
          style.font,
          style.fontFeatureSettings,
          style.fontVariationSettings,
          style.letterSpacing,
          style.wordSpacing,
        ].join('|')
      }
      let previousTypography = inputTypography()
      // Inherited font changes can wrap text without resizing the fixed-height
      // textarea or its parent. Compare typography to ignore our own layout writes.
      const typographyObserver = viewForLayout?.MutationObserver
        ? new viewForLayout.MutationObserver(() => {
            const typography = inputTypography()
            if (typography !== previousTypography) {
              previousTypography = typography
              scheduleInputLayout()
            }
          })
        : undefined
      for (let ancestor: Element | null = input; ancestor; ancestor = ancestor.parentElement) {
        typographyObserver?.observe(ancestor, { attributes: true })
      }
      // The CSS font-family string stays the same when a web font finishes loading.
      const fonts = root.fonts
      fonts?.addEventListener('loadingdone', scheduleInputLayout)
      fonts?.addEventListener('loadingerror', scheduleInputLayout)
      let previousWidth = form.getBoundingClientRect().width
      const resize = viewForLayout?.ResizeObserver
        ? new viewForLayout.ResizeObserver(() => {
            if (activeSession !== session) return
            const width = form.getBoundingClientRect().width
            if (width !== previousWidth) {
              previousWidth = width
              scheduleInputLayout()
            }
            session.refreshPosition?.()
          })
        : undefined
      resize?.observe(popover)
      resize?.observe(form)
      releaseLayout = () => {
        resize?.disconnect()
        typographyObserver?.disconnect()
        fonts?.removeEventListener('loadingdone', scheduleInputLayout)
        fonts?.removeEventListener('loadingerror', scheduleInputLayout)
        if (layoutFrame !== undefined) viewForLayout?.cancelAnimationFrame(layoutFrame)
      }
      const range = session.activation.selection?.range
      const view = root.defaultView
      if (range && view?.Highlight && view.CSS?.highlights) {
        // A separate paint layer survives textarea focus without changing the
        // host text nodes, native selection, or the retained positioning Range.
        const name = 'tr-quick-assist-selection-retained'
        const registry = view.CSS.highlights
        const highlight = registry.get(name) ?? new view.Highlight()
        // Share the stylesheet's fixed name across instances/bundles, but own a
        // distinct Range so closing one composer cannot clear another's paint.
        const retainedRange = range.cloneRange()
        highlight.add(retainedRange)
        registry.set(name, highlight)
        releaseSelectionHighlight = () => {
          highlight.delete(retainedRange)
          if (!highlight.size && registry.get(name) === highlight) registry.delete(name)
        }
      }
      input.focus({ preventScroll: true })
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
      syncInput?.()
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
  input?: QuickAssistInputOptions
  attrs?: QuickAssistAttrs
  messages?: QuickAssistMessages
}): QuickAssistUIController {
  return createQuickAssistUI({
    root: options.root,
    input: options.input,
    attrs: options.attrs,
    messages: options.messages,
    triggerLabel: options.trigger.label,
  })
}
