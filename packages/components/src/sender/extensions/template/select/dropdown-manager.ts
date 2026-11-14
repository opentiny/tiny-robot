/**
 * 下拉菜单管理器（单例模式）
 */

// 全局状态：当前打开的下拉菜单 ID
let currentOpenDropdown: string | null = null

/**
 * 打开下拉菜单
 */
export function openDropdown(selectId: string): void {
  // 关闭之前打开的下拉菜单
  if (currentOpenDropdown && currentOpenDropdown !== selectId) {
    closeDropdown(currentOpenDropdown)
  }
  currentOpenDropdown = selectId
}

/**
 * 关闭下拉菜单
 */
export function closeDropdown(selectId: string): void {
  if (currentOpenDropdown === selectId) {
    currentOpenDropdown = null
  }
}

/**
 * 获取当前打开的下拉菜单 ID
 */
export function getCurrentOpenDropdown(): string | null {
  return currentOpenDropdown
}

/**
 * 关闭所有下拉菜单
 */
export function closeAllDropdowns(): void {
  currentOpenDropdown = null
}

/**
 * 设置点击外部关闭监听
 */
export function setupClickOutside(
  selectElement: HTMLElement,
  dropdownElement: HTMLElement,
  onClose: () => void,
): () => void {
  let disposed = false
  let listenerTimer: ReturnType<typeof setTimeout> | undefined

  const handleClickOutside = (event: MouseEvent) => {
    const eventPath = event.composedPath()
    const target = event.target as Node | null
    const clickedInside =
      eventPath.includes(selectElement) ||
      eventPath.includes(dropdownElement) ||
      Boolean(target && (selectElement.contains(target) || dropdownElement.contains(target)))

    if (!clickedInside) {
      onClose()
      document.removeEventListener('click', handleClickOutside)
    }
  }

  // 延迟添加监听器，避免立即触发
  listenerTimer = setTimeout(() => {
    listenerTimer = undefined
    if (disposed) return
    document.addEventListener('click', handleClickOutside)
  }, 0)

  // 返回清理函数
  return () => {
    disposed = true
    if (listenerTimer !== undefined) {
      clearTimeout(listenerTimer)
      listenerTimer = undefined
    }
    document.removeEventListener('click', handleClickOutside)
  }
}
