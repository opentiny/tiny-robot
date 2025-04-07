import { AIModelConfig, ChatCompletionRequest, ChatCompletionResponse, StreamHandler } from '../types'

/**
 * 模型Provider基类
 */
export abstract class BaseModelProvider {
  protected config: AIModelConfig

  /**
   * @param config AI模型配置
   */
  constructor(config: AIModelConfig) {
    this.config = config
  }

  /**
   * 发送聊天请求并获取响应
   * @param request 聊天请求参数
   * @returns 聊天响应
   */
  abstract chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse>

  /**
   * 发送流式聊天请求并通过处理器处理响应
   * @param request 聊天请求参数
   * @param handler 流式响应处理器
   */
  abstract chatStream(request: ChatCompletionRequest, handler: StreamHandler): Promise<void>

  /**
   * 更新配置
   * @param config 新的AI模型配置
   */
  updateConfig(config: AIModelConfig): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 获取当前配置
   * @returns AI模型配置
   */
  getConfig(): AIModelConfig {
    return { ...this.config }
  }

  /**
   * 验证请求参数
   * @param request 聊天请求参数
   */
  protected validateRequest(request: ChatCompletionRequest): void {
    if (!request.messages || !Array.isArray(request.messages) || request.messages.length === 0) {
      throw new Error('请求必须包含至少一条消息')
    }

    // 验证每条消息的格式
    for (const message of request.messages) {
      if (!message.role || !message.content) {
        throw new Error('每条消息必须包含角色和内容')
      }
    }
  }
}
