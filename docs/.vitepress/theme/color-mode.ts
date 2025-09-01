// 类似 BehaviorSubject 的事件管理器
export class ColorModeSubject {
  private currentValue: 'light' | 'dark'
  private subscribers: Set<(value: 'light' | 'dark') => void> = new Set()

  constructor(initialValue: 'light' | 'dark') {
    this.currentValue = initialValue
  }

  // 订阅事件，立即返回当前值
  subscribe(callback: (value: 'light' | 'dark') => void): () => void {
    // 立即执行回调，返回当前值
    callback(this.currentValue)

    // 添加到订阅者列表
    this.subscribers.add(callback)

    // 返回取消订阅函数
    return () => {
      this.subscribers.delete(callback)
    }
  }

  // 发出新值
  emit(value: 'light' | 'dark') {
    this.currentValue = value
    // 通知所有订阅者
    this.subscribers.forEach((callback) => callback(value))
  }

  // 获取当前值
  getValue(): 'light' | 'dark' {
    return this.currentValue
  }

  // 获取订阅者数量
  getSubscriberCount(): number {
    return this.subscribers.size
  }
}

// 全局的暗黑模式主题管理器
export const colorModeSubject = new ColorModeSubject('light')

// 处理暗黑模式变化的函数
function handleDarkModeChange(isDark: boolean) {
  // 通过 ColorModeSubject 发出新值
  colorModeSubject.emit(isDark ? 'dark' : 'light')
}

// 确保只注册一个监听器
let darkModeCleanup: (() => void) | undefined

// 监听暗黑模式变化的函数
export function setupDarkModeListener() {
  if (typeof window === 'undefined') return

  if (darkModeCleanup) return darkModeCleanup

  // 获取 HTML 元素
  const htmlElement = document.documentElement

  // 检查初始状态
  const isDarkMode = htmlElement.classList.contains('dark')

  // 发出初始值
  handleDarkModeChange(isDarkMode)

  // 创建 MutationObserver 来监听 class 变化
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const target = mutation.target as HTMLElement
        const isDark = target.classList.contains('dark')

        handleDarkModeChange(isDark)
      }
    })
  })

  // 开始监听 HTML 元素的 class 属性变化
  observer.observe(htmlElement, {
    attributes: true,
    attributeFilter: ['class'],
  })

  darkModeCleanup = () => {
    observer.disconnect()
    darkModeCleanup = undefined
  }

  return darkModeCleanup
}
