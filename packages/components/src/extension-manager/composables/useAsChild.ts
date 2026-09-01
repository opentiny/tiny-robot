import type { VNode, VNodeProps } from 'vue'
import { cloneVNode, Comment, Fragment, isVNode, Suspense, Teleport, Text } from 'vue'

interface UseAsChildOptions<TSlotProps> {
  getSlot: () => ((props: TSlotProps) => VNode[]) | undefined
  componentName?: string
}

type AsChildInjectedProps = VNodeProps & Record<string, unknown>

const flattenAsChildVNodes = (nodes: VNode[]): VNode[] => {
  return nodes.flatMap((node) => {
    if (node.type === Comment) return []
    if (node.type === Text && typeof node.children === 'string' && node.children.trim() === '') return []
    if (node.type !== Fragment || !Array.isArray(node.children)) return [node]

    return flattenAsChildVNodes(node.children.filter(isVNode))
  })
}

const isSupportedAsChildVNode = (node: VNode) => {
  if (node.type === Teleport || node.type === Suspense) return false

  return typeof node.type === 'string' || typeof node.type === 'object' || typeof node.type === 'function'
}

export function useAsChild<TSlotProps>({ getSlot, componentName }: UseAsChildOptions<TSlotProps>) {
  const warningPrefix = componentName ? `[TinyRobot] ${componentName} with asChild` : '[TinyRobot] asChild'

  const renderAsChild = (slotProps: TSlotProps, injectedProps: AsChildInjectedProps = {}): VNode | null => {
    const children = flattenAsChildVNodes(getSlot()?.(slotProps) ?? [])

    if (children.length !== 1) {
      if (import.meta.env.DEV) {
        console.warn(`${warningPrefix} expects exactly one child, but received ${children.length}.`)
      }
      return null
    }

    if (!isSupportedAsChildVNode(children[0])) {
      if (import.meta.env.DEV) {
        console.warn(`${warningPrefix} received an unsupported child node.`)
      }
      return null
    }

    return cloneVNode(children[0], injectedProps, true)
  }

  return {
    renderAsChild,
  }
}
