<script lang="ts">
import { Comment, Fragment, Text, defineComponent, h, isVNode, type VNodeChild } from 'vue'

function hasContent(node: VNodeChild): boolean {
  if (Array.isArray(node)) return node.some(hasContent)
  if (node == null || typeof node === 'boolean') return false
  if (!isVNode(node)) return String(node).trim().length > 0
  if (node.type === Comment) return false
  if (node.type === Fragment) return hasContent(node.children as VNodeChild)
  if (node.type === Text) return String(node.children ?? '').trim().length > 0
  return true
}

export default defineComponent({
  name: 'SenderHeader',
  setup(_, { slots }) {
    return () => {
      // Resolve once inside render so slot dependencies remain tracked without recreating its children.
      const children = slots.default?.()
      return hasContent(children) ? h('div', { class: 'tr-sender-header' }, children) : null
    }
  },
})
</script>
