import type {
  AIRequest,
  QuickAssistContext,
  QuickAssistEvent,
  QuickAssistActivation,
  QuickAssistOptions,
  QuickAssistPlacement,
  SelectionSnapshot,
  Suggestion,
} from '../types'

export type { QuickAssistActivation } from '../types'

/** The trigger kind is intentionally generic so future non-selection activators can share the runtime. */
export type QuickAssistViewState = 'idle' | 'trigger' | 'composer'

export interface QuickAssistSession {
  id: number
  activation: QuickAssistActivation
  controller: AbortController
  state: QuickAssistViewState
  context?: QuickAssistContext
  suggestions: Suggestion[]
  inputValue: string
  originalActiveElement: Element | null
  /** Prevents re-entrant submit attempts while request construction is running. */
  submitStarted: boolean
}

export interface ResolvedQuickAssistOptions extends QuickAssistOptions {
  root: Document
  enabled: boolean
  include: string[]
  exclude: string[]
  maxSuggestions: number
  selection: {
    maxTextLength: number
    validate?: NonNullable<QuickAssistOptions['selection']>['validate']
  }
  trigger: Required<NonNullable<QuickAssistOptions['trigger']>>
  nearbyContext: Required<NonNullable<QuickAssistOptions['nearbyContext']>>
  messages: Required<NonNullable<QuickAssistOptions['messages']>>
}

export interface QuickAssistSelectionModule {
  enable: () => void
  disable: () => void
  destroy?: () => void
  /** Allow a closed session to be re-triggered from the same Range. */
  reset?: () => void
  onActivation: (listener: (activation: QuickAssistActivation) => void) => () => void
  /** Emitted for an invalid/cleared page selection; UI-internal collapse is not emitted. */
  onClear?: (listener: () => void) => () => void
}

export interface QuickAssistContextModule {
  build: (snapshot: SelectionSnapshot, signal: AbortSignal) => QuickAssistContext | Promise<QuickAssistContext>
}

export interface QuickAssistRecommendationModule {
  resolveBase: (context: QuickAssistContext) => Suggestion[]
  resolveAsync?: (context: QuickAssistContext, signal: AbortSignal) => Suggestion[] | Promise<Suggestion[]>
  merge: (base: Suggestion[], incoming: Suggestion[], context: QuickAssistContext) => Suggestion[]
}

export interface QuickAssistPositioningModule {
  place: (element: HTMLElement, anchor: DOMRectReadOnly, placement: QuickAssistPlacement, offset: number) => void
  observe?: (element: HTMLElement, snapshot: SelectionSnapshot, onChange: () => void) => () => void
}

export interface QuickAssistUI {
  showTrigger: (input: { activation: QuickAssistActivation; onClick: () => void }) => HTMLElement
  showPopover: (input: {
    session: QuickAssistSession
    onSubmit: (query: string) => void
    onSuggestionClick: (suggestion: Suggestion) => void
    onClose: () => void
  }) => HTMLElement
  update: (state: {
    suggestions?: Suggestion[]
    loading?: boolean
    error?: boolean
    submittingDisabled?: boolean
  }) => void
  close: () => void
  destroy: () => void
  contains: (node: Node | null) => boolean
}

export interface QuickAssistRuntimeHooks {
  emit: (event: QuickAssistEvent) => void
  submit: (request: AIRequest, sessionId: number) => void
}
