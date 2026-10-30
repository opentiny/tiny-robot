import type { TrChatHTMLElement, TrChatUIHTMLElement } from './elementTypes'

declare const chat: TrChatHTMLElement
declare const chatUI: TrChatUIHTMLElement

chat.addEventListener('right-aside-open-update', (event) => {
  const open: boolean = event.detail
  void open
})

chat.addEventListener('runtime-action-error', (event) => {
  const action: string = event.detail.action
  void action
})

chat.addEventListener('tr-chat-error', (event) => {
  const source: string = event.detail.source
  const code: string = event.detail.code
  const recoverable: boolean = event.detail.recoverable
  const cause: unknown = event.detail.cause
  void source
  void code
  void recoverable
  void cause
})

chatUI.addEventListener('input-value-update', (event) => {
  const value: string = event.detail
  void value
})

chatUI.addEventListener('submit', (event) => {
  const text: string = event.detail.text
  void text
})

chat.openRightAside('preview')
void chat.send({ text: 'typed ref method' })
chat.runtimeOptions = {
  plugins: [
    {
      onBeforeRequest({ requestBody }) {
        requestBody.contractMarker = true
      },
    },
  ],
  transformSendPayload: (payload) => ({
    ...payload,
    structuredData: [{ type: 'text', text: payload.text }],
  }),
}
chatUI.inputValue = 'typed property binding'
