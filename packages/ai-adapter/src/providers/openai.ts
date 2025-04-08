/**
 * OpenAI提供商
 * 用于与OpenAI API进行交互
 */

import { BaseModelProvider } from './base'
import type { AIModelConfig, ChatCompletionRequest, ChatCompletionResponse, StreamHandler } from '../types'
import { handleRequestError } from '../error'
import { handleSSEStream } from '../utils'

export class OpenAIProvider extends BaseModelProvider {
  private baseURL: string
  private apiKey: string
  private defaultModel: string = 'gpt-3.5-turbo'

  /**
   * @param config AI模型配置
   */
  constructor(config: AIModelConfig) {
    super(config)

    this.baseURL = config.apiUrl || 'https://api.openai.com/v1'
    this.apiKey = config.apiKey || ''

    // 设置默认模型
    if (config.defaultModel) {
      this.defaultModel = config.defaultModel
    }

    if (!this.apiKey) {
      console.warn('API key is not provided. Authentication will likely fail.')
    }
  }

  /**
   * 发送聊天请求并获取响应
   * @param request 聊天请求参数
   * @returns 聊天响应
   */
  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    try {
      this.validateRequest(request)

      const requestData = {
        model: request.options?.model || this.config.defaultModel || this.defaultModel,
        messages: request.messages,
        ...request.options,
        stream: false,
      }

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`)
      }

      return await response.json()
    } catch (error: unknown) {
      // 处理错误
      throw handleRequestError(error as { response: object })
    }
  }

  /**
   * 发送流式聊天请求并通过处理器处理响应
   * @param request 聊天请求参数
   * @param handler 流式响应处理器
   */
  async chatStream(request: ChatCompletionRequest, handler: StreamHandler): Promise<void> {
    try {
      // 验证请求参数
      this.validateRequest(request)

      const requestData = {
        model: request.options?.model || this.config.defaultModel || this.defaultModel,
        messages: request.messages,
        ...request.options,
        stream: true,
      }

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'text/event-stream',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`)
      }

      await handleSSEStream(response, handler)
    } catch (error: unknown) {
      handler.onError(handleRequestError(error as { response: object }))
    }
  }

  /**
   * 更新配置
   * @param config 新的AI模型配置
   */
  updateConfig(config: AIModelConfig): void {
    super.updateConfig(config)

    // 更新配置
    if (config.apiUrl) {
      this.baseURL = config.apiUrl
    }

    if (config.apiKey) {
      this.apiKey = config.apiKey
    }

    if (config.defaultModel) {
      this.defaultModel = config.defaultModel
    }
  }
}
