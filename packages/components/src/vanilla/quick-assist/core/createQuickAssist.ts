import { createContextModule } from '../context'
import { observeAnchor, getSnapshotRect, positionElement } from '../positioning'
import { createRecommendationResolver } from '../recommendation'
import { captureSelectionSnapshot, createSelectionController } from '../selection'
import { createQuickAssistUI } from '../ui'
import type {
  QuickAssistActivation,
  QuickAssistContextModule,
  QuickAssistRecommendationModule,
  QuickAssistSelectionModule,
  QuickAssistSession,
  QuickAssistUI,
  ResolvedQuickAssistOptions,
} from './types'
import type {
  AIRequest,
  QuickAssistCloseReason,
  QuickAssistContext,
  QuickAssistEvent,
  QuickAssistErrorStage,
  QuickAssistInstance,
  QuickAssistMessages,
  QuickAssistOptions,
  QuickAssistPlacement,
  SelectionSnapshot,
  Suggestion,
} from '../types'

const DEFAULT_MESSAGES: Required<QuickAssistMessages> = {
  inputLabel: '请输入问题',
  submitLabel: '发送问题',
  loading: '正在加载推荐…',
  empty: '暂无推荐',
  error: '推荐加载失败',
  defaultExplain: '解释 {text}',
  defaultUseCase: '{text}适用场景',
}

function currentDocument(options: QuickAssistOptions): Document {
  const root = options.root ?? (typeof document === 'undefined' ? undefined : document)
  if (!root) throw new Error('QuickAssist requires a Document root')
  if (root.nodeType !== 9) throw new Error('QuickAssist root must be a Document')
  return root
}

function normalizeOptions(input: QuickAssistOptions): ResolvedQuickAssistOptions {
  if (!input || typeof input !== 'object') throw new Error('QuickAssist options must be an object')
  if (!input.adapter || typeof input.adapter.submit !== 'function') {
    throw new Error('QuickAssist requires an adapter with a submit function')
  }
  const maxSuggestions = input.maxSuggestions ?? 3
  if (!Number.isInteger(maxSuggestions) || maxSuggestions <= 0) {
    throw new Error('QuickAssist maxSuggestions must be a positive integer')
  }
  const selectionInput = input.selection ?? {}
  const maxTextLength = selectionInput.maxTextLength ?? 300
  if (!Number.isInteger(maxTextLength) || maxTextLength <= 0) {
    throw new Error('QuickAssist selection.maxTextLength must be a positive integer')
  }
  const triggerInput = input.trigger ?? {}
  const showDelay = triggerInput.showDelay ?? 0
  if (!Number.isInteger(showDelay) || showDelay < 0) {
    throw new Error('QuickAssist trigger.showDelay must be a non-negative integer')
  }
  const offset = triggerInput.offset ?? 8
  if (!Number.isFinite(offset) || offset < 0) {
    throw new Error('QuickAssist trigger.offset must be a non-negative number')
  }
  if (!['top', 'bottom', 'auto'].includes(triggerInput.placement ?? 'auto')) {
    throw new Error('QuickAssist trigger.placement must be top, bottom, or auto')
  }
  const nearbyInput = input.nearbyContext ?? {}
  const nearbyMaxLength = nearbyInput.maxLength ?? 500
  if (!Number.isInteger(nearbyMaxLength) || nearbyMaxLength <= 0) {
    throw new Error('QuickAssist nearbyContext.maxLength must be a positive integer')
  }
  const messages = { ...DEFAULT_MESSAGES, ...(input.messages ?? {}) }
  return {
    ...input,
    root: currentDocument(input),
    enabled: input.enabled ?? true,
    include: [...(input.include ?? [])],
    exclude: [...(input.exclude ?? [])],
    maxSuggestions,
    selection: { maxTextLength, validate: selectionInput.validate },
    trigger: {
      label: triggerInput.label ?? '智能帮助',
      showDelay,
      offset,
      placement: triggerInput.placement ?? 'auto',
    },
    nearbyContext: {
      maxLength: nearbyMaxLength,
      blockSelectors: [...(nearbyInput.blockSelectors ?? [])],
    },
    messages,
  }
}

function asError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value))
}

class QuickAssistStageError extends Error {
  constructor(
    readonly stage: 'context' | 'sanitize',
    cause: unknown,
  ) {
    super(asError(cause).message)
    this.name = 'QuickAssistStageError'
  }
}

