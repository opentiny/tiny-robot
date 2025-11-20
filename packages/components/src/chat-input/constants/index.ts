/**
 * Chat-Input 组件常量定义
 */

import { DefaultConfig, InputMode, SubmitTrigger, ThemeType, CHAT_INPUT_CONTEXT_KEY } from '../index.type'

/**
 * 默认配置
 */
export const DEFAULT_CONFIG: DefaultConfig = {
  placeholder: '请输入内容...',
  mode: 'single' as InputMode,
  submitType: 'enter' as SubmitTrigger,
  theme: 'light' as ThemeType,
  autoSize: { minRows: 1, maxRows: 3 },
  suggestionPopupWidth: 400,
}

/**
 * 导出 Context Key (从 index.type.ts)
 */
export { CHAT_INPUT_CONTEXT_KEY }
