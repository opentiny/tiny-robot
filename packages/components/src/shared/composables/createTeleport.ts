import {
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  render,
  Teleport,
  type TeleportProps,
  type VNode,
} from 'vue'

const TeleportWrapperComponent = defineComponent({
  setup: (props: { propsFactory: () => TeleportProps; vnodeFactory: () => VNode }) => {
    return () => {
      return h(Teleport, props.propsFactory(), props.vnodeFactory())
    }
  },
  props: ['propsFactory', 'vnodeFactory'],
})

export function createTeleport(props: () => TeleportProps, child: () => VNode) {
  let vnode: VNode | null = null
  let container: HTMLElement | null = null
  let isUnmounted = false

  onMounted(() => {
    // render Teleport
    nextTick(() => {
      if (isUnmounted) return
      container = document.createElement('div')
      vnode = h(TeleportWrapperComponent, { propsFactory: props, vnodeFactory: child })
      render(vnode, container)
    })
  })

  onBeforeUnmount(() => {
    isUnmounted = true
    nextTick(() => {
      if (container) {
        render(null, container)
        container.remove()
        vnode = null
        container = null
      }
    })
  })
}
