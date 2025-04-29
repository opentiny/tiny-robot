import { ref, Ref, watch } from 'vue'
import type { SuggestionItem } from '../index.type'

export interface KeyboardNavigationOptions {
  onSelect?: (item: SuggestionItem) => void
  onClose?: () => void
  initialIndex?: number
}

/**
 * 处理指令列表的键盘导航
 * @param items 当前可见的指令项列表
 * @param options 配置选项
 */
export function useKeyboardNavigation(items: Ref<SuggestionItem[]>, options: KeyboardNavigationOptions = {}) {
  const activeIndex = ref(options.initialIndex || -1)

  // 当列表变化时重置激活项
  watch(items, (newItems) => {
    if (newItems.length > 0 && activeIndex.value === -1) {
      activeIndex.value = 0
    } else if (newItems.length === 0) {
      activeIndex.value = -1
    } else if (activeIndex.value >= newItems.length) {
      activeIndex.value = newItems.length - 1
    }
  })

  /**
   * 处理键盘按键
   * @param e 键盘事件
   */
  const handleKeyDown = (e: KeyboardEvent) => {
    if (items.value.length === 0) return

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        activeIndex.value = (activeIndex.value - 1 + items.value.length) % items.value.length
        scrollToActive()
        break

      case 'ArrowDown':
        e.preventDefault()
        activeIndex.value = (activeIndex.value + 1) % items.value.length
        scrollToActive()
        break

      case 'Enter':

      case 'Tab':
        e.preventDefault()
        if (activeIndex.value >= 0 && activeIndex.value < items.value.length) {
          options.onSelect?.(items.value[activeIndex.value])
        }
        break

      case 'Escape':
        e.preventDefault()
        options.onClose?.()
        break
    }
  }

  /**
   * 滚动到当前激活项
   */
  const scrollToActive = () => {
    setTimeout(() => {
      const activeElement = document.querySelector(`.tr-suggestion-list-item:nth-child(${activeIndex.value + 1})`)
      const container = activeElement?.closest('.tr-suggestion-content')

      if (activeElement && container) {
        const containerRect = container.getBoundingClientRect()
        const itemRect = activeElement.getBoundingClientRect()

        if (itemRect.bottom > containerRect.bottom) {
          container.scrollTop += itemRect.bottom - containerRect.bottom
        } else if (itemRect.top < containerRect.top) {
          container.scrollTop -= containerRect.top - itemRect.top
        }
      }
    }, 0)
  }

  /**
   * 设置激活项索引
   */
  const setActiveIndex = (index: number) => {
    if (index >= -1 && index < items.value.length) {
      activeIndex.value = index
    }
  }

  return {
    activeIndex,
    handleKeyDown,
    scrollToActive,
    setActiveIndex,
  }
}