function stageOf(error: unknown): QuickAssistErrorStage {
  return error instanceof QuickAssistStageError ? error.stage : 'context'
}

function snapshotOf(activation: QuickAssistActivation): SelectionSnapshot | null {
  return activation.selection ?? null
}

function normalizeActivation(activation: QuickAssistActivation): QuickAssistActivation {
  const snapshot = snapshotOf(activation)
  if (!snapshot) return activation
  return {
    source: activation.source,
    text: activation.text ?? snapshot.text,
    rect: activation.rect ?? snapshot.rect,
    anchorElement: activation.anchorElement ?? snapshot.anchorElement,
    selection: snapshot,
  }
}

function makeRect(root: Document, left: number, top: number, width: number, height: number): DOMRectReadOnly {
  const DOMRectConstructor = root.defaultView?.DOMRect
  if (DOMRectConstructor) return new DOMRectConstructor(left, top, width, height)
  const right = left + width
  const bottom = top + height
  return {
    x: left,
    y: top,
    left,
    top,
    right,
    bottom,
    width,
    height,
    toJSON: () => ({ left, top, right, bottom, width, height }),
  } as DOMRectReadOnly
}

/** Calculate where the (currently hidden) Trigger would sit for a moved Range. */
function getVirtualTriggerRect(
  root: Document,
  anchor: DOMRectReadOnly,
  size: { width: number; height: number },
  placement: QuickAssistPlacement,
  offset: number,
): DOMRectReadOnly {
  const view = root.defaultView
  const viewportWidth = view?.innerWidth ?? root.documentElement.clientWidth
  const viewportHeight = view?.innerHeight ?? root.documentElement.clientHeight
  const margin = 8
  const requested = placement === 'auto' ? 'bottom' : placement
  const roomBelow = viewportHeight - anchor.bottom - offset - margin
  const roomAbove = anchor.top - offset - margin
  const shouldFlip =
    requested === 'bottom'
      ? roomBelow < size.height && roomAbove > roomBelow
      : roomAbove < size.height && roomBelow > roomAbove
  const side = shouldFlip ? (requested === 'bottom' ? 'top' : 'bottom') : requested
  const rawLeft = anchor.left + anchor.width / 2 - size.width / 2
  const left = Math.max(margin, Math.min(rawLeft, viewportWidth - size.width - margin))
  const rawTop = side === 'top' ? anchor.top - size.height - offset : anchor.bottom + offset
  const top = Math.max(margin, Math.min(rawTop, viewportHeight - size.height - margin))
  return makeRect(root, left, top, size.width, size.height)
}

