import type { SuggestionProps } from '../index.type'

/**
 * 使用hook处理快捷键触发和命令过滤逻辑
 */
export const useTriggerDetection = (props: SuggestionProps) => {
  /**
   * 检测是否为触发快捷键
   * @param char 当前字符
   * @returns 是否为触发字符
   */
  const isTriggerKey = (char: string) => {
    return props.triggerKeys!.includes(char)
  }

  /**
   * 处理输入事件，检测触发条件
   * @param event 输入事件
   * @param text 当前输入文本
   * @returns 触发信息
   */
  const detectTrigger = (event: Event, text: string) => {
    const input = event.target as HTMLInputElement
    const cursorPos = input.selectionStart || 0

    // 检测是否输入了触发字符
    if (
      cursorPos > 0 &&
      isTriggerKey(text[cursorPos - 1]) &&
      (cursorPos === 1 || text[cursorPos - 2] === ' ' || text[cursorPos - 2] === '\n')
    ) {
      // 设置触发信息
      return {
        text: text[cursorPos - 1],
        position: cursorPos - 1,
      }
    }

    return null
  }

  return {
    isTriggerKey,
    detectTrigger,
  }
}
