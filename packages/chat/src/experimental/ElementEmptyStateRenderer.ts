import { computed, defineComponent, h, shallowRef, Teleport, watch, watchEffect, type PropType } from 'vue'
import ElementRenderer from './ElementRenderer'
import type { ChatEmptyStateSlotProps } from '../types'
import type { ChatEmptyStateRendererContext, ChatRenderer } from './elementRenderers'

const sameItems = (a: readonly unknown[] | undefined, b: readonly unknown[] | undefined) =>
  a === b || Boolean(a && b && a.length === b.length && a.every((item, i) => item === b[i]))
const sameRecord = (a: object | undefined, b: object | undefined) =>
  a === b ||
  Boolean(
    a &&
    b &&
    Object.keys(a).length === Object.keys(b).length &&
    Object.keys(a).every((key) => {
      const left = Reflect.get(a, key)
      const right = Reflect.get(b, key)
      return Object.is(left, right) || (Array.isArray(left) && Array.isArray(right) && sameItems(left, right))
    }),
  )
function sameContext(a: object, b: object) {
  const left = a as ChatEmptyStateSlotProps
  const right = b as ChatEmptyStateSlotProps
  return (
    sameItems(left.messages, right.messages) &&
    sameRecord(left.conversation, right.conversation) &&
    sameRecord(left.request, right.request)
  )
}

export default defineComponent({
  props: {
    renderer: { type: Function as PropType<ChatRenderer<ChatEmptyStateRendererContext>>, required: true },
    context: { type: Object as PropType<ChatEmptyStateSlotProps>, required: true },
  },
  emits: ['error'],
  setup(props, { emit }) {
    const composerAvailable = shallowRef(false)
    watchEffect(() => {
      composerAvailable.value = Boolean(props.context.renderComposer())
    })
    const container = shallowRef<HTMLElement>()
    const requestedTarget = shallowRef<HTMLElement | null>(null)
    const target = shallowRef<HTMLElement | null>(null)
    watch(
      () => [container.value, requestedTarget.value] as const,
      ([root, requested], _, onCleanup) => {
        if (!root || !requested) return
        const sync = () => {
          target.value = root.contains(requested) ? requested : null
        }
        const observer = new MutationObserver(sync)
        observer.observe(root, { childList: true, subtree: true })
        sync()
        onCleanup(() => observer.disconnect())
      },
      { flush: 'post' },
    )
    const invocation = shallowRef<symbol>()
    const renderer = computed<ChatRenderer<ChatEmptyStateSlotProps>>(() => {
      const render = props.renderer
      const canCompose = composerAvailable.value
      return (context, lifecycle) => {
        let requested: HTMLElement | null = null
        let rendering = true
        lifecycle.signal.addEventListener(
          'abort',
          () => {
            requestedTarget.value = null
            target.value = null
          },
          { once: true },
        )
        try {
          const result = render(
            {
              ...context,
              renderComposer() {
                if (!rendering || lifecycle.signal.aborted || !canCompose) return null
                requested ??= document.createElement('div')
                return requested
              },
            },
            lifecycle,
          )
          requestedTarget.value = requested
          invocation.value = Symbol('empty-state-renderer')
          return result
        } finally {
          rendering = false
        }
      }
    })
    return () =>
      h('div', { ref: container, style: 'display: contents' }, [
        h(ElementRenderer, {
          name: 'layout-empty-state',
          context: props.context,
          sameContext,
          renderer: renderer.value,
          onError: (error) => emit('error', error),
        }),
        target.value
          ? h(Teleport, { to: target.value, key: invocation.value }, [props.context.renderComposer()])
          : null,
      ])
  },
})
