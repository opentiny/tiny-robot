import { defineComponent, h, onBeforeUnmount, onMounted, ref, watch, type PropType } from 'vue'
import { createChatRendererHost, type ChatRenderer, type ChatRendererHost } from '../../renderers/domRenderer'

export const ChatRendererOutlet = defineComponent({
  name: 'ChatRendererOutlet',
  props: {
    renderer: {
      type: Function as PropType<ChatRenderer<never>>,
      required: true,
    },
    context: {
      type: Object as PropType<object>,
      required: true,
    },
    onError: {
      type: Function as PropType<(error: unknown) => void>,
      default: undefined,
    },
  },
  setup(props) {
    const container = ref<HTMLElement>()
    let rendererHost: ChatRendererHost | undefined

    function render() {
      if (!container.value) return
      rendererHost ??= createChatRendererHost(container.value, {
        onError: (error) => props.onError?.(error),
      })
      rendererHost.render(props.renderer as ChatRenderer<unknown>, props.context)
    }

    onMounted(render)
    watch(() => [props.renderer, props.context], render, { flush: 'post' })
    onBeforeUnmount(() => rendererHost?.dispose())

    return () => h('span', { ref: container, style: 'display: contents', 'data-tr-chat-renderer': '' })
  },
})
