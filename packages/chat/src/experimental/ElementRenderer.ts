import { defineComponent, h, shallowRef, watch, watchPostEffect, type PropType } from 'vue'
import { useElementRendererOwner } from './elementRendererHost'
import type { ChatRenderer, ChatRendererError, ChatRendererResult } from './elementRenderers'

export function nodesFor(result: ChatRendererResult): readonly Node[] {
  if (result === null) return []
  if (typeof result === 'string') return [document.createTextNode(result)]
  const nodes: readonly Node[] = Array.isArray(result) ? result : [result as Node]
  for (const node of nodes) {
    if (!node || typeof node !== 'object' || !('nodeType' in node)) {
      throw new TypeError('Renderer 必须返回 DOM 节点、节点数组、文字或 null')
    }
  }
  return nodes
}

/** One invocation owns its DOM and signal until its context, callback or outlet changes. */
export default defineComponent({
  props: {
    name: { type: String as PropType<ChatRendererError['name']>, required: true },
    context: { type: Object as PropType<object>, required: true },
    renderer: { type: Function as PropType<ChatRenderer<never>>, required: true },
    sameContext: Function as PropType<(left: object, right: object) => boolean>,
  },
  emits: ['error'],
  setup(props, { emit }) {
    const owner = useElementRendererOwner()
    const outlet = shallowRef<HTMLElement>()
    const currentContext = shallowRef(props.context)
    watch(
      () => props.context,
      (next) => {
        const previous = currentContext.value
        const keys = Object.keys(next)
        const same = props.sameContext
          ? props.sameContext(previous, next)
          : keys.length === Object.keys(previous).length &&
            keys.every((key) => Object.is(Reflect.get(next, key), Reflect.get(previous, key)))
        if (!same) {
          currentContext.value = next
        }
      },
    )
    watchPostEffect((onCleanup) => {
      const root = outlet.value
      if (!root) return
      const runtime = owner()
      const controller = new AbortController()
      onCleanup(() => {
        controller.abort()
        root.replaceChildren()
      })
      const source = currentContext.value
      const context = { ...source }
      for (const [name, value] of Object.entries(context)) {
        if (typeof value === 'function') {
          Reflect.set(context, name, (...args: unknown[]) => {
            const active = () => !controller.signal.aborted && owner() === runtime
            if (!active()) return name === 'focus' ? Promise.resolve(false) : undefined
            const result = Reflect.apply(value, source, args)
            return result instanceof Promise
              ? result.then((value) => (active() ? value : name === 'focus' ? false : undefined))
              : result
          })
        }
      }
      try {
        root.replaceChildren(...nodesFor(props.renderer(context as never, { signal: controller.signal })))
      } catch (error) {
        controller.abort()
        root.replaceChildren()
        emit('error', { name: props.name, error } satisfies ChatRendererError)
      }
    })
    return () => h('div', { ref: outlet, style: 'display: contents' })
  },
})
