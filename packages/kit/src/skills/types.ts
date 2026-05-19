export type SkillFileKind = 'text' | 'binary'

/**
 * skill 文件的公共元数据。
 */
export interface BaseSkillFile {
  /**
   * 基于 skill 根目录的相对路径，使用 "/" 分隔，不能以 "/" 开头，也不能包含 ".." 片段。
   */
  path: string
  /**
   * 文件来源提供的 MIME 类型。
   */
  mimeType?: string
  /**
   * 文件大小，单位为字节。
   */
  size?: number
  /**
   * 文件来源提供的最后修改时间戳。
   */
  lastModified?: number
  /**
   * 应用侧自定义的来源元数据。
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
   * 所属 skill 内唯一的文件标识。
   */
  id: string
}

/**
 * skill 能力模板。
 *
 * skill 可以提供指令、工具和文件资源，并被编译到消息请求中。
 */
export interface SkillDefinition {
  /**
   * 唯一的 skill 名称。
   */
  name: string
  /**
   * 用于发现、匹配或展示的能力描述。
   */
  description: string
  /**
   * 注入模型请求的指令。
   */
  instructions: string
  /**
   * 可供 skill 文件运行时工具读取的文件。
   */
  files?: SkillFileResource[]
  /**
   * 应用侧自定义元数据。
   */
  metadata?: Record<string, unknown>
}
