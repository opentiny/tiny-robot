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
      repo: string
      ref: string
      path: string
    }

export type SkillResolver = (input: SkillImportFormInput) => Promise<SkillDefinition>

export interface SkillImportFormProps {
  source?: SkillImportFormSource
  maxUploadSize?: number
  resolveSkill?: SkillResolver
}

export interface SkillImportFormEmits {
  (event: 'submit', definition: SkillDefinition): void
  (event: 'cancel'): void
}

/** Compatibility alias; use SkillImportFormSource for new code. */
export type SkillAddSource = SkillImportFormSource
/** Compatibility alias; use SkillImportFormInput for new code. */
export type SkillAddInput = SkillImportFormInput
/** Compatibility alias; use SkillImportFormProps for new code. */
export type SkillAddProps = SkillImportFormProps
/** Compatibility alias; use SkillImportFormEmits for new code. */
export type SkillAddEmits = SkillImportFormEmits
