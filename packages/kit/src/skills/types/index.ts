export type SkillFileKind = 'text' | 'binary'

/**
 * skill 文件基础描述。
 */
interface SkillFileDescriptor {
  /**
   * skill 内相对路径。
   */
  path: string
  /**
   * 文件类型。
   */
  kind: SkillFileKind
  /**
   * 文件 MIME 类型。
   */
  mimeType?: string
  /**
   * 文件大小（字节）。
   */
  size?: number
  /**
   * 最后修改时间。
   */
  lastModified?: number
  /**
   * 自定义元数据。
   */
  metadata?: Record<string, unknown>
}

interface SkillResourceBase<K extends SkillFileKind> extends Omit<SkillFileDescriptor, 'kind'> {
  /**
   * 文件类型。
   */
  kind: K
  /** 资源 ID，用于在 storage 内定位文件内容。 */
  resourceId: string
}

type SkillTextResourceContent =
  | {
      /** 已加载的文本内容，适合内存中的完整 skill。 */
      text: string
      /** 读取文本内容。 */
      readText?: () => Promise<string>
    }
  | {
      /** 已加载的文本内容，适合内存中的完整 skill。 */
      text?: string
      /** 读取文本内容。 */
      readText: () => Promise<string>
    }

type SkillBinaryResourceContent =
  | {
      /** 已加载的二进制内容，适合内存中的完整 skill。 */
      binary: Uint8Array
      /** 读取二进制内容。 */
      readBinary?: () => Promise<Uint8Array>
    }
  | {
      /** 已加载的二进制内容，适合内存中的完整 skill。 */
      binary?: Uint8Array
      /** 读取二进制内容。 */
      readBinary: () => Promise<Uint8Array>
    }

/** skill 能力定义。 */
export interface SkillDefinition {
  /**
   * 唯一 skill 名称。
   */
  name: string
  /**
   * skill 描述。
   */
  description: string
  /**
   * 注入模型的 instructions。
   */
  instructions: string
  /**
   * skill 资源描述。
   */
  resources?: SkillResourceDescriptor[]
  /**
   * 自定义 metadata。
   */
  metadata?: Record<string, unknown>
}

/** selection 阶段暴露给模型的 skill 候选项。 */
export type SkillCandidate = Pick<SkillDefinition, 'name' | 'description' | 'metadata'>

/** skill 资源文件描述；文本资源至少包含 text/readText 之一，二进制资源至少包含 binary/readBinary 之一。 */
export type SkillResourceDescriptor =
  | (SkillResourceBase<'text'> &
      SkillTextResourceContent & {
        /** 已加载的二进制内容，适合内存中的完整 skill。 */
        binary?: Uint8Array
        /** 读取二进制内容。 */
        readBinary?: () => Promise<Uint8Array>
      })
  | (SkillResourceBase<'binary'> &
      SkillBinaryResourceContent & {
        /** 已加载的文本内容，适合内存中的完整 skill。 */
        text?: string
        /** 读取文本内容。 */
        readText?: () => Promise<string>
      })
