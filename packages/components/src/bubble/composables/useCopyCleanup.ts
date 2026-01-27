import { watch, type Ref } from 'vue'

/**
 * 设置复制事件处理器，清理复制文本中的多余换行
 * @param elementRef - 需要处理复制事件的元素引用
 */
export function useCopyCleanup(elementRef: Ref<HTMLElement | null>) {
  watch(
    elementRef,
    (elem, _prev, onCleanup) => {
      if (!elem) return

      // 添加复制事件监听器
      const handler = (e: ClipboardEvent) => {
        // 获取用户选中的内容
        const selection = window.getSelection()
        // 判断选区是否在当前元素内
        if (!elem.contains(selection?.anchorNode || null)) return

        e.preventDefault()
        // 将选中的文本处理一下，去掉多余换行
        const cleaned = selection?.toString().replace(/\n{2,}/g, '\n') || ''
        // 写入剪贴板
        e.clipboardData?.setData('text/plain', cleaned)
      }
      elem.addEventListener('copy', handler)
      // 使用 onCleanup 在元素变化或 watcher 停止时移除事件监听器
      onCleanup(() => elem.removeEventListener('copy', handler))
    },
    { immediate: true, flush: 'post' },
  )
}
