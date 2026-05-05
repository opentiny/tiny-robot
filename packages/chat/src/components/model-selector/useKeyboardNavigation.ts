import { ref, type Ref } from 'vue'
import { useMagicKeys, onKeyStroke, whenever } from '@vueuse/core'

export interface UseKeyboardNavigationOptions {
  /**
   * 是否启用键盘导航
   */
  enabled?: Ref<boolean> | boolean
  /**
   * 项目数量
   */
  itemCount: Ref<number> | number
  /**
   * 是否禁用某个项目
   */
  isItemDisabled?: (index: number) => boolean
  /**
   * 选择某个项目后的回调
   */
  onSelect?: (index: number) => void
  /**
   * 关闭列表时的回调
   */
  onClose?: () => void
  /**
   * 是否可以循环导航
   */
  loop?: boolean
}

export interface UseKeyboardNavigationReturn {
  /**
   * 当前高亮索引
   */
  highlightedIndex: Ref<number>
  /**
   * 重置高亮
   */
  reset: () => void
  /**
   * 设置高亮索引
   */
  setHighlightedIndex: (index: number) => void
}

export function useKeyboardNavigation(options: UseKeyboardNavigationOptions): UseKeyboardNavigationReturn {
  const { enabled = true, itemCount, isItemDisabled, onSelect, onClose, loop = false } = options

  const highlightedIndex = ref(0)
  const { ArrowUp, ArrowDown } = useMagicKeys()

  const isEnabled = () => {
    if (typeof enabled === 'boolean') return enabled
    return enabled.value
  }

  const getItemCount = () => {
    if (typeof itemCount === 'number') return itemCount
    return itemCount.value
  }

  const reset = () => {
    highlightedIndex.value = 0
  }

  const setHighlightedIndex = (index: number) => {
    const count = getItemCount()
    if (count <= 0) {
      highlightedIndex.value = 0
      return
    }
    highlightedIndex.value = Math.max(0, Math.min(index, count - 1))
  }

  const switchHighlightedIndex = (isNext: boolean) => {
    const count = getItemCount()
    if (count <= 0) return

    let target = highlightedIndex.value
    do {
      if (isNext) {
        target = loop ? (target + 1) % count : Math.min(target + 1, count - 1)
      } else {
        target = loop ? (target - 1 + count) % count : Math.max(target - 1, 0)
      }
    } while (isItemDisabled?.(target) && target !== highlightedIndex.value)
    highlightedIndex.value = target
  }

  whenever(
    () => ArrowUp.value && isEnabled(),
    () => {
      switchHighlightedIndex(false)
    },
  )

  whenever(
    () => ArrowDown.value && isEnabled(),
    () => {
      switchHighlightedIndex(true)
    },
  )

  onKeyStroke('Enter', (event) => {
    if (!isEnabled()) return

    const count = getItemCount()
    if (count > 0 && highlightedIndex.value < count) {
      event.preventDefault()
      onSelect?.(highlightedIndex.value)
    }
  })

  onKeyStroke('Escape', (event) => {
    if (!isEnabled()) return

    event.preventDefault()
    onClose?.()
  })

  return {
    highlightedIndex,
    reset,
    setHighlightedIndex,
  }
}
