/** A placement preference. start/end extend outward from the selected line's left/right edge. */
export type QuickAssistPlacement = 'top' | 'bottom' | 'auto' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'

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
  /** DOM selection direction; absent for snapshots supplied by older integrations. */
  direction?: 'forward' | 'backward'
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

/** 只读激活视图：传给通用钩子，保证不含 Range；旧 SelectionSnapshot 契约不复用。 */
export interface QuickAssistActivationView {
  source: string
  text: string
  direction?: 'forward' | 'backward'
  anchorElement?: Element | null
  identity?: string
  meta?: Record<string, unknown>
}

/** Options for this activation only; instance defaults are left unchanged. */
export interface QuickAssistActivationOptions {
  /** Defaults to trigger. popover opens the input immediately, bypassing showDelay and the entry button. */
  open?: 'trigger' | 'popover'
  /** Replace this session's static suggestions; [] hides them. Supplying this also opts out of the instance provider. */
  suggestions?: QuickAssistSuggestionInput[]
  /** Session provider. Omitted with suggestions uses no provider; otherwise inherits the instance. null disables it. */
  getSuggestions?: GetSuggestions | null
}

/**
 * 一次激活的活几何句柄：DOM 选区与编辑器选区统一到这个形状。
 * getRect 每次调用返回选区当前锚点矩形（viewport 坐标）；返回 null 表示
 * 选区已失效或不可见（编辑器裁剪区域内不可见同样视为无效）。
 */
export interface QuickAssistActivationInput extends QuickAssistActivationView, QuickAssistActivationOptions {
  getRect: () => DOMRectReadOnly | null
  /**
   * 可选：失效订阅。桥接器接入编辑器生命周期（dispose、模型切换、内容变化、
   * 容器移除/布局变化等），事件到来时回调；返回取消订阅函数。
   * 运行时在会话建立（handleActivation）时即安装本订阅——覆盖 showDelay
   * 延迟阶段。到达后统一重评估：verify + getRect 通过则重定位，否则关闭。
   */
  onInvalidate?: (callback: () => void) => () => void
  /** 可选：showDelay 到期时的一致性校验；缺省用 getRect() !== null。 */
  verify?: () => boolean
  /** 可选：nearbyText 提供者。实现方必须在 emit 时冻结快照，不能延迟读取活状态。 */
  getNearbyText?: () => string | undefined
}

/** 可注册的触发源。name 仅作业务标签；会话归属由运行时 token 决定。 */
export interface QuickAssistSelectionSource {
  name: string
  /** emit(input) 触发会话；emit(null) 清除本源当前会话。 */
  activate: (emit: (input: QuickAssistActivationInput | null) => void) => void
  deactivate: () => void
}

/**
 * 便捷形式：给一个元素做锚点。内部经 observeElementLiveness 构造 DOM 锚点
 * （ResizeObserver + 祖先链 childList MutationObserver），元素 remove() 或
 * 尺寸塌缩无需依赖 scroll/resize 即可触发失效。
 */
export interface QuickAssistAnchorShortcut extends QuickAssistActivationOptions {
  text: string
  anchor: Element
  source?: string
  meta?: Record<string, unknown>
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
  /** Only accept selections in document order. Defaults to true. */
  forwardOnly?: boolean
  maxTextLength?: number
  validate?: (snapshot: SelectionSnapshot) => boolean
  /** Synthetic activations only; replaces default text rules, not size/geometry checks. */
  validateActivation?: (view: QuickAssistActivationView) => boolean
}

export interface QuickAssistTriggerOptions {
  label?: string
  /** Milliseconds to wait after the selection settles before showing the trigger. Defaults to 0. */
  showDelay?: number
  offset?: number
  /** Preferred position relative to the first/last selected line. Defaults to bottom-end. */
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

/**
 * Synchronous business validation of each structurally valid remote suggestion.
 * False discards the item. If a non-empty provider response has no valid items
 * after structural and business validation, the remote batch fails: static
 * suggestions remain available and an error event is emitted at stage 'suggestions'.
 * Throwing or returning a non-boolean also fails the batch. An explicit empty
 * provider response ([]) is successful and proceeds to mergeSuggestions.
 */
export type ValidateSuggestion = (suggestion: Suggestion, context: QuickAssistContext) => boolean

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
  /** Only validates remote suggestions, before merging. Exceptions fail the remote batch. */
  validateSuggestion?: ValidateSuggestion
  mergeSuggestions?: MergeSuggestions
  maxSuggestions?: number
  buildPrompt?: BuildPrompt
  attrs?: QuickAssistAttrs
  messages?: QuickAssistMessages
  onEvent?: (event: QuickAssistEvent) => void
}

export interface QuickAssistInstance {
  /** Explicitly show an entry for supplied text and a viewport anchor. Disabled instances ignore calls. */
  activate: (input: QuickAssistActivationInput | QuickAssistAnchorShortcut) => void
  /** Register an automatic source; unregistering closes only its own session. */
  registerSource: (source: QuickAssistSelectionSource) => () => void
  enable: () => void
  disable: () => void
  close: () => void
  destroy: () => void
  /** Shallow-merges top-level options; supplied nested groups replace the entire group. */
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
