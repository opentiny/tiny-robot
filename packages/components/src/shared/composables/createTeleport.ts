import { defineComponent, h, nextTick, onBeforeUnmount, render, Teleport, type TeleportProps, type VNode } from 'vue'

const TeleportWrapperComponent = defineComponent({
  setup: (props: { teleportProps: TeleportProps; vnodeFactory: () => VNode }) => {
    return () => h(Teleport, props.teleportProps, props.vnodeFactory())
  },
  props: ['teleportProps', 'vnodeFactory'],
})

export function createTeleport(props: TeleportProps, child: () => VNode) {
  let vnode: VNode | null = null
  let container: HTMLElement | null = null
  let isUnmounted = false

  // render Teleport
  nextTick(() => {
    if (isUnmounted) return
    container = document.createElement('div')
    vnode = h(TeleportWrapperComponent, { teleportProps: props, vnodeFactory: child })
    render(vnode, container)
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
