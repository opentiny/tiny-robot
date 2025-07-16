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

  // render Teleport
  nextTick(() => {
    container = document.createElement('div')
    vnode = h(TeleportWrapperComponent, { teleportProps: props, vnodeFactory: child })
    render(vnode, container)
  })

  onBeforeUnmount(() => {
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
