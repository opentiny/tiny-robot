/**
 * 消息角色类型
 */
export type MessageRole = 'system' | 'user' | 'assistant'

interface TextInput {
  type: 'input_text'
  text: string
}

interface ImageInput {
  type: 'image_url'
  image_url: {
    /**
     * 图片base64数据或图片url
     * 需要注意，传入Base64，需要添加图像格式, data:image/${imageType};base64,${base64Image}, 例如：
     * PNG图像：  data:image/png;base64,${base64Image}
     * JPEG图像： data:image/jpeg;base64,${base64Image}
     * WEBP图像： data:image/webp;base64,${base64Image}
     */
    url: string // 图片base64数据或图片url
  }
  [extra: string]: unknown
}

interface FileInput {
  type: 'input_file'
  filename: string
  file_data: string // 文件base64数据
  [extra: string]: unknown
}

interface AudioInput {
  type: 'input_audio'
  input_audio: {
    /**
     * 音频base64数据或音频url
     * 例如：data:;base64,${base64Audio}
     */
    data: string
    format: string // 音频格式,如 'mp3'
  }
}

interface VideoInput {
  type: 'input_video'
  video_url: {
    /**
     * 视频base64数据或视频url
     * 例如：data:;base64,${base64Video}
     */
    url: string
  }
}

/**
 * 多模态消息内容
 */
type MediaContent = Array<TextInput | ImageInput | AudioInput | VideoInput | FileInput>

export type MessageContent = string | MediaContent

/**
 * 聊天消息接口
 */
export interface ChatMessage {
  role: MessageRole
  content: MessageContent
  name?: string
}

/**
 * 聊天历史记录
 */
export type ChatHistory = ChatMessage[]

/**
 * 聊天完成请求选项
 */
export interface ChatCompletionOptions {
  model?: string
  temperature?: number
  top_p?: number
  n?: number
  stream?: boolean
  max_tokens?: number
  signal?: AbortSignal
}

/**
 * 聊天完成请求参数
 */
export interface ChatCompletionRequest {
  messages: ChatMessage[]
  options?: ChatCompletionOptions
}

/**
 * 聊天完成响应消息
 */
export interface ChatCompletionResponseMessage {
  role: MessageRole
  content: string
}

/**
 * 聊天完成响应选择
 */
export interface ChatCompletionResponseChoice {
  index: number
  message: ChatCompletionResponseMessage
  finish_reason: string
}

/**
 * 聊天完成响应使用情况
 */
export interface ChatCompletionResponseUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

/**
 * 聊天完成响应
 */
export interface ChatCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: ChatCompletionResponseChoice[]
  usage: ChatCompletionResponseUsage
}

/**
 * 流式聊天完成响应增量
 */
export interface ChatCompletionStreamResponseDelta {
  content?: string
  role?: MessageRole
}

/**
 * 流式聊天完成响应选择
 */
export interface ChatCompletionStreamResponseChoice {
  index: number
  delta: ChatCompletionStreamResponseDelta
  finish_reason: string | null
}

/**
 * 流式聊天完成响应
 */
export interface ChatCompletionStreamResponse {
  id: string
  object: string
  created: number
  model: string
  choices: ChatCompletionStreamResponseChoice[]
}

/**
 * AI模型提供商类型
 */
export type AIProvider = 'openai' | 'deepseek' | 'custom'

/**
 * AI模型配置接口
 */
export interface AIModelConfig {
  provider: AIProvider
  apiKey?: string
  apiUrl?: string
  apiVersion?: string
  defaultModel?: string
  defaultOptions?: ChatCompletionOptions
}

/**
 * 错误类型
 */
export enum ErrorType {
  NETWORK_ERROR = 'network_error',
  AUTHENTICATION_ERROR = 'authentication_error',
  RATE_LIMIT_ERROR = 'rate_limit_error',
  SERVER_ERROR = 'server_error',
  MODEL_ERROR = 'model_error',
  TIMEOUT_ERROR = 'timeout_error',
  UNKNOWN_ERROR = 'unknown_error',
}

/**
 * AI适配器错误
 */
export interface AIAdapterError {
  type: ErrorType
  message: string
  statusCode?: number
  originalError?: object
}

/**
 * 流式响应事件类型
 */
export enum StreamEventType {
  DATA = 'data',
  ERROR = 'error',
  DONE = 'done',
}

/**
 * 流式响应处理器
 */
export interface StreamHandler {
  onData: (data: ChatCompletionStreamResponse) => void
  onError: (error: AIAdapterError) => void
  onDone: () => void
}
