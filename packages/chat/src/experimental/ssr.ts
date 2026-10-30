export { dispatchExperimentalEvent, dispatchTrChatError, toExperimentalEventName } from './events'
export { TR_CHAT_EVENT_NAMES, TR_CHAT_UI_EVENT_NAMES, forwardElementEvent } from './elementEvents'
export { SCOPED_RENDERER_NAMES, STATIC_SLOT_NAMES } from './elementSlots'
export { createRendererHost } from './renderers'
export { whenTrChatReady } from './readiness'
export { createChatRuntime, DEFAULT_CHAT_STORAGE_KEY } from './runtime/createChatRuntime'

export type { ExperimentalErrorDetail, ExperimentalEventInit, TrChatErrorDetail, TrChatErrorSource } from './events'
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
  TrChatRenderers,
  TrChatSharedElementProperties,
  TrChatUIHTMLElement,
} from './elementTypes'
export type { Attachment } from '../types'
export type {
  CreateChatRuntimeComposerOptions,
  CreateChatRuntimeOptions,
  CreateChatRuntimeResult,
} from './runtime/types'
export type { TrChatRuntimeSnapshot } from './runtime/runtimeSnapshot'

import type { TrChatElementConstructor, TrChatHTMLElement, TrChatUIHTMLElement } from './elementTypes'

export const TrChatElement = undefined as unknown as TrChatElementConstructor<TrChatHTMLElement>
export const TrChatUIElement = undefined as unknown as TrChatElementConstructor<TrChatUIHTMLElement>

export function defineTrChatElements(): never {
  const error = new Error(
    'defineTrChatElements() requires a browser environment with the customElements registry. Importing the package during SSR is supported; register elements in a browser-only lifecycle hook.',
  )
  error.name = 'TrChatBrowserOnlyError'
  throw error
}
