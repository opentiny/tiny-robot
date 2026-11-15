import { defineCustomElement } from 'vue'
import TrChatElementComponent from './TrChatElement.ce.vue'
import TrChatUIElementComponent from './TrChatUIElement.ce.vue'
import type {
  TrChatElementConstructor,
  TrChatElementConstructors,
  TrChatHTMLElement,
  TrChatUIHTMLElement,
} from './elementTypes'

export const TrChatElement = defineCustomElement(TrChatElementComponent, {
  shadowRoot: false,
}) as unknown as TrChatElementConstructor<TrChatHTMLElement>

export const TrChatUIElement = defineCustomElement(TrChatUIElementComponent, {
  shadowRoot: false,
}) as unknown as TrChatElementConstructor<TrChatUIHTMLElement>

const defaultConstructors: Required<TrChatElementConstructors> = {
  chat: TrChatElement,
  chatUI: TrChatUIElement,
}

const definitions = [
  ['tr-chat', 'chat'],
  ['tr-chat-ui', 'chatUI'],
] as const

export function defineTrChatElements(constructors: TrChatElementConstructors = {}): void {
  const resolved = { ...defaultConstructors, ...constructors }

  for (const [name, key] of definitions) {
    const existing = customElements.get(name)
    if (existing && existing !== resolved[key]) {
      throw new Error(`Cannot define ${name}: the name is already defined with a different constructor.`)
    }
  }

  for (const [name, key] of definitions) {
    if (!customElements.get(name)) customElements.define(name, resolved[key])
  }
}
