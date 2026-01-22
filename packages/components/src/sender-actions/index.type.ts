/**
 * Sender Actions 类型导出
 */

// 导出共享类型
export type { TooltipPlacement, TooltipContent, ActionButtonProps } from './types/common'

// 导出组件特有类型
export type { UploadButtonProps, UploadButtonEmits } from './upload-button/index.type'
export type { VoiceButtonProps, VoiceButtonEmits } from './voice-button/index.type'
export type {
  SpeechConfig,
  SpeechHandler,
  SpeechState,
  SpeechCallbacks,
  SpeechHookOptions,
  SpeechHandlerResult,
} from './voice-button/speech.types'
