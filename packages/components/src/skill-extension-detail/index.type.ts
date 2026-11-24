import type { SkillDefinition } from '../skill-import-form/index.type'

export interface SkillExtensionDetailProps {
  definition: SkillDefinition
  updatedAt?: string
  mode?: 'view' | 'edit'
}

export type SkillFileSwitchDecision = 'save' | 'discard' | 'cancel'

export interface SkillExtensionDetailEmits {
  (event: 'save', definition: SkillDefinition): void
  (event: 'file-action', action: SkillFileAction): void
}

export type SkillFileActionType = 'create-file' | 'create-folder' | 'delete-file' | 'delete-folder' | 'rename'

export interface SkillFileAction {
  type: SkillFileActionType
  target: 'file' | 'folder'
  path: string
  nextPath?: string
}

export interface SkillVisualEditorSlotProps {
  content: string
  filePath: string
  updateContent: (content: string) => void
}

export interface SkillExtensionDetailSlots {
  'visual-editor'?: (props: SkillVisualEditorSlotProps) => unknown
}