/** Framework-free QuickAssist orchestration and lifecycle. */
export function createQuickAssist(input: QuickAssistOptions): QuickAssistInstance {
  let resolved: ResolvedQuickAssistOptions
  try {
    resolved = normalizeOptions(input)
  } catch (error) {
    try {
      input?.onEvent?.({ type: 'error', sessionId: 0, stage: 'config', error: asError(error) })
    } catch {
      // Config reporting must not replace the actionable initialization error.
    }
    throw error
  }
  let destroyed = false
  let enabled = false
  let nextSessionId = 0
  let session: QuickAssistSession | null = null
  let triggerElement: HTMLElement | null = null
  let triggerTimer: ReturnType<typeof setTimeout> | undefined
  let pointerDown = false
  let anchorCleanup: (() => void) | undefined
  let unsubscribeSelection: (() => void) | undefined
  let unsubscribeSelectionClear: (() => void) | undefined
  let optionsVersion = 0
  let selectionModule: QuickAssistSelectionModule
  let contextModule: QuickAssistContextModule
  let recommendationModule: QuickAssistRecommendationModule
  let ui: QuickAssistUI

  const emit = (event: QuickAssistEvent, allowAfterDestroy = false): void => {
    if (destroyed && !allowAfterDestroy) return
    try {
      resolved.onEvent?.(event)
    } catch {
      // Telemetry must never break UI cleanup or recursively report callback failures.
    }
  }

  const emitError = (sessionId: number, stage: QuickAssistErrorStage, error: unknown): void => {
    if (destroyed) return
    emit({ type: 'error', sessionId, stage, error: asError(error) })
  }

  const isCurrent = (candidate: QuickAssistSession): boolean =>
    !destroyed && session?.id === candidate.id && !candidate.controller.signal.aborted

  const reposition = (element: HTMLElement, candidate: QuickAssistSession): void => {
    const snapshot = candidate.activation.selection
    const anchor = snapshot ? getSnapshotRect(snapshot) : candidate.activation.rect
    if (!anchor) return
    positionElement({
      element,
      anchor,
      placement: resolved.trigger.placement,
      offset: resolved.trigger.offset,
    })
  }

  const stopAnchorObservation = (): void => {
    anchorCleanup?.()
    anchorCleanup = undefined
  }

  const closeSession = (reason: QuickAssistCloseReason): void => {
    const current = session
    if (triggerTimer !== undefined) clearTimeout(triggerTimer)
    triggerTimer = undefined
    stopAnchorObservation()
    triggerElement = null
    if (!current) {
      ui.close()
      return
    }
    current.controller.abort()
    session = null
    current.state = 'idle'
    // During re-selection the collector has already recorded the new range (or
    // cleared the invalid one). Resetting it here would lose the snapshot used
    // to dismiss a trigger if the same mouse drag later exceeds the limit.
    if (reason !== 'reselection') selectionModule.reset?.()
    ui.close()
    emit({ type: 'close', sessionId: current.id, reason }, reason === 'destroy')
  }

  const submit = (candidate: QuickAssistSession, query: string, suggestion?: Suggestion): void => {
    if (!isCurrent(candidate) || !candidate.context || candidate.submitStarted) return
    const normalizedQuery = query.trim()
    if (!normalizedQuery && !suggestion) return
    const adapter = resolved.adapter
    const buildPrompt = resolved.buildPrompt
    // Lock before invoking buildPrompt: user hooks can synchronously re-enter
    // submit through host callbacks or synthetic UI events.
    candidate.submitStarted = true
    let prompt: string
    try {
      prompt = buildPrompt
        ? buildPrompt({ query: normalizedQuery, context: candidate.context, suggestion })
        : (suggestion?.prompt ?? normalizedQuery)
    } catch (error) {
      candidate.submitStarted = false
      emitError(candidate.id, 'prompt', error)
      return
    }
    if (!isCurrent(candidate)) return
    const context: QuickAssistContext = {
      ...candidate.context,
      ...(candidate.context.selection ? { selection: { ...candidate.context.selection } } : {}),
      ...(candidate.context.page ? { page: { ...candidate.context.page } } : {}),
      ...(candidate.context.businessContext ? { businessContext: { ...candidate.context.businessContext } } : {}),
      ...(candidate.context.meta ? { meta: { ...candidate.context.meta } } : {}),
    }
    const frozenSuggestion = suggestion
      ? { ...suggestion, ...(suggestion.meta ? { meta: { ...suggestion.meta } } : {}) }
      : undefined
    const request: AIRequest = {
      source: context.source,
      query: normalizedQuery,
      prompt,
      context,
      ...(frozenSuggestion ? { suggestion: frozenSuggestion } : {}),
    }
    closeSession('submit')
    emit({ type: 'submit', sessionId: candidate.id })
    try {
      const result = adapter.submit(request)
      if (result && typeof (result as Promise<void>).then === 'function') {
        void Promise.resolve(result).catch((error) => emitError(candidate.id, 'adapter', error))
      }
    } catch (error) {
      emitError(candidate.id, 'adapter', error)
    }
  }

  const handlePopover = (candidate: QuickAssistSession): void => {
    if (!isCurrent(candidate)) return
    candidate.state = 'composer'
    stopAnchorObservation()
    const snapshot = snapshotOf(candidate.activation)
    const triggerAtOpen = triggerElement?.getBoundingClientRect() ?? null
    const triggerSize = triggerAtOpen ? { width: triggerAtOpen.width, height: triggerAtOpen.height } : undefined
    const triggerSide: QuickAssistPlacement = triggerElement?.dataset.placement === 'top' ? 'top' : 'bottom'
    triggerElement = null
    const popover = ui.showPopover({
      session: candidate,
      onSubmit: (query) => submit(candidate, query),
      onSuggestionClick: (suggestion) => {
        if (!isCurrent(candidate)) return
        emit({ type: 'suggestion_click', sessionId: candidate.id, suggestionId: suggestion.id })
        submit(candidate, candidate.inputValue, suggestion)
      },
      onClose: () => closeSession('escape'),
    })
    emit({ type: 'trigger_click', sessionId: candidate.id })
    if (!isCurrent(candidate)) return
    emit({ type: 'popover_show', sessionId: candidate.id })
    if (!isCurrent(candidate)) return
    const getPopoverAnchor = (): DOMRectReadOnly | null => {
      if (!snapshot) return triggerAtOpen
      const selectionRect = getSnapshotRect(snapshot)
      if (!selectionRect) return null
      if (!triggerSize) return selectionRect
      return getVirtualTriggerRect(resolved.root, selectionRect, triggerSize, triggerSide, resolved.trigger.offset)
    }
    const positionPopover = (): void => {
      const anchor = getPopoverAnchor()
      if (!anchor) return
      positionElement({
        element: popover,
        anchor,
        placement: 'auto',
        offset: resolved.trigger.offset,
      })
    }
    if (triggerAtOpen) {
      positionElement({
        element: popover,
        anchor: triggerAtOpen,
        placement: 'auto',
        offset: resolved.trigger.offset,
      })
    } else {
      positionPopover()
    }
    if (snapshot) {
      anchorCleanup = observeAnchor({
        element: popover,
        snapshot,
        onChange: () => {
          if (isCurrent(candidate)) positionPopover()
        },
        onInvalid: () => {
          if (isCurrent(candidate)) closeSession('anchor-invalid')
        },
      })
    }
    const hasProvider = !!resolved.getSuggestions
    ui.update({ loading: hasProvider, submittingDisabled: true })
    positionPopover()
    void Promise.resolve(contextModule.build(snapshot as SelectionSnapshot, candidate.controller.signal))
      .then((context) => {
        if (!isCurrent(candidate)) return
        candidate.context = context
        let base: Suggestion[]
        try {
          base = recommendationModule.resolveBase(context)
        } catch (error) {
          ui.update({ loading: false, submittingDisabled: false, error: true })
          positionPopover()
          emitError(candidate.id, 'suggestions', error)
          return
        }
        candidate.suggestions = base
        ui.update({ suggestions: base, loading: hasProvider, submittingDisabled: false, error: false })
        positionPopover()
        if (!resolved.getSuggestions) return
        const asyncSuggestions = recommendationModule.resolveAsync?.(context, candidate.controller.signal)
        if (!asyncSuggestions) return
        return Promise.resolve(asyncSuggestions)
          .then((incoming) => {
            if (!isCurrent(candidate)) return
            const merged = recommendationModule.merge(base, incoming, context)
            candidate.suggestions = merged
            ui.update({ suggestions: merged, loading: false, submittingDisabled: false, error: false })
            positionPopover()
          })
          .catch((error) => {
            if (!isCurrent(candidate)) return
            ui.update({ suggestions: base, loading: false, submittingDisabled: false, error: true })
            positionPopover()
            emitError(candidate.id, 'suggestions', error)
          })
      })
      .catch((error) => {
        if (!isCurrent(candidate)) return
        ui.update({ loading: false, submittingDisabled: true, error: true })
        positionPopover()
        emitError(candidate.id, stageOf(error), error)
      })
  }

  const showTrigger = (candidate: QuickAssistSession, emitSelection = false): void => {
    if (!isCurrent(candidate)) return
    const snapshot = candidate.activation.selection
    if (resolved.trigger.showDelay > 0 && snapshot) {
      const latest = captureSelectionSnapshot(resolved.root)
      if (
        !latest ||
        latest.text !== snapshot.text ||
        latest.range.startContainer !== snapshot.range.startContainer ||
        latest.range.startOffset !== snapshot.range.startOffset ||
        latest.range.endContainer !== snapshot.range.endContainer ||
        latest.range.endOffset !== snapshot.range.endOffset
      ) {
        closeSession('reselection')
        return
      }
      if (!getSnapshotRect(snapshot)) {
        closeSession('anchor-invalid')
        return
      }
    }
    triggerElement = ui.showTrigger({
      activation: candidate.activation,
      onClick: () => handlePopover(candidate),
    })
    if (emitSelection) emit({ type: 'selection', sessionId: candidate.id })
    if (!isCurrent(candidate)) return
    emit({ type: 'trigger_show', sessionId: candidate.id })
    if (!isCurrent(candidate)) return
    reposition(triggerElement, candidate)
    if (!snapshot) return
    let triggerAnchor = getSnapshotRect(snapshot)
    let cumulativeTriggerMovement = 0
    anchorCleanup = observeAnchor({
      element: triggerElement,
      snapshot,
      onChange: () => {
        if (!isCurrent(candidate) || !triggerElement) return
        const nextAnchor = getSnapshotRect(snapshot)
        if (candidate.state === 'trigger' && triggerAnchor && nextAnchor) {
          cumulativeTriggerMovement +=
            Math.abs(nextAnchor.left - triggerAnchor.left) + Math.abs(nextAnchor.top - triggerAnchor.top)
          if (cumulativeTriggerMovement > 4) {
            closeSession('scroll')
            return
          }
        }
        if (nextAnchor) triggerAnchor = nextAnchor
        reposition(triggerElement, candidate)
      },
      onInvalid: () => {
        if (isCurrent(candidate)) closeSession('anchor-invalid')
      },
    })
  }

  const scheduleTrigger = (candidate: QuickAssistSession): void => {
    if (!isCurrent(candidate) || pointerDown) return
    if (triggerTimer !== undefined) clearTimeout(triggerTimer)
    triggerTimer = setTimeout(() => {
      triggerTimer = undefined
      showTrigger(candidate)
    }, resolved.trigger.showDelay)
  }

  const handleActivation = (rawActivation: QuickAssistActivation): void => {
    if (!enabled || destroyed) return
    const activation = normalizeActivation(rawActivation)
    const snapshot = snapshotOf(activation)
    if (!snapshot) return
    const currentSnapshot = session?.activation.selection
    if (
      currentSnapshot &&
      currentSnapshot.text === snapshot.text &&
      currentSnapshot.range.startContainer === snapshot.range.startContainer &&
      currentSnapshot.range.startOffset === snapshot.range.startOffset &&
      currentSnapshot.range.endContainer === snapshot.range.endContainer &&
      currentSnapshot.range.endOffset === snapshot.range.endOffset
    )
      return
    if (session) closeSession('reselection')
    const next: QuickAssistSession = {
      id: ++nextSessionId,
      activation,
      controller: new AbortController(),
      state: 'trigger',
      suggestions: [],
      inputValue: snapshot.text,
      originalActiveElement: resolved.root.activeElement,
      submitStarted: false,
    }
    session = next
    if (resolved.trigger.showDelay === 0) {
      showTrigger(next, true)
      return
    }
    emit({ type: 'selection', sessionId: next.id })
    if (!isCurrent(next)) return
    scheduleTrigger(next)
  }

  const onPointerDown = (event: PointerEvent): void => {
    if (event.pointerType !== 'touch') pointerDown = true
    if (session && !ui.contains(event.target as Node | null)) closeSession('outside')
  }
  const onPointerUp = (event: PointerEvent): void => {
    if (event.pointerType === 'touch') return
    pointerDown = false
    if (session?.state === 'trigger' && !triggerElement && triggerTimer === undefined) scheduleTrigger(session)
  }
  const onPointerCancel = (): void => {
    pointerDown = false
    if (session?.state === 'trigger' && !triggerElement) closeSession('reselection')
  }
  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && session) {
      event.preventDefault()
      closeSession('escape')
    }
  }
  const onRoute = (): void => {
    if (session) closeSession('route')
  }

  const attachGlobalListeners = (): void => {
    resolved.root.addEventListener('pointerdown', onPointerDown, true)
    resolved.root.addEventListener('pointerup', onPointerUp, true)
    resolved.root.addEventListener('pointercancel', onPointerCancel, true)
    resolved.root.addEventListener('keydown', onKeyDown, true)
    resolved.root.defaultView?.addEventListener('popstate', onRoute)
    resolved.root.defaultView?.addEventListener('hashchange', onRoute)
  }
  const detachGlobalListeners = (): void => {
    resolved.root.removeEventListener('pointerdown', onPointerDown, true)
    resolved.root.removeEventListener('pointerup', onPointerUp, true)
    resolved.root.removeEventListener('pointercancel', onPointerCancel, true)
    resolved.root.removeEventListener('keydown', onKeyDown, true)
    resolved.root.defaultView?.removeEventListener('popstate', onRoute)
    resolved.root.defaultView?.removeEventListener('hashchange', onRoute)
  }

  const createModules = (configuration: ResolvedQuickAssistOptions) => {
    let nextSelection: QuickAssistSelectionModule | undefined
    let nextUI: QuickAssistUI | undefined
    try {
      nextSelection = createSelectionController({
        root: configuration.root,
        include: configuration.include,
        exclude: configuration.exclude,
        maxTextLength: configuration.selection.maxTextLength,
        validate: configuration.selection.validate,
      })
      const nextContext = createContextModule({
        root: configuration.root,
        include: configuration.include,
        exclude: configuration.exclude,
        nearbyContext: configuration.nearbyContext,
        getNearbyContext: configuration.getNearbyContext,
        getContext: configuration.getContext
          ? async (context, signal) => {
              try {
                return (await configuration.getContext?.(context, signal)) ?? {}
              } catch (error) {
                throw new QuickAssistStageError('context', error)
              }
            }
          : undefined,
        sanitizeContext: configuration.sanitizeContext
          ? async (context, signal) => {
              try {
                const sanitized = await configuration.sanitizeContext?.(context, signal)
                if (!sanitized || typeof sanitized !== 'object') {
                  throw new Error('sanitizeContext must return a QuickAssistContext object')
                }
                return sanitized
              } catch (error) {
                throw new QuickAssistStageError('sanitize', error)
              }
            }
          : undefined,
      })
      const nextRecommendation = createRecommendationResolver({
        suggestions: configuration.suggestions,
        getSuggestions: configuration.getSuggestions,
        mergeSuggestions: configuration.mergeSuggestions,
        maxSuggestions: configuration.maxSuggestions,
        messages: configuration.messages,
      })
      nextUI = createQuickAssistUI({
        root: configuration.root,
        attrs: configuration.attrs,
        messages: configuration.messages,
        triggerLabel: configuration.trigger.label,
      })
      return {
        selection: nextSelection,
        context: nextContext,
        recommendation: nextRecommendation,
        ui: nextUI,
      }
    } catch (error) {
      nextSelection?.destroy?.()
      nextUI?.destroy()
      throw error
    }
  }

  const installModules = (modules: ReturnType<typeof createModules>): void => {
    selectionModule = modules.selection
    contextModule = modules.context
    recommendationModule = modules.recommendation
    ui = modules.ui
    unsubscribeSelection = selectionModule.onActivation(handleActivation)
    unsubscribeSelectionClear = selectionModule.onClear?.(() => {
      if (session?.state === 'trigger') closeSession('reselection')
    })
  }

  try {
    installModules(createModules(resolved))
  } catch (error) {
    emitError(0, 'config', error)
    throw error
  }

  const enable = (): void => {
    if (destroyed || enabled) return
    enabled = true
    selectionModule.enable()
    attachGlobalListeners()
  }
  const disable = (): void => {
    if (destroyed || !enabled) return
    closeSession('disable')
    pointerDown = false
    enabled = false
    selectionModule.disable()
    detachGlobalListeners()
  }
  const close = (): void => {
    if (!destroyed) closeSession('manual')
  }
  const destroy = (): void => {
    if (destroyed) return
    destroyed = true
    closeSession('destroy')
    enabled = false
    detachGlobalListeners()
    unsubscribeSelection?.()
    unsubscribeSelectionClear?.()
    selectionModule.destroy?.()
    ui.destroy()
  }
  const updateOptions = (partial: Partial<QuickAssistOptions>): void => {
    if (destroyed) return
    const merged = { ...resolved, ...partial } as QuickAssistOptions
    let nextResolved: ResolvedQuickAssistOptions
    let nextModules: ReturnType<typeof createModules>
    try {
      const nextRoot = currentDocument(merged)
      if (nextRoot !== resolved.root) {
        throw new Error('QuickAssist root cannot change in updateOptions; destroy and create a new instance')
      }
      nextResolved = normalizeOptions(merged)
      nextModules = createModules(nextResolved)
    } catch (error) {
      emitError(session?.id ?? 0, 'config', error)
      throw error
    }
    const startingVersion = optionsVersion
    closeSession('update')
    const shouldEnable = partial.enabled === undefined ? enabled : nextResolved.enabled
    if (destroyed || optionsVersion !== startingVersion) {
      nextModules.selection.destroy?.()
      nextModules.ui.destroy()
      return
    }
    if (enabled) disable()
    unsubscribeSelection?.()
    selectionModule.destroy?.()
    ui.destroy()
    enabled = false
    resolved = nextResolved
    optionsVersion += 1
    installModules(nextModules)
    if (shouldEnable) enable()
    else enabled = false
  }

  if (resolved.enabled) enable()
  return { enable, disable, close, destroy, updateOptions }
}
