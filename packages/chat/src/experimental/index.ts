import './experimental.css'

export { dispatchExperimentalEvent, toExperimentalEventName } from './events'
export { TR_CHAT_EVENT_NAMES, TR_CHAT_UI_EVENT_NAMES, forwardElementEvent } from './elementEvents'
export { SCOPED_RENDERER_NAMES, STATIC_SLOT_NAMES } from './elementSlots'
export { createRendererHost } from './renderers'
export { whenTrChatReady } from './readiness'
export { defineTrChatElements, TrChatElement, TrChatUIElement } from './register'
export { createChatRuntime, DEFAULT_CHAT_STORAGE_KEY } from './runtime/createChatRuntime'

export type { ExperimentalErrorDetail, ExperimentalEventInit } from './events'
export type {
  TrChatCommonElementEventMap,
  TrChatElementEventMap,
  TrChatUIElementEventMap,
  TrChatSourceEventName,
  TrChatUISourceEventName,
} from './elementEvents'
export type {
  ExperimentalRenderer,
  ExperimentalRendererHost,
  ExperimentalRendererLifecycle,
  ExperimentalRendererResult,
} from './renderers'
export type {
  TrChatElementConstructor,
  TrChatElementConstructors,
  TrChatHTMLElement,
  TrChatUIHTMLElement,
} from './types'
export type { TrChatRenderers, TrChatSharedElementProperties } from './elementTypes'
export type {
  CreateChatRuntimeComposerOptions,
  CreateChatRuntimeOptions,
  CreateChatRuntimeResult,
} from './runtime/types'
