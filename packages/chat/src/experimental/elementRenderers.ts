import { defineComponent, h, onBeforeUnmount, onMounted, onUpdated, ref, type PropType } from 'vue'
import { createRendererHost, type ExperimentalRenderer } from './renderers'

export const RendererOutlet = defineComponent({
  name: 'ExperimentalRendererOutlet',
  props: {
    renderer: {
      type: Function as PropType<ExperimentalRenderer<never>>,
      required: true,
    },
    context: {
      type: Object as PropType<object>,
      required: true,
    },
  },
  setup(props) {
    const container = ref<HTMLElement>()
    let rendererHost: ReturnType<typeof createRendererHost> | undefined

    function render() {
      if (!container.value) return
      rendererHost ??= createRendererHost(container.value)
      rendererHost.render(props.renderer as ExperimentalRenderer<unknown>, props.context)
    }

    onMounted(render)
    onUpdated(render)
    onBeforeUnmount(() => rendererHost?.dispose())

    return () => h('span', { ref: container, style: 'display: contents', 'data-tr-chat-renderer': '' })
  },
})
