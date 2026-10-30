import { dispatchExperimentalEvent, dispatchTrChatError, type ExperimentalErrorDetail } from './events'
import { createChatRendererHost } from '../renderers/domRenderer'
import type { ChatRenderer, ChatRendererHost, ChatRendererLifecycle, ChatRendererResult } from '../types'

export type ExperimentalRendererLifecycle = ChatRendererLifecycle
export type ExperimentalRendererResult = ChatRendererResult
export type ExperimentalRenderer<TContext> = ChatRenderer<TContext>
export type ExperimentalRendererHost = ChatRendererHost

export function createRendererHost(host: HTMLElement): ExperimentalRendererHost {
  return createChatRendererHost(host, {
    onError(error) {
      dispatchExperimentalEvent<ExperimentalErrorDetail>(host, 'experimental-error', {
        source: 'renderer',
        error,
      })
      dispatchTrChatError(host, {
        source: 'renderer',
        code: 'renderer_failed',
        cause: error,
        recoverable: true,
      })
    },
  })
}
