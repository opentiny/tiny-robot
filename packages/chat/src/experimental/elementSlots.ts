import {
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  provide,
  shallowRef,
  useHost,
  watchEffect,
  type InjectionKey,
  type VueElement,
} from 'vue'

const ORDINARY_SLOT_NAMES = ['welcome-footer', 'prompts-footer', 'sender-header', 'input-prefix'] as const
type OrdinarySlotName = (typeof ORDINARY_SLOT_NAMES)[number]
const states = new WeakMap<HTMLElement, ElementSlots>()
const slotsKey: InjectionKey<ElementSlots> = Symbol('element-slots')

function slotName(node: Node): OrdinarySlotName | undefined {
  const name = node.nodeType === 1 ? (node as Element).getAttribute('slot') : undefined
  return ORDINARY_SLOT_NAMES.find((candidate) => candidate === name)
}

/** Keep host-owned nodes and framework anchors separate from Vue's rendered tree. */
class ElementSlots {
  readonly names = shallowRef<OrdinarySlotName[]>([])
  readonly version = shallowRef(0)
  readonly nodes = new Map<Node, Comment>()
  readonly parked = document.createDocumentFragment()
  readonly observer = new MutationObserver((mutations) => this.sync(mutations))
  mounted = false

  constructor(readonly host: HTMLElement) {}

  collect(node: Node) {
    if (![1, 3].includes(node.nodeType) || this.nodes.has(node)) return
    const anchor = document.createComment('slot content')
    HTMLElement.prototype.insertBefore.call(this.host, anchor, node)
    this.nodes.set(node, anchor)
    this.parked.append(node)
  }

  sync(mutations: MutationRecord[] = []) {
    let changed = mutations.some((mutation) => mutation.type === 'attributes' && this.nodes.has(mutation.target))
    for (const node of Array.from(this.host.childNodes)) {
      if (node.nodeType !== 1 || !(node as Element).hasAttribute('slot')) continue
      const anchor = this.nodes.get(node)
      if (anchor) {
        HTMLElement.prototype.insertBefore.call(this.host, anchor, node)
        this.parked.append(node)
      } else this.collect(node)
      changed = true
    }
    for (const [node, anchor] of this.nodes) {
      if (!this.host.contains(node) && !this.parked.contains(node)) {
        anchor.remove()
        this.nodes.delete(node)
        changed = true
      }
    }
    const names = ORDINARY_SLOT_NAMES.filter((name) =>
      Array.from(this.nodes.keys()).some((node) => slotName(node) === name),
    )
    if (names.join() !== this.names.value.join()) {
      this.names.value = names
      changed = true
    }
    // Attribute changes can move an existing node between outlets without changing the name set.
    if (changed) this.version.value++
  }

  observe() {
    this.observer.observe(this.host, { childList: true, subtree: true, attributes: true, attributeFilter: ['slot'] })
    this.observer.observe(this.parked, { childList: true, subtree: true, attributes: true, attributeFilter: ['slot'] })
  }
}

/** Adapt light DOM projection without changing the original Vue components. */
export function withOrdinaryElementSlots(Element: new () => VueElement): new () => VueElement {
  return class extends Element {
    connectedCallback() {
      // Frameworks can connect the parent before creating its template children.
      queueMicrotask(() => {
        if (!this.isConnected) return
        let state = states.get(this)
        if (!state) {
          state = new ElementSlots(this)
          states.set(this, state)
        }
        state.observer.disconnect()
        if (!state.mounted) {
          for (const node of Array.from(this.childNodes)) state.collect(node)
        }
        state.sync()
        const source = document.createDocumentFragment()
        if (!state.mounted) {
          // Vue's light DOM parser and mount clear their container. Preserve host anchors.
          source.append(...Array.from(this.childNodes))
        }
        super.connectedCallback()
        this.append(source)
        state.observe()
      })
    }

    disconnectedCallback() {
      states.get(this)?.observer.disconnect()
      super.disconnectedCallback()
    }

    removeChild<T extends Node>(node: T): T {
      // React removes top-level JSX children through their original host parent.
      if (states.get(this)?.nodes.has(node) && node.parentNode && node.parentNode !== this) {
        return node.parentNode.removeChild(node)
      }
      return super.removeChild(node)
    }

    insertBefore<T extends Node>(node: T, child: Node | null): T {
      const anchor = child && states.get(this)?.nodes.get(child)
      return super.insertBefore(node, anchor?.parentNode === this ? anchor : child)
    }
  }
}

export function useOrdinaryElementSlots() {
  const host = useHost()
  const state = host && states.get(host)
  if (!state) return shallowRef<OrdinarySlotName[]>([])
  state.mounted = true
  provide(slotsKey, state)
  onBeforeUnmount(() => {
    state.mounted = false
  })
  return state.names
}

/** Vue owns the outlet; the host framework continues to own its projected DOM. */
export const ElementSlot = defineComponent({
  props: { name: { type: String, required: true } },
  setup(props) {
    const state = inject(slotsKey)!
    const outlet = shallowRef<HTMLElement>()
    const nodes = computed(() => {
      void state.version.value
      return Array.from(state.nodes)
        .filter(([node]) => slotName(node) === props.name)
        .sort(([, a], [, b]) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
        .map(([node]) => node)
    })
    watchEffect(
      () => {
        if (outlet.value) {
          const current = nodes.value
          for (const node of Array.from(outlet.value.childNodes)) {
            if (!current.includes(node)) state.parked.append(node)
          }
          for (const node of current) outlet.value.append(node)
        }
      },
      { flush: 'post' },
    )
    onBeforeUnmount(() => {
      for (const node of state.nodes.keys()) {
        if (node.parentNode === outlet.value) state.parked.append(node)
      }
    })
    return () => h('div', { ref: outlet, style: 'display: contents' })
  },
})
