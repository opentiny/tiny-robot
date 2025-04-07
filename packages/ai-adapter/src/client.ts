/**
 * AI客户端类
 * 负责根据配置选择合适的提供商并处理请求
 */

import type { AIModelConfig, ChatCompletionRequest, ChatCompletionResponse, StreamHandler } from './types'
import type { BaseModelProvider } from './providers/base'
import { OpenAIProvider } from './providers/openai'

/**
 * AI客户端类
 */
export class AIClient {
  private provider: BaseModelProvider
  private config: AIModelConfig

  /**
   * 构造函数
   * @param config AI模型配置
   */
  constructor(config: AIModelConfig) {
    this.config = config
    this.provider = this.createProvider(config)
  }

  /**
   * 创建提供商实例
   * @param config AI模型配置
   * @returns 提供商实例
   */
  private createProvider(config: AIModelConfig): BaseModelProvider {
    // 如果提供了自定义提供商实现，直接使用
    if (config.provider === 'custom' && 'providerImplementation' in config) {
      return (config as { providerImplementation: BaseModelProvider }).providerImplementation
    }

    // 根据提供商类型创建对应的提供商实例
    switch (config.provider) {
      case 'deepseek':
        const defaultConfig = {
          defaultModel: 'deepseek-chat',
          apiUrl: 'https://api.deepseek.com/v1',
        }
        return new OpenAIProvider({ ...defaultConfig, ...config })
      case 'openai':
      default:
        return new OpenAIProvider(config)
    }
  }

  /**
   * 发送聊天请求并获取响应
   * @param request 聊天请求参数
   * @returns 聊天响应
   */
  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    return this.provider.chat(request)
  }

  /**
   * 发送流式聊天请求并通过处理器处理响应
   * @param request 聊天请求参数
   * @param handler 流式响应处理器
   */
  async chatStream(request: ChatCompletionRequest, handler: StreamHandler): Promise<void> {
    // 确保请求中启用了流式响应
    const streamRequest = {
      ...request,
      options: {
        ...request.options,
        stream: true,
      },
    }

    return this.provider.chatStream(streamRequest, handler)
  }

  /**
   * 获取当前配置
   * @returns AI模型配置
   */
  getConfig(): AIModelConfig {
    return { ...this.config }
  }

  /**
   * 更新配置
   * @param config 新的AI模型配置
   */
  updateConfig(config: Partial<AIModelConfig>): void {
    this.config = { ...this.config, ...config }

    // 如果提供商类型发生变化，重新创建提供商实例
    if (config.provider && config.provider !== this.config.provider) {
      this.provider = this.createProvider(this.config)
    } else {
      // 否则只更新提供商配置
      this.provider.updateConfig(this.config)
    }
  }
}
