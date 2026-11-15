import type { ComputedRef, InjectionKey } from 'vue'
import type { ChatRuntime, ChatUIData } from '../../types'

/** Internal lifetime boundary for DOM handles when Chat reuses its UI for a different Runtime. */
export const rendererRuntimeOwner: InjectionKey<{ runtime: ComputedRef<ChatRuntime>; data: ComputedRef<ChatUIData> }> =
  Symbol('chat-renderer-runtime-owner')
