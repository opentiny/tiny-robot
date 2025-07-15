import { defineComponent, h, onBeforeUnmount, render, Teleport, type TeleportProps, type VNode } from 'vue'

export function createTeleport(propsFactory: () => TeleportProps, vnodeFactory: () => VNode) {
  const component = defineComponent(() => {
    return () => h(Teleport, propsFactory(), vnodeFactory())
  })

  let vnode: VNode | null = null
  let container: HTMLElement | null = null

  // render Teleport
  container = document.createElement('div')
  vnode = h(component)
  render(vnode, container)

  onBeforeUnmount(() => {
    if (container) {
      render(null, container)
      container.remove()
      vnode = null
      container = null
    }
  })
}
