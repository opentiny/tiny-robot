import {
  defineComponent,
  defineCustomElement,
  getCurrentInstance,
  h,
  onMounted,
  onUpdated,
  type ComponentObjectPropsOptions,
  type PropType,
} from 'vue'
import { signalTrChatReady } from './readiness'
import type {
  TrChatElementConstructor,
  TrChatElementConstructors,
  TrChatHTMLElement,
  TrChatUIHTMLElement,
} from './types'

const sharedProps = {
  ui: Object,
  floatingState: Object,
  rightAsideOpen: { type: Boolean, default: undefined },
  defaultRightAsideOpen: { type: Boolean, default: undefined },
  activeRightAsidePanelId: String,
  defaultActiveRightAsidePanelId: String,
} satisfies ComponentObjectPropsOptions

function createProtocolElement(
  name: string,
  props: ComponentObjectPropsOptions,
  booleanProps: readonly string[],
): CustomElementConstructor {
  const component = defineComponent({
    name,
    props,
    setup(resolvedProps, { slots }) {
      const propValues = resolvedProps as Record<string, unknown>
      const instance = getCurrentInstance() as (ReturnType<typeof getCurrentInstance> & { ce?: HTMLElement }) | null

      const syncBooleanProperties = () => {
        const host = instance?.ce as (HTMLElement & Record<string, unknown>) | undefined
        if (!host) return

        for (const key of booleanProps) {
          const value = propValues[key]
          if (host[key] !== value) host[key] = value
        }
      }

      onMounted(() => {
        syncBooleanProperties()
        if (instance?.ce) signalTrChatReady(instance.ce)
      })
      onUpdated(syncBooleanProperties)
      return () => h('div', { part: 'root' }, slots.default?.())
    },
  })

  return defineCustomElement(component, { shadowRoot: false }) as CustomElementConstructor
}

export const TrChatElement = createProtocolElement(
  'TrChatElement',
  {
    ...sharedProps,
    runtime: Object as PropType<object>,
    title: String,
    historyData: Object,
  },
  ['rightAsideOpen', 'defaultRightAsideOpen'],
) as TrChatElementConstructor<TrChatHTMLElement>

export const TrChatUIElement = createProtocolElement(
  'TrChatUIElement',
  {
    ...sharedProps,
    inputValue: String,
    defaultInputValue: String,
    data: Object,
  },
  ['rightAsideOpen', 'defaultRightAsideOpen'],
) as TrChatElementConstructor<TrChatUIHTMLElement>

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
