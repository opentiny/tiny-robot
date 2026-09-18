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

export type SkillAddSource = 'local' | 'github'

export type SkillAddInput =
  | {
      source: 'local'
      files: File[]
    }
  | {
      source: 'github'
      url: string
      repo: string
      ref: string
      path: string
    }

export type SkillResolver = (input: SkillAddInput) => Promise<SkillDefinition>

export interface SkillAddProps {
  source?: SkillAddSource
  maxUploadSize?: number
  resolveSkill?: SkillResolver
}

export interface SkillAddEmits {
  (event: 'submit', definition: SkillDefinition): void
  (event: 'cancel'): void
}
