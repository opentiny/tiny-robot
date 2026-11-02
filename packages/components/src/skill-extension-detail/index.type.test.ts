import { SkillExtensionDetail, TrSkillExtensionDetail } from '../index'
import type {
  SkillDefinition,
  SkillExtensionDetailEmits,
  SkillExtensionDetailProps,
  SkillExtensionDetailSlots,
  SkillFileAction,
  SkillVisualEditorSlotProps,
} from '../index'

const definition: SkillDefinition = {
  name: 'demo',
  description: 'Demo Skill',
  instructions: 'Follow the instructions.',
}

const props: SkillExtensionDetailProps = {
  definition,
  updatedAt: '2026-07-10',
  mode: 'edit',
}

const visualEditor: SkillVisualEditorSlotProps = {
  content: '# Draft',
  filePath: 'SKILL.md',
  updateContent: (content) => {
    const draft: string = content
    void draft
  },
}
const slots: SkillExtensionDetailSlots = {
  'visual-editor': ({ content, filePath, updateContent }) => {
    const path: string = filePath
    updateContent(content)
    void path
    return []
  },
}
slots['visual-editor']?.(visualEditor)

declare const emit: SkillExtensionDetailEmits
emit('save', definition)
const fileAction: SkillFileAction = { type: 'rename', target: 'file', path: 'old.md', nextPath: 'new.md' }
emit('file-action', fileAction)

void SkillExtensionDetail
void TrSkillExtensionDetail
void props
