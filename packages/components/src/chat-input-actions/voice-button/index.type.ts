import type { VNode, Component } from 'vue'
import type { SpeechConfig } from './speech.types'
import type { TooltipPlacement } from '../action-button/index.type'
/**
 * VoiceButton 组件 Props
 */
export interface VoiceButtonProps {
  /**
   * 自定义图标
   */
  icon?: VNode | Component
  /**
   * 是否禁用(会与 Context 的 disabled 合并)
   */
  disabled?: boolean
  /**
   * 按钮尺寸
   */
  size?: 'small' | 'normal'
  /**
   * Tooltip 文本
   */
  tooltip?: string
  /**
   * Tooltip 位置
   */
  tooltipPlacement?: TooltipPlacement
  /**
   * 语音配置
   */
  speechConfig?: SpeechConfig
  /**
   * 是否自动插入识别结果到编辑器
   * @default true
   */
  autoInsert?: boolean
  /**
   * 按钮点击拦截器(用于自定义 UI)
   */
  onButtonClick?: (isRecording: boolean, preventDefault: () => void) => void | Promise<void>
}
/**
 * VoiceButton 组件 Emits
 */
export interface VoiceButtonEmits {
  (e: 'speech-start'): void
  (e: 'speech-interim', transcript: string): void
  (e: 'speech-final', transcript: string): void
  (e: 'speech-end', transcript?: string): void
  (e: 'speech-error', error: Error): void
}
