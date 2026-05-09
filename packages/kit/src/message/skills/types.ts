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
