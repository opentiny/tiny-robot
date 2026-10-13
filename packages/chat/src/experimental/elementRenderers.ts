import { defineComponent, h, onBeforeUnmount, onMounted, onUpdated, ref, type PropType } from 'vue'
import { createRendererHost, type ExperimentalRenderer } from './renderers'

export const SCOPED_RENDERER_NAMES = [
  'layout-header',
  'layout-left-aside',
  'layout-left-aside-brand',
  'layout-left-aside-actions',
  'layout-left-aside-content',
  'layout-left-aside-footer',
  'layout-left-aside-rail',
  'layout-left-aside-history-item-prefix',
  'layout-right-aside',
  'layout-right-aside-title',
  'layout-right-aside-panel',
  'layout-main',
  'layout-empty-state',
  'layout-footer',
  'composer-before',
  'composer-after',
  'bubble-prefix',
  'bubble-suffix',
  'bubble-after',
  'bubble-content-footer',
] as const

export const STATIC_SLOT_NAMES = [
  'header-notice',
  'welcome-footer',
  'prompts-footer',
  'sender-header',
  'sender-footer',
  'sender-footer-right',
] as const

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
