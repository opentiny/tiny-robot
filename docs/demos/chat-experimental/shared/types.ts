import type { TrChatHTMLElement, TrChatUIHTMLElement } from '@opentiny/tiny-robot-chat/experimental'

export interface ExperimentalExampleModule {
  readonly id: string
  readonly summary: string
  readonly testedInteractions: readonly string[]
  mount(host: HTMLElement): Promise<void | (() => void)>
}

export type ChatElement = TrChatHTMLElement
export type ChatUIElement = TrChatUIHTMLElement
