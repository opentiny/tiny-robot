export type SkillFileKind = 'text' | 'binary'

interface SkillResourceBase<K extends SkillFileKind> {
  path: string
  kind: K
  resourceId: string
  mimeType?: string
  size?: number
  lastModified?: number
  metadata?: Record<string, unknown>
}

type SkillTextResourceContent =
  | {
      text: string
      readText?: () => Promise<string>
    }
  | {
      text?: string
      readText: () => Promise<string>
    }

type SkillBinaryResourceContent =
  | {
      binary: Uint8Array
      readBinary?: () => Promise<Uint8Array>
    }
  | {
      binary?: Uint8Array
      readBinary: () => Promise<Uint8Array>
    }

export type SkillResourceDescriptor =
  | (SkillResourceBase<'text'> &
      SkillTextResourceContent & {
        binary?: Uint8Array
        readBinary?: () => Promise<Uint8Array>
      })
  | (SkillResourceBase<'binary'> &
      SkillBinaryResourceContent & {
        text?: string
        readText?: () => Promise<string>
      })

export interface SkillDefinition {
  name: string
  description: string
  instructions: string
  resources?: SkillResourceDescriptor[]
  metadata?: Record<string, unknown>
}

export type SkillImportFormSource = 'local' | 'github'

export type SkillImportFormInput =
  | {
      source: 'local'
      files: File[]
    }
  | {
      source: 'github'
      url: string
      /**
       * `owner/repo`，由 `url` 解析得到，供宿主直接使用。
       * ref 与目录的边界需要按仓库真实 refs 在线解析，因此不在输入中提供：默认 resolver 会完成解析，
       * 自定义 resolver 需要自行解析，或改用 kit 提供的解析能力。
       */
      repo: string
    }

export type SkillResolver = (input: SkillImportFormInput) => Promise<SkillDefinition>

export interface SkillImportFormProps {
  source?: SkillImportFormSource
  maxUploadSize?: number
  /**
   * 解析（导入）超时时间，单位毫秒；设为 0 表示不超时。
   * 超时后组件不再等待结果并提示用户，但在途请求不会被取消。
   */
  resolveTimeout?: number
  resolveSkill?: SkillResolver
}

export interface SkillImportFormEmits {
  (event: 'submit', definition: SkillDefinition): void
  (event: 'cancel'): void
}
