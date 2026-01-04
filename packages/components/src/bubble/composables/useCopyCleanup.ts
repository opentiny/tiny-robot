import { watch, type Ref, type WatchHandle } from 'vue'

/**
 * 设置复制事件处理器，清理复制文本中的多余换行
 * @param elementRef - 需要处理复制事件的元素引用
 */
export function useCopyCleanup(elementRef: Ref<HTMLElement | null>) {
  let stopWatch: WatchHandle | null = null

  stopWatch = watch(
    elementRef,
    (elem) => {
      // 清理之前的 watch 和事件监听器
      if (stopWatch) {
        stopWatch()
        stopWatch = null
      }

      if (!elem) return

      // 添加复制事件监听器
      elem.addEventListener('copy', (e) => {
        // 获取用户选中的内容
        const selection = window.getSelection()
        // 判断选区是否在当前元素内
        if (!elem.contains(selection?.anchorNode || null)) return

        e.preventDefault()
        // 将选中的文本处理一下，去掉多余换行
        const cleaned = selection?.toString().replace(/\n{2,}/g, '\n') || ''
        // 写入剪贴板
        e.clipboardData?.setData('text/plain', cleaned)
      })
    },
    { immediate: true, flush: 'post' },
  )
}
