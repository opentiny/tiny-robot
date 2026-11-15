import {
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  Teleport,
  watch,
  type PropType,
  type VNode,
} from 'vue'
import type { ChatEmptyStateRendererContext, ChatRenderer, ChatUIData } from '../../types'
import { createChatRendererHost } from '../../renderers/domRenderer'
import { rendererRuntimeOwner } from './rendererRuntimeOwner'

type EmptyContext = Omit<ChatEmptyStateRendererContext, 'renderComposer'>
const sameItems = (left: readonly unknown[] | undefined, right: readonly unknown[] | undefined) =>
  left === right ||
  Boolean(left && right && left.length === right.length && left.every((item, index) => item === right[index]))

// Resolving UI labels produces fresh view objects. Unrelated composer options must not retire the welcome editor.
function sameContext(left: EmptyContext, right: EmptyContext) {
  return (
    sameItems(left.messages, right.messages) &&
    left.conversation.activeId === right.conversation.activeId &&
    left.conversation.title === right.conversation.title &&
    (left.conversation.items === right.conversation.items ||
      (!left.conversation.items?.length && !right.conversation.items?.length)) &&
    left.conversation.history === right.conversation.history &&
    (left.request === right.request ||
      Boolean(
        left.request &&
        right.request &&
        left.request.state === right.request.state &&
        left.request.processingState === right.request.processingState,
      ))
  )
}

export const ChatEmptyStateRendererOutlet = defineComponent({
  name: 'ChatEmptyStateRendererOutlet',
  props: {
    renderer: { type: Function as PropType<ChatRenderer<ChatEmptyStateRendererContext>>, required: true },
    context: { type: Object as PropType<EmptyContext>, required: true },
    sourceData: { type: Object as PropType<Readonly<ChatUIData>>, default: undefined },
    renderComposer: { type: Function as PropType<() => VNode | null>, required: true },
    senderVisible: { type: Boolean, required: true },
    onError: { type: Function as PropType<(error: unknown) => void>, required: true },
  },
  setup(props) {
    const runtimeOwner = inject(rendererRuntimeOwner, undefined)
    const container = shallowRef<HTMLElement>()
    const target = shallowRef<HTMLElement | null>(null)
    const invocation = shallowRef<symbol>()
    let rendererHost: ReturnType<typeof createChatRendererHost> | undefined

    function render() {
      if (!container.value) return
      rendererHost ??= createChatRendererHost(container.value, { onError: (error) => props.onError(error) })
      const runtime = runtimeOwner?.runtime.value
      let requested: HTMLElement | null = null
      let activeSignal: AbortSignal | undefined
      rendererHost.render((context, lifecycle) => {
        activeSignal = lifecycle.signal
        lifecycle.signal.addEventListener(
          'abort',
          () => {
            target.value = null
          },
          { once: true },
        )
        let rendering = true
        try {
          return props.renderer(
            {
              ...context,
              renderComposer: () => {
                if (
                  !rendering ||
                  lifecycle.signal.aborted ||
                  runtimeOwner?.runtime.value !== runtime ||
                  !props.senderVisible
                )
                  return null
                requested ??= document.createElement('div')
                return requested
              },
            },
            lifecycle,
          )
        } finally {
          rendering = false
        }
      }, props.context)
      target.value = !activeSignal?.aborted && requested && container.value.contains(requested) ? requested : null
      invocation.value = Symbol('welcome-renderer')
    }

    onMounted(render)
    watch(
      () =>
        [
          props.renderer,
          props.context,
          props.senderVisible,
          runtimeOwner?.runtime.value,
          runtimeOwner?.data.value === props.sourceData ? undefined : props.sourceData,
        ] as const,
      (next, previous) => {
        if (
          next[0] === previous[0] &&
          next[2] === previous[2] &&
          next[3] === previous[3] &&
          next[4] === previous[4] &&
          sameContext(next[1], previous[1])
        )
          return
        render()
      },
      { flush: 'post' },
    )
    onBeforeUnmount(() => rendererHost?.dispose())

    return () => [
      h('span', { ref: container, style: 'display: contents', 'data-tr-chat-renderer': '' }),
      target.value ? h(Teleport, { to: target.value, key: invocation.value }, [props.renderComposer()]) : null,
    ]
  },
})
