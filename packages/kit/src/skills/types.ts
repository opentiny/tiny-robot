import type { ChatCompletionFunctionTool } from 'openai/resources'
import type { MaybePromise } from '../types'
import type { BasePluginContext } from '../message/types'

export type SkillFileKind = 'text' | 'binary'

/**
 * Skill 文件的公共数据模型。
 *
 * 同时支持 browser (File API / showDirectoryPicker) 和 Node.js (fs) 两种环境。
 */
export interface BaseSkillFile {
  /**
   * 基于 skill 根目录的相对路径。必须使用 / 分隔，不能以 / 开头，不能包含 ..。
   */
  path: string
  /**
   * MIME 类型。
   */
  mimeType?: string
  /**
   * 文件大小（字节）。
   */
  size?: number
  /**
   * 最后修改时间（时间戳）。
   */
  lastModified?: number
  /**
   * 文件元数据。可放来源、优先级、版本号等业务字段。
   */
  metadata?: Record<string, unknown>
}

export interface TextSkillFile extends BaseSkillFile {
  kind: 'text'
  content: string
}

export interface BinarySkillFile extends BaseSkillFile {
  kind: 'binary'
  content: ArrayBuffer | Uint8Array
}

export type SkillFile = TextSkillFile | BinarySkillFile

export type SkillFileResource = SkillFile & {
  /**
   * 文件唯一标识。在同一个 skill 内应保持唯一，默认使用 path。
   */
  id: string
}

/**
 * 单个 Skill 的运行时上下文。
 *
 * 用于动态生成 instructions、tools，或在回调中读取当前 turn 的 skill 列表。
 */
export interface SkillRuntimeContext extends BasePluginContext {
  /**
   * 当前正在处理的 skill。
   */
  skill: SkillDefinition
  /**
   * 当前 turn 的全部 skills。
   */
  skills: SkillDefinition[]
}

/**
 * Skill 定义。
 *
 * Skill 是一组提示词、工具和文件上下文的能力包。它最终通常会被编译为：
 * - system/developer prompt
 * - requestBody.tools
 * - 可按需读取的文件上下文
 */
export interface SkillDefinition {
  /**
   * Skill 唯一名称。用于去重、调试和持久化。
   */
  name: string
  /**
   * Skill 能力描述。可用于自动匹配，也可作为模型选择 skill 时的说明。
   */
  description: string
  /**
   * 注入给模型的 skill 指令。
   */
  instructions?: string | ((context: SkillRuntimeContext) => MaybePromise<string>)
  /**
   * Skill 暴露的工具列表。
   */
  tools?: ChatCompletionFunctionTool[] | ((context: SkillRuntimeContext) => MaybePromise<ChatCompletionFunctionTool[]>)
  /**
   * Skill 目录下除入口文件和工具配置外的文件数据。
   */
  files?: SkillFileResource[]
  /**
   * 业务侧自定义元数据。
   */
  metadata?: Record<string, unknown>
}
