/**
 * 测量元素文本宽度
 * @param text 要测量的文本
 * @param className 应用的样式类名
 * @returns 测量后的宽度
 */
export function measureTextWidth(text: string, className: string = ''): number {
  // 创建临时元素
  const temp = document.createElement('div')
  if (className) {
    temp.className = className
  }

  // 设置样式确保准确测量
  temp.style.visibility = 'hidden'
  temp.style.position = 'absolute'
  temp.style.whiteSpace = 'nowrap'
  temp.textContent = text

  // 添加到DOM并测量
  document.body.appendChild(temp)
  const width = temp.offsetWidth
  document.body.removeChild(temp)

  return width
}

/**
 * 确保元素在容器中可见
 * @param container 容器元素
 * @param element 需要显示的元素
 */
export function ensureElementVisible(container: HTMLElement, element: HTMLElement): void {
  const containerRect = container.getBoundingClientRect()
  const elementRect = element.getBoundingClientRect()

  if (elementRect.bottom > containerRect.bottom) {
    // 元素底部超出容器
    container.scrollTop += elementRect.bottom - containerRect.bottom
  } else if (elementRect.top < containerRect.top) {
    // 元素顶部超出容器
    container.scrollTop -= containerRect.top - elementRect.top
  }
}

// 文本宽度缓存
const widthCache = new Map<string, number>()

/**
 * 带缓存的文本宽度测量
 * @param text 要测量的文本
 * @param className 样式类名
 * @returns 测量后的宽度
 */
export function getCachedTextWidth(text: string, className: string = ''): number {
  const key = `${text}::${className}`

  if (widthCache.has(key)) {
    return widthCache.get(key)!
  }

  const width = measureTextWidth(text, className)
  widthCache.set(key, width)

  return width
}
