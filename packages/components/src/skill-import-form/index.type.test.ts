import { SkillImportForm, TrSkillImportForm } from '../index'
import type { SkillDefinition as KitSkillDefinition } from '@opentiny/tiny-robot-kit'
import type {
  SkillDefinition,
  SkillImportFormEmits,
  SkillImportFormInput,
  SkillImportFormProps,
  SkillImportFormSource,
  SkillResolver,
} from '../index'

type ComponentsPublicApi = typeof import('../index')
type SkillAddValidationExportsAreInternal =
  Extract<
    keyof ComponentsPublicApi,
    'DEFAULT_SKILL_ADD_MAX_UPLOAD_SIZE' | 'validateSkillAddBrowserSelection'
  > extends never
    ? true
    : false

const source: SkillImportFormSource = 'local'
const localInput: SkillImportFormInput = { source, files: [] }
const githubInput: SkillImportFormInput = {
  source: 'github',
  url: 'https://github.com/opentiny/tiny-robot/tree/main/skills/demo',
  repo: 'opentiny/tiny-robot',
  ref: 'main',
  path: 'skills/demo',
}
const definition: SkillDefinition = {
  name: 'demo',
  description: 'Demo skill',
  instructions: '# Demo',
}
const resolver: SkillResolver = async (input) => ({ ...definition, metadata: { source: input.source } })
const props: SkillImportFormProps = {
  source: 'local',
  maxUploadSize: 10 * 1024 * 1024,
  resolveSkill: resolver,
}
const kitDefinition: KitSkillDefinition = definition
const compatibleDefinition: SkillDefinition = kitDefinition
const skillAddValidationExportsAreInternal: SkillAddValidationExportsAreInternal = true

declare const emit: SkillImportFormEmits
emit('submit', definition)
emit('cancel')

void SkillImportForm
void TrSkillImportForm
void localInput
void githubInput
void props
void compatibleDefinition
void skillAddValidationExportsAreInternal
