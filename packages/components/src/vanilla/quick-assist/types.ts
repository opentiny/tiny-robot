/** A placement preference for the selection trigger and popover. */
export type QuickAssistPlacement = 'top' | 'bottom' | 'auto'

/** Reasons a visible QuickAssist session can be closed. */
export type QuickAssistCloseReason =
  | 'outside'
  | 'escape'
  | 'scroll'
  | 'anchor-invalid'
  | 'route'
  | 'submit'
  | 'disable'
  | 'destroy'
  | 'update'
  | 'manual'
  | 'reselection'

/** Stage at which a recoverable QuickAssist error occurred. */
export type QuickAssistErrorStage =
  | 'context'
  | 'sanitize'
  | 'suggestions'
  | 'prompt'
  | 'adapter'
  | 'config'
  | 'callback'

/** The immutable selection data captured at the time a session starts. */
export interface SelectionSnapshot {
  text: string
  range: Range
  rect: DOMRectReadOnly
  clientRects: DOMRectReadOnly[]
  anchorElement: Element | null
  root: Document
  createdAt: number
}

/**
 * Generic trigger activation. Selection is one activation source, but the core does not
 * require every future source to manufacture a Range or SelectionSnapshot.
 */
export interface QuickAssistActivation {
  source: string
  text?: string
  rect?: DOMRectReadOnly
  anchorElement?: Element | null
  selection?: SelectionSnapshot
}

/** Context passed to recommendation providers and the host adapter. */
export interface QuickAssistContext {
  source: string
  text: string
  selection?: { text: string }
  page?: { title?: string; url?: string }
  nearbyText?: string
  businessContext?: Record<string, unknown>
  meta?: Record<string, unknown>
}

/** A recommendation's stable identity, UI label, and submitted prompt. */
export interface Suggestion {
  id: string
  label: string
  prompt: string
  meta?: Record<string, unknown>
}

/** A recommendation factory evaluated after the context is sanitized. */
export interface SuggestionFactory {
  id: string
  getLabel: (context: QuickAssistContext) => string
  getPrompt: (context: QuickAssistContext) => string
}

/** A request frozen immediately before handing work to the host adapter. */
export interface AIRequest {
  source: string
  query: string
  prompt: string
  context: QuickAssistContext
  suggestion?: Suggestion
}

/** Host-owned bridge to the existing AI conversation capability. */
export interface AIAdapter {
  submit: (request: AIRequest) => void | Promise<void>
}

export type QuickAssistSuggestionInput = Suggestion | SuggestionFactory

export interface QuickAssistSelectionOptions {
  maxTextLength?: number
  validate?: (snapshot: SelectionSnapshot) => boolean
}

export interface QuickAssistTriggerOptions {
  label?: string
  offset?: number
  placement?: QuickAssistPlacement
}

export interface QuickAssistNearbyContextOptions {
  maxLength?: number
  blockSelectors?: string[]
}

/** Context hook receives the captured snapshot, never the live Selection. */
export type GetNearbyContext = (snapshot: SelectionSnapshot) => string | undefined

export type GetBusinessContext = (
  context: QuickAssistContext,
  signal: AbortSignal,
) => Record<string, unknown> | Promise<Record<string, unknown>>

export type SanitizeContext = (
  context: QuickAssistContext,
  signal: AbortSignal,
) => QuickAssistContext | Promise<QuickAssistContext>

export type GetSuggestions = (context: QuickAssistContext, signal: AbortSignal) => Suggestion[] | Promise<Suggestion[]>

export type MergeSuggestions = (base: Suggestion[], incoming: Suggestion[], context: QuickAssistContext) => Suggestion[]

export type BuildPromptInput = {
  query: string
  context: QuickAssistContext
  suggestion?: Suggestion
}

export type BuildPrompt = (input: BuildPromptInput) => string

/** Safe host attributes. Runtime ignores event handlers and unsafe DOM sinks. */
export type QuickAssistAttributeValue = string | number | boolean | null | undefined

export type QuickAssistAttributeMap = Record<string, QuickAssistAttributeValue>

export interface QuickAssistAttrs {
  root?: QuickAssistAttributeMap
  trigger?: QuickAssistAttributeMap
  popover?: QuickAssistAttributeMap
  input?: QuickAssistAttributeMap
  submit?: QuickAssistAttributeMap
  suggestion?: QuickAssistAttributeMap | ((suggestion: Suggestion) => QuickAssistAttributeMap)
}

export interface QuickAssistMessages {
  inputLabel?: string
  submitLabel?: string
  loading?: string
  empty?: string
  error?: string
  defaultExplain?: string | ((text: string) => string)
  defaultUseCase?: string | ((text: string) => string)
}

export interface QuickAssistOptions {
  root?: Document
  enabled?: boolean
  adapter: AIAdapter
  include?: string[]
  exclude?: string[]
  selection?: QuickAssistSelectionOptions
  trigger?: QuickAssistTriggerOptions
  nearbyContext?: QuickAssistNearbyContextOptions
  getNearbyContext?: GetNearbyContext
  getContext?: GetBusinessContext
  sanitizeContext?: SanitizeContext
  suggestions?: QuickAssistSuggestionInput[]
  getSuggestions?: GetSuggestions
  mergeSuggestions?: MergeSuggestions
  maxSuggestions?: number
  buildPrompt?: BuildPrompt
  attrs?: QuickAssistAttrs
  messages?: QuickAssistMessages
  onEvent?: (event: QuickAssistEvent) => void
}

export interface QuickAssistInstance {
  enable: () => void
  disable: () => void
  close: () => void
  destroy: () => void
  updateOptions: (options: Partial<QuickAssistOptions>) => void
}

export interface QuickAssistEventBase {
  sessionId: number
  type: QuickAssistEvent['type']
}

export interface QuickAssistSelectionEvent extends QuickAssistEventBase {
  type: 'selection'
}

export interface QuickAssistTriggerShowEvent extends QuickAssistEventBase {
  type: 'trigger_show'
}

export interface QuickAssistTriggerClickEvent extends QuickAssistEventBase {
  type: 'trigger_click'
}

export interface QuickAssistPopoverShowEvent extends QuickAssistEventBase {
  type: 'popover_show'
}

export interface QuickAssistSuggestionClickEvent extends QuickAssistEventBase {
  type: 'suggestion_click'
  suggestionId: string
}

export interface QuickAssistSubmitEvent extends QuickAssistEventBase {
  type: 'submit'
}

export interface QuickAssistCloseEvent extends QuickAssistEventBase {
  type: 'close'
  reason: QuickAssistCloseReason
}

export interface QuickAssistErrorEvent extends QuickAssistEventBase {
  type: 'error'
  stage: QuickAssistErrorStage
  error: Error
}

export type QuickAssistEvent =
  | QuickAssistSelectionEvent
  | QuickAssistTriggerShowEvent
  | QuickAssistTriggerClickEvent
  | QuickAssistPopoverShowEvent
  | QuickAssistSuggestionClickEvent
  | QuickAssistSubmitEvent
  | QuickAssistCloseEvent
  | QuickAssistErrorEvent
